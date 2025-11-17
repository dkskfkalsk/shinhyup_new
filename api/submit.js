const { URLSearchParams } = require('url');
const crypto = require('crypto');

const DEFAULT_JWT_TTL_SECONDS = 300;

function base64UrlEncode(input) {
    const value = (typeof input === 'string') ? input : JSON.stringify(input);
    return Buffer.from(value)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');
}

function createJwtToken({ secret, issuer, audience, ttlSeconds = DEFAULT_JWT_TTL_SECONDS }) {
    if (!secret) {
        throw new Error('JWT_SECRET_MISSING');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iat: now,
        exp: now + ttlSeconds
    };

    if (issuer) {
        payload.iss = issuer;
    }

    if (audience) {
        payload.aud = audience;
    }

    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const encodedHeader = base64UrlEncode(header);
    const encodedPayload = base64UrlEncode(payload);
    const signature = crypto
        .createHmac('sha256', secret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function readRequestBody(req) {
    const chunks = [];

    for await (const chunk of req) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString();
    const contentType = (req.headers['content-type'] || '').toLowerCase();

    if (!raw) {
        return {};
    }

    if (contentType.includes('application/json')) {
        try {
            return JSON.parse(raw);
        } catch (error) {
            throw new Error('INVALID_JSON_BODY');
        }
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
        const params = new URLSearchParams(raw);
        return Object.fromEntries(params.entries());
    }

    return { rawBody: raw };
}

module.exports = async (req, res) => {
    // CORS 헤더 설정
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['*'];
    
    if (allowedOrigins.includes('*') || (origin && allowedOrigins.includes(origin))) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');

    // OPTIONS 요청 처리 (CORS preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    const authToken = process.env.N8N_AUTH_TOKEN;
    const jwtSecret = process.env.JWT_SECRET;
    const jwtIssuer = process.env.JWT_ISSUER;
    const jwtAudience = process.env.JWT_AUDIENCE;
    const jwtTtlSeconds = parseInt(process.env.JWT_TTL_SECONDS || DEFAULT_JWT_TTL_SECONDS, 10);

    if (!webhookUrl) {
        res.status(500).json({ error: 'Missing webhook configuration' });
        return;
    }

    let incomingPayload;

    try {
        incomingPayload = await readRequestBody(req);
    } catch (error) {
        if (error.message === 'INVALID_JSON_BODY') {
            res.status(400).json({ error: 'Invalid JSON body' });
            return;
        }

        res.status(500).json({ error: 'Failed to parse request body' });
        return;
    }

    const payload = {
        ...incomingPayload,
        clientIp: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
        userAgent: req.headers['user-agent'] || null,
        submittedAt: new Date().toISOString()
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    if (jwtSecret) {
        try {
            const token = createJwtToken({
                secret: jwtSecret,
                issuer: jwtIssuer,
                audience: jwtAudience,
                ttlSeconds: Number.isFinite(jwtTtlSeconds) ? jwtTtlSeconds : DEFAULT_JWT_TTL_SECONDS
            });

            headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
            console.error('Failed to generate JWT token', error);
            res.status(500).json({ error: 'Failed to generate authorization token' });
            return;
        }
    } else if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('n8n webhook error:', response.status, text);
            res.status(response.status).json({ error: 'Webhook request failed' });
            return;
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Failed to call n8n webhook', error);
        res.status(502).json({ error: 'Failed to call webhook' });
    }
};


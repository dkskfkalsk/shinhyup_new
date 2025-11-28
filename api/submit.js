const { URLSearchParams } = require('url');

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

    // 텔레그램 메시지 전송 함수
async function sendTelegramMessage(botToken, chatId, message) {
    // 토큰 유효성 검사
    if (!botToken || botToken.trim().length === 0) {
        throw new Error('Telegram bot token is empty');
    }
    
    // 토큰에서 "bot" 접두사 제거 (있는 경우)
    const cleanToken = botToken.startsWith('bot') ? botToken.substring(3) : botToken;
    
    const telegramUrl = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    
    try {
        console.log(`Sending Telegram message to chat ID: ${chatId}`);
        console.log(`Telegram URL: https://api.telegram.org/bot${cleanToken.substring(0, 10)}.../sendMessage`);
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error('Telegram API error:', {
                status: response.status,
                statusText: response.statusText,
                response: responseText
            });
            
            let errorMessage = `Telegram API error: ${response.status}`;
            try {
                const errorJson = JSON.parse(responseText);
                if (errorJson.description) {
                    errorMessage += ` - ${errorJson.description}`;
                }
            } catch (e) {
                errorMessage += ` - ${responseText.substring(0, 100)}`;
            }
            
            throw new Error(errorMessage);
        }

        const result = JSON.parse(responseText);
        console.log('Telegram message sent successfully:', result.ok);
        return result;
    } catch (error) {
        console.error('Failed to send Telegram message:', {
            chatId,
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// 구글 시트에 데이터 저장 함수
async function saveToGoogleSheets(scriptUrl, scriptToken, data) {
    try {
        const payload = {
            uname: data.uname || '',
            tel: data.tel || '',
            message: data.message || '',
            clientIp: data.clientIp || '',
            submittedAt: data.submittedAt || new Date().toISOString()
        };

        // 보안 토큰이 설정되어 있으면 추가
        if (scriptToken) {
            payload.token = scriptToken;
        }

        console.log('Sending data to Google Sheets:', {
            url: scriptUrl.substring(0, 50) + '...',
            hasToken: !!scriptToken,
            dataKeys: Object.keys(payload)
        });

        // Apps Script는 redirect를 따라가야 하므로 redirect: 'follow' 추가
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            redirect: 'follow' // 리다이렉트 자동 따라가기
        });

        const responseText = await response.text();

        // 401 오류는 보통 URL이 잘못되었거나 권한 문제
        if (response.status === 401) {
            console.error('Google Apps Script 401 error - Check URL and permissions:', {
                status: response.status,
                url: scriptUrl.substring(0, 80) + '...',
                responsePreview: responseText.substring(0, 200)
            });
            throw new Error(`Google Sheets API error: 401 - URL이 잘못되었거나 권한이 없습니다. Apps Script URL과 권한 설정을 확인하세요.`);
        }

        if (!response.ok) {
            console.error('Google Apps Script error:', {
                status: response.status,
                statusText: response.statusText,
                response: responseText.substring(0, 500)
            });
            throw new Error(`Google Sheets API error: ${response.status} - ${responseText.substring(0, 100)}`);
        }

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            result = { success: true, raw: responseText };
        }

        console.log('Google Sheets saved successfully');
        return result;
    } catch (error) {
        console.error('Failed to save to Google Sheets:', {
            error: error.message,
            stack: error.stack
        });
        throw error;
    }
}

// 텔레그램 메시지 포맷팅 함수
function formatTelegramMessage(data) {
    const timestamp = new Date(data.submittedAt || Date.now()).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // HTML 형식으로 포맷팅 (Telegram HTML parse_mode 사용)
    return `<b>신협접수</b>

1. 접수시간: ${timestamp}

2. 고객명: ${data.uname || '미입력'}

3. 연락처: ${data.tel || '미입력'}

4. 접수내용: ${data.message || '없음'}`;
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

    // 환경 변수 확인 및 디버깅 로그
    const googleScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    const googleScriptToken = process.env.GOOGLE_APPS_SCRIPT_TOKEN;
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatIds = process.env.TELEGRAM_CHAT_ID;

    // 디버깅: 환경 변수 확인 (민감한 정보는 마스킹)
    console.log('=== Environment Variables Check ===');
    console.log('GOOGLE_APPS_SCRIPT_URL:', googleScriptUrl ? `${googleScriptUrl.substring(0, 30)}...` : 'MISSING');
    console.log('GOOGLE_APPS_SCRIPT_TOKEN:', googleScriptToken ? 'SET' : 'NOT SET');
    console.log('TELEGRAM_BOT_TOKEN:', telegramBotToken ? `${telegramBotToken.substring(0, 10)}...` : 'MISSING');
    console.log('TELEGRAM_CHAT_ID:', telegramChatIds ? `${telegramChatIds.substring(0, 20)}...` : 'MISSING');

    // 필수 환경 변수 확인
    if (!googleScriptUrl) {
        console.error('Missing GOOGLE_APPS_SCRIPT_URL');
        res.status(500).json({ error: 'Missing Google Sheets configuration' });
        return;
    }

    if (!telegramBotToken || !telegramChatIds) {
        console.error('Missing Telegram configuration');
        console.error('TELEGRAM_BOT_TOKEN:', telegramBotToken ? 'SET' : 'MISSING');
        console.error('TELEGRAM_CHAT_ID:', telegramChatIds ? 'SET' : 'MISSING');
        res.status(500).json({ error: 'Missing Telegram configuration' });
        return;
    }

    // 여러 채팅 ID를 쉼표로 구분하여 배열로 변환
    const chatIdArray = telegramChatIds
        .split(',')
        .map(id => id.trim())
        .filter(id => id.length > 0);

    console.log('Parsed Chat IDs:', chatIdArray.length, 'chats');

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

    // 데이터 준비
    const clientIp = req.headers['x-forwarded-for'] 
        ? req.headers['x-forwarded-for'].split(',')[0].trim()
        : req.socket.remoteAddress || 'Unknown';

    const payload = {
        ...incomingPayload,
        clientIp: clientIp,
        userAgent: req.headers['user-agent'] || null,
        submittedAt: new Date().toISOString()
    };

    console.log('=== Form Submission Received ===');
    console.log('Payload:', {
        uname: payload.uname,
        tel: payload.tel ? `${payload.tel.substring(0, 3)}***` : 'empty',
        message: payload.message ? `${payload.message.substring(0, 20)}...` : 'empty',
        clientIp: payload.clientIp,
        submittedAt: payload.submittedAt
    });

    const results = {
        googleSheets: null,
        telegram: null,
        errors: []
    };

    // 1. 구글 시트에 저장
    try {
        results.googleSheets = await saveToGoogleSheets(googleScriptUrl, googleScriptToken, payload);
        console.log('Google Sheets saved successfully');
    } catch (error) {
        console.error('Google Sheets save failed:', error);
        results.errors.push({ service: 'Google Sheets', error: error.message });
    }

    // 2. 텔레그램 메시지 전송 (여러 채팅방에 전송)
    const telegramMessage = formatTelegramMessage(payload);
    results.telegram = [];
    
    for (const chatId of chatIdArray) {
        try {
            const result = await sendTelegramMessage(telegramBotToken, chatId, telegramMessage);
            results.telegram.push({ chatId, success: true, result });
            console.log(`Telegram message sent successfully to ${chatId}`);
        } catch (error) {
            console.error(`Telegram send failed to ${chatId}:`, error);
            results.telegram.push({ chatId, success: false, error: error.message });
            results.errors.push({ service: 'Telegram', chatId, error: error.message });
        }
    }

    // 결과 반환
    console.log('=== Final Results ===');
    console.log('Google Sheets:', results.googleSheets ? 'SUCCESS' : 'FAILED');
    console.log('Telegram:', results.telegram ? `${results.telegram.filter(t => t.success).length}/${results.telegram.length} sent` : 'FAILED');
    console.log('Errors:', results.errors.length);

    if (results.errors.length > 0) {
        // 일부 실패한 경우에도 200 반환 (부분 성공)
        console.warn('Partial success - some services failed');
        res.status(200).json({ 
            success: true, 
            partial: true,
            results: results 
        });
    } else {
        // 모두 성공
        console.log('All services succeeded');
        res.status(200).json({ 
            success: true,
            results: results 
        });
    }
};


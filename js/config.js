/**
 * 사이트 설정 파일
 * Vercel 배포 시 자동으로 현재 도메인을 감지하며,
 * 로컬 개발이나 커스텀 도메인 설정이 필요한 경우 여기서 변경하세요.
 */

// ========================================
// 기본 설정
// ========================================

// 사이트 도메인 (자동 감지되지 않을 경우 사용할 기본값)
// 예: 'shinhyupsales.duckdns.org' 또는 null로 두면 자동 감지
const DEFAULT_DOMAIN = 'shinhyupsales.duckdns.org';

// n8n 웹훅 엔드포인트 (폼 제출 시 사용)
const N8N_WEBHOOK_URL = "https://your-n8n.example.com/webhook/credit-form";

// 신청 완료 후 이동할 페이지 (null이면 alert만 표시)
const THANK_YOU_URL = null; // 예: "/thanks.html"

// ========================================
// 자동 설정 (수정 불필요)
// ========================================

(function() {
    // 현재 페이지의 도메인 자동 감지
    let siteDomain, siteProtocol, siteUrl;
    
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        
        // 로컬 개발 환경 체크
        const isLocalDev = (
            window.location.protocol === 'file:' ||
            hostname === 'localhost' ||
            hostname === '127.0.0.1' ||
            hostname === ''
        );
        
        if (isLocalDev) {
            // 로컬 개발 환경: 기본값 사용 또는 지정된 도메인
            siteDomain = DEFAULT_DOMAIN || 'localhost';
            siteProtocol = 'https:';
        } else {
            // 프로덕션 환경: 현재 페이지의 도메인 자동 사용
            siteDomain = hostname;
            siteProtocol = window.location.protocol;
        }
        
        siteUrl = siteProtocol + '//' + siteDomain;
    } else {
        // Node.js 환경 (빌드 시) 등
        siteDomain = DEFAULT_DOMAIN || 'localhost';
        siteProtocol = 'https:';
        siteUrl = siteProtocol + '//' + siteDomain;
    }
    
    // 전역 변수로 설정
    window.SITE_CONFIG = {
        domain: siteDomain,
        protocol: siteProtocol,
        url: siteUrl,
        n8nWebhookUrl: N8N_WEBHOOK_URL,
        thankYouUrl: THANK_YOU_URL,
        // Vercel URL (Vercel 배포 시 자동 감지)
        vercelUrl: (typeof window !== 'undefined' && window.location) 
            ? window.location.origin 
            : siteUrl
    };
    
    // 호환성을 위한 별칭
    window.SITE_DOMAIN = siteDomain;
    window.SITE_PROTOCOL = siteProtocol;
    window.SITE_URL = siteUrl;
    window.N8N_WEBHOOK_URL = N8N_WEBHOOK_URL;
    window.THANK_YOU_URL = THANK_YOU_URL;
    window.VERCEL_URL = window.SITE_CONFIG.vercelUrl;
})();


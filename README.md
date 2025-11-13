# 신협 사이트

정적 HTML 기반 랜딩 페이지

## 🚀 배포 방법

### Vercel 배포

1. GitHub에 저장소를 만듭니다
2. Vercel에 로그인하고 "New Project" 선택
3. GitHub 저장소를 연결
4. 배포 완료! 🎉

**도메인은 자동으로 감지됩니다.** 커스텀 도메인을 연결해도 자동으로 작동합니다.

## ⚙️ 설정 방법

### 1. 환경 변수 설정 (필수)

- Vercel 프로젝트의 **Settings > Environment Variables**로 이동합니다.
- `N8N_WEBHOOK_URL`, `N8N_AUTH_TOKEN` 두 값을 **Sensitive** 타입으로 등록하세요.
- 프리뷰와 프로덕션 환경에 모두 추가하는 것을 권장합니다.

### 2. 기본 도메인 설정 (선택사항)

로컬 개발이나 특정 도메인을 강제로 사용하려면 `js/config.js`에서 설정:

```javascript
const DEFAULT_DOMAIN = 'shinhyupsales.duckdns.org';
```

**참고**: Vercel에 배포하면 자동으로 현재 도메인(`window.location.hostname`)을 사용하므로 별도 설정이 필요 없습니다.

### 3. 신청 완료 페이지

폼 제출 후 이동할 페이지가 있다면:

```javascript
const THANK_YOU_URL = "/thanks.html"; // 또는 전체 URL
```

## 📁 파일 구조

```
├── index.html          # 메인 페이지
├── api/
│   └── submit.js       # Vercel 서버리스 API (n8n 연동)
├── js/
│   ├── config.js       # ⭐ 설정 파일 (여기서 변경!)
│   ├── jquery.js
│   ├── scroll.js
│   └── swiper-bundle.min.js
├── css/                # 스타일시트
├── images/             # 이미지 파일
└── font/               # 폰트 파일
```

## 🛠️ 로컬 개발

### 간단한 방법
브라우저에서 `index.html`을 직접 열기 (로컬 개발 모드로 동작)

### 로컬 서버 (권장)
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# 그 다음 브라우저에서
# http://localhost:8000 접속
```

## ✨ 주요 기능

- ✅ 로컬/프로덕션 환경 자동 감지
- ✅ 도메인 자동 감지 (Vercel 배포 시)
- ✅ 서버리스 API를 통한 n8n 웹훅 연동 (토큰 비노출)
- ✅ 외부 추적 스크립트 (로컬에서는 로드 안 함)

## 📝 설정 변경 요약

| 변경 내용 | 수정 파일 |
|---------|---------|
| 환경 변수(N8N URL/Token) | Vercel 프로젝트 설정 |
| 기본 도메인 | `js/config.js` |
| 신청 완료 페이지 | `js/config.js` |
| 사이트 내용 | `index.html` |

## 🔐 보안 구성 개요

- 브라우저는 웹훅 URL/토큰을 직접 알지 못합니다. `/api/submit` 서버리스 함수가 대신 전송합니다.
- `api/submit.js`는 Vercel 환경 변수에 저장된 민감 정보를 읽고 Authorization Bearer 토큰을 헤더로 추가합니다.
- n8n 웹훅에서 동일한 토큰을 검증하도록 설정해야 합니다.
- Vercel Deployment Protection을 활성화하면 프리뷰 배포 접근도 제한할 수 있습니다.

**중요**: HTML 파일에 도메인을 하드코딩하지 마세요! 모든 설정은 `js/config.js`에서 관리됩니다.

## 🔍 문제 해결

### 로컬에서 느리게 로딩되는 경우
- 정상입니다. 로컬 개발 모드에서는 외부 추적 스크립트가 로드되지 않아 더 빠릅니다.

### 도메인이 자동 감지되지 않는 경우
- `js/config.js`의 `DEFAULT_DOMAIN`을 확인하세요.

### n8n 웹훅이 작동하지 않는 경우
- `js/config.js`의 `N8N_WEBHOOK_URL`이 올바른지 확인하세요.
- CORS 설정이 올바른지 확인하세요.


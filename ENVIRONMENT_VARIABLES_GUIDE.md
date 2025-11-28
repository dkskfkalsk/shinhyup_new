# Vercel 환경 변수 설정 가이드

## 📋 필요한 환경 변수 목록

다음 환경 변수들을 Vercel 대시보드에 설정해야 합니다.

### 1. Google Apps Script 설정

#### `GOOGLE_APPS_SCRIPT_URL`
- **설명**: Google Apps Script Web App URL
- **설정 방법**:
  1. 구글 시트에서 Apps Script 에디터 열기
  2. 코드 작성 후 저장
  3. **배포 > 새 배포** 클릭
  4. **종류 선택**: 웹 앱
  5. **실행 대상**: 나
  6. **액세스 권한**: 모든 사용자
  7. 배포 후 생성된 **Web App URL** 복사
  8. Vercel 환경 변수에 붙여넣기
- **예시**: `https://script.google.com/macros/s/AKfycby.../exec`

#### `GOOGLE_APPS_SCRIPT_TOKEN` (선택사항, 권장)
- **설명**: 보안 토큰 (Apps Script와 동일하게 설정)
- **설정 방법**:
  1. 강력한 랜덤 문자열 생성 (예: `my-secret-token-12345-abcde`)
  2. Apps Script 코드의 `SECRET_TOKEN` 변수에 설정
  3. Vercel 환경 변수에도 동일한 값 설정
- **예시**: `my-super-secret-token-2024`

### 2. Telegram Bot 설정

#### `TELEGRAM_BOT_TOKEN`
- **설명**: Telegram Bot API 토큰
- **설정 방법**:
  1. Telegram에서 [@BotFather](https://t.me/BotFather) 검색
  2. `/newbot` 명령어 입력
  3. 봇 이름 입력 (예: "신협 접수 봇")
  4. 봇 사용자명 입력 (예: "shinhyup_bot")
  5. BotFather가 제공하는 **토큰** 복사
  6. Vercel 환경 변수에 붙여넣기
- **예시**: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

#### `TELEGRAM_CHAT_ID`
- **설명**: 메시지를 받을 채팅방 또는 사용자 ID (여러 개 설정 가능)
- **설정 방법**:
  
  **단일 채팅방:**
  - 하나의 채팅 ID만 입력
  
  **여러 채팅방 (쉼표로 구분):**
  - 여러 채팅 ID를 쉼표(`,`)로 구분하여 입력
  - 예: `123456789,987654321,-123456789`
  - 공백은 자동으로 제거되지만, 입력 시 공백 없이 입력하는 것을 권장
  
  **Chat ID 확인 방법:**
  
  **방법 1: 개인 채팅 (봇과의 1:1 채팅)**
  1. 생성한 봇과 1:1 채팅 시작
  2. 봇에게 아무 메시지나 보내기 (예: `/start`)
  3. 브라우저에서 다음 URL 접속:
     ```
     https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
     ```
     (`<YOUR_BOT_TOKEN>`을 실제 토큰으로 교체)
  4. JSON 응답에서 `"chat":{"id":123456789}` 부분의 숫자 복사
  5. Vercel 환경 변수에 붙여넣기
  
  **방법 2: 그룹 채팅**
  1. 그룹에 봇 추가
  2. 봇에게 메시지 보내기
  3. 위와 동일하게 `getUpdates` API로 채팅 ID 확인
  4. 그룹 채팅 ID는 보통 음수입니다 (예: `-123456789`)
  
  **방법 3: @userinfobot 사용 (더 쉬운 방법)**
  1. Telegram에서 [@userinfobot](https://t.me/userinfobot) 검색
  2. 봇과 채팅 시작
  3. 봇이 제공하는 **Your user ID** 복사
  4. Vercel 환경 변수에 붙여넣기
  
- **예시**: 
  - 단일: `123456789`
  - 여러 개: `123456789,987654321,-123456789`

## 🚀 Vercel에 환경 변수 설정하는 방법

### 방법 1: Vercel 대시보드에서 설정 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 접속
   - 프로젝트 선택

2. **환경 변수 설정**
   - 프로젝트 설정 클릭
   - 왼쪽 메뉴에서 **Environment Variables** 클릭
   - **Add New** 버튼 클릭

3. **각 환경 변수 추가**
   - **Name**: 환경 변수 이름 (예: `TELEGRAM_BOT_TOKEN`)
   - **Value**: 환경 변수 값 (예: `1234567890:ABC...`)
   - **Environment**: 
     - Production (프로덕션)
     - Preview (프리뷰)
     - Development (개발)
     - 모두 선택하거나 필요한 환경만 선택
   - **Save** 클릭

4. **모든 환경 변수 추가 완료 후**
   - 변경사항이 자동으로 배포에 반영됩니다
   - 또는 수동으로 **Redeploy** 클릭

### 방법 2: Vercel CLI로 설정

```bash
# Vercel CLI 설치 (없는 경우)
npm i -g vercel

# 프로젝트 디렉토리에서 로그인
vercel login

# 환경 변수 추가
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
vercel env add GOOGLE_APPS_SCRIPT_URL
vercel env add GOOGLE_APPS_SCRIPT_TOKEN
```

## ✅ 설정 확인 체크리스트

- [ ] Google Apps Script 코드 작성 및 배포 완료
- [ ] `GOOGLE_APPS_SCRIPT_URL` 환경 변수 설정 완료
- [ ] `GOOGLE_APPS_SCRIPT_TOKEN` 환경 변수 설정 완료 (선택)
- [ ] Telegram Bot 생성 완료
- [ ] `TELEGRAM_BOT_TOKEN` 환경 변수 설정 완료
- [ ] `TELEGRAM_CHAT_ID` 확인 및 환경 변수 설정 완료
- [ ] Vercel 프로젝트 재배포 완료

## 🧪 테스트 방법

### 1. Telegram 봇 테스트
```bash
# 브라우저에서 접속 (YOUR_BOT_TOKEN을 실제 토큰으로 교체)
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
```
정상 응답이 오면 봇이 제대로 생성된 것입니다.

### 2. Google Apps Script 테스트
```bash
# 브라우저에서 접속 (YOUR_SCRIPT_URL을 실제 URL로 교체)
<YOUR_SCRIPT_URL>
```
`{"message":"Google Apps Script Web App is running","method":"GET"}` 응답이 오면 정상입니다.

### 3. 전체 플로우 테스트
1. 웹사이트에서 폼 제출
2. 구글 시트에 데이터가 추가되는지 확인
3. Telegram에 메시지가 전송되는지 확인

## 🔒 보안 주의사항

1. **환경 변수는 절대 코드에 하드코딩하지 마세요**
2. **GitHub에 토큰이나 비밀번호를 커밋하지 마세요**
3. **`.env` 파일은 `.gitignore`에 추가되어 있는지 확인하세요**
4. **Telegram Bot 토큰과 Google Apps Script 토큰은 정기적으로 변경하는 것을 권장합니다**

## 📞 문제 해결

### Telegram 메시지가 오지 않는 경우
- `TELEGRAM_BOT_TOKEN`이 올바른지 확인
- `TELEGRAM_CHAT_ID`가 올바른지 확인 (음수 포함)
- 봇과 채팅을 시작했는지 확인

### Google Sheets에 데이터가 저장되지 않는 경우
- `GOOGLE_APPS_SCRIPT_URL`이 올바른지 확인
- Apps Script에서 권한 승인을 완료했는지 확인
- 구글 시트 ID가 올바른지 확인
- Apps Script 코드의 `SPREADSHEET_ID`가 올바른지 확인

### Vercel 배포 후에도 환경 변수가 적용되지 않는 경우
- 환경 변수 설정 후 **Redeploy** 클릭
- 환경 변수가 올바른 Environment(Production/Preview/Development)에 설정되었는지 확인


# 🔍 디버깅 가이드

전송이 안 되는 경우 다음 단계로 오류를 확인하세요.

## 1️⃣ Vercel 로그 확인 (가장 중요!)

### 방법 1: Vercel 대시보드에서 확인
1. **Vercel 대시보드** 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. 상단 메뉴에서 **"Functions"** 또는 **"Logs"** 클릭
4. 최근 배포의 로그 확인
5. 폼 제출 시 생성된 로그 확인

### 방법 2: 실시간 로그 확인
1. Vercel 대시보드 → 프로젝트 → **"Deployments"**
2. 최신 배포 클릭
3. **"Functions"** 탭 클릭
4. `/api/submit` 함수 클릭
5. **"View Function Logs"** 클릭

### 확인할 로그 내용
다음과 같은 로그가 보여야 합니다:
```
=== Environment Variables Check ===
GOOGLE_APPS_SCRIPT_URL: https://script.google.com/macros/s/...
TELEGRAM_BOT_TOKEN: 1234567890:...
TELEGRAM_CHAT_ID: 123456789,987654321
=== Form Submission Received ===
=== Final Results ===
```

## 2️⃣ 환경 변수 확인 체크리스트

### ✅ 필수 환경 변수 확인
- [ ] `GOOGLE_APPS_SCRIPT_URL` - 설정되어 있는가?
- [ ] `TELEGRAM_BOT_TOKEN` - 설정되어 있는가?
- [ ] `TELEGRAM_CHAT_ID` - 설정되어 있는가?

### ✅ 환경 변수 값 확인
1. Vercel 대시보드 → Settings → Environment Variables
2. 각 환경 변수가 올바른 Environment에 설정되었는지 확인
   - Production
   - Preview
   - Development
3. **중요**: 환경 변수 변경 후 **Redeploy** 필수!

## 3️⃣ 브라우저 콘솔 확인

### 방법
1. 웹사이트에서 **F12** 또는 **우클릭 → 검사** 클릭
2. **Console** 탭 클릭
3. 폼 제출 시도
4. 에러 메시지 확인

### 확인할 내용
- 네트워크 요청이 성공했는지 (200 OK)
- 에러 메시지가 있는지

## 4️⃣ 각 서비스별 확인

### 📊 Google Sheets 확인

#### Apps Script URL 확인
1. 브라우저에서 Apps Script URL 직접 접속
   ```
   https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
2. `{"message":"Google Apps Script Web App is running","method":"GET"}` 응답이 오는지 확인

#### Apps Script 권한 확인
1. 구글 시트에서 Apps Script 에디터 열기
2. 코드 저장 후 **실행** 버튼 클릭
3. 권한 승인 완료했는지 확인

#### 시트 ID 확인
- Apps Script 코드의 `SPREADSHEET_ID`가 올바른지 확인
- 현재 설정: `17fKb6pNg1rHrLm-Jd4QxKiDsnQUPwI40dy9UBcegOf4`

#### 보안 토큰 확인 (선택사항)
- `GOOGLE_APPS_SCRIPT_TOKEN`이 설정되어 있다면
- Apps Script 코드의 `SECRET_TOKEN`과 동일한지 확인

### 📱 Telegram 확인

#### 봇 토큰 확인
1. 브라우저에서 접속 (YOUR_BOT_TOKEN을 실제 토큰으로 교체):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getMe
   ```
2. 정상 응답이 오는지 확인:
   ```json
   {
     "ok": true,
     "result": {
       "id": 123456789,
       "is_bot": true,
       "first_name": "봇 이름",
       "username": "봇_사용자명"
     }
   }
   ```

#### Chat ID 확인
1. 봇과 채팅 시작 (봇에게 메시지 보내기)
2. 브라우저에서 접속:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. JSON 응답에서 `"chat":{"id":...}` 값 확인
4. 여러 채팅방인 경우 쉼표로 구분:
   ```
   123456789,987654321,-123456789
   ```

#### 봇 권한 확인
- 개인 채팅: 봇과 1:1 채팅을 시작했는지 확인
- 그룹 채팅: 그룹에 봇이 추가되어 있는지 확인

## 5️⃣ 일반적인 오류와 해결 방법

### 오류 1: "Missing Google Sheets configuration"
**원인**: `GOOGLE_APPS_SCRIPT_URL` 환경 변수가 설정되지 않음
**해결**: Vercel 환경 변수에 추가 후 Redeploy

### 오류 2: "Missing Telegram configuration"
**원인**: `TELEGRAM_BOT_TOKEN` 또는 `TELEGRAM_CHAT_ID`가 설정되지 않음
**해결**: 환경 변수 확인 후 Redeploy

### 오류 3: "Telegram API error: 400"
**원인**: 
- Chat ID가 잘못됨
- 봇과 채팅을 시작하지 않음
- 봇 토큰이 잘못됨

**해결**:
1. Chat ID 다시 확인
2. 봇과 채팅 시작
3. 봇 토큰 확인

### 오류 4: "Telegram API error: 401"
**원인**: 봇 토큰이 잘못됨
**해결**: BotFather에서 새 토큰 발급 후 환경 변수 업데이트

### 오류 5: "Google Sheets API error: 401"
**원인**: Apps Script 권한 승인 안 됨
**해결**: Apps Script에서 권한 승인 완료

### 오류 6: "Google Sheets API error: 403"
**원인**: 
- Apps Script Web App 접근 권한이 "나"로만 설정됨
- 보안 토큰이 일치하지 않음

**해결**:
1. Apps Script 배포 설정에서 "액세스 권한: 모든 사용자"로 변경
2. 보안 토큰 확인

### 오류 7: 데이터는 저장되지만 텔레그램 메시지가 안 옴
**원인**: 
- Chat ID가 잘못됨
- 봇과 채팅을 시작하지 않음

**해결**: Chat ID 확인 및 봇과 채팅 시작

## 6️⃣ 테스트 방법

### 1. 환경 변수 테스트
Vercel 로그에서 다음 메시지 확인:
```
=== Environment Variables Check ===
GOOGLE_APPS_SCRIPT_URL: [URL이 보임]
TELEGRAM_BOT_TOKEN: [토큰 일부가 보임]
TELEGRAM_CHAT_ID: [Chat ID가 보임]
```

### 2. 폼 제출 테스트
1. 웹사이트에서 폼 제출
2. Vercel 로그 확인:
   ```
   === Form Submission Received ===
   === Final Results ===
   Google Sheets: SUCCESS
   Telegram: 2/2 sent
   ```

### 3. 개별 서비스 테스트

#### Google Sheets 테스트
- Apps Script URL을 브라우저에서 직접 접속
- `doGet` 함수가 정상 작동하는지 확인

#### Telegram 테스트
- 브라우저에서 접속:
  ```
  https://api.telegram.org/bot<TOKEN>/sendMessage?chat_id=<CHAT_ID>&text=테스트
  ```
- 메시지가 오는지 확인

## 7️⃣ 빠른 체크리스트

전송이 안 될 때 다음을 순서대로 확인:

1. ✅ **Vercel 로그 확인** - 가장 중요!
2. ✅ **환경 변수 설정 확인** - 모두 설정되었는지
3. ✅ **환경 변수 변경 후 Redeploy** - 필수!
4. ✅ **Google Apps Script URL 테스트** - 브라우저에서 접속
5. ✅ **Telegram 봇 토큰 테스트** - getMe API 호출
6. ✅ **Telegram Chat ID 확인** - getUpdates API 호출
7. ✅ **봇과 채팅 시작** - 필수!
8. ✅ **Apps Script 권한 승인** - 필수!

## 8️⃣ 도움이 필요한 경우

위의 모든 단계를 확인했는데도 문제가 해결되지 않으면:

1. **Vercel 로그 전체 복사**
2. **환경 변수 이름 확인** (대소문자 정확한지)
3. **브라우저 콘솔 에러 메시지 확인**
4. **각 서비스별 테스트 결과 확인**

이 정보들을 함께 제공하면 더 정확한 진단이 가능합니다.


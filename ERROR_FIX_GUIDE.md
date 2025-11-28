# 🔧 오류 해결 가이드

## 현재 발생한 오류

### 오류 1: Telegram 404 "Not Found"
**원인**: 봇 토큰이 잘못되었거나, 봇이 삭제되었을 수 있습니다.

### 오류 2: Google Sheets 401
**원인**: Apps Script 배포 설정이 아직 변경되지 않았습니다.

---

## 🔴 Telegram 404 오류 해결

### 1단계: 봇 토큰 확인

브라우저에서 직접 테스트:
```
https://api.telegram.org/bot6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI/getMe
```

**정상 응답 예시:**
```json
{
  "ok": true,
  "result": {
    "id": 6613648395,
    "is_bot": true,
    "first_name": "봇 이름",
    "username": "봇_사용자명"
  }
}
```

**오류 응답 예시:**
```json
{
  "ok": false,
  "error_code": 401,
  "description": "Unauthorized"
}
```
→ 토큰이 잘못되었거나 봇이 삭제됨

### 2단계: Vercel 환경 변수 확인

1. Vercel 대시보드 → Settings → Environment Variables
2. `TELEGRAM_BOT_TOKEN` 확인
3. 값이 정확히 다음과 같은지 확인:
   ```
   6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI
   ```
   - 앞에 `bot`이 붙어있지 않은지 확인
   - 공백이 없는지 확인
   - 전체 토큰이 정확한지 확인

### 3단계: 봇이 활성화되어 있는지 확인

1. Telegram에서 [@BotFather](https://t.me/BotFather) 검색
2. `/mybots` 명령어 입력
3. 해당 봇이 목록에 있는지 확인
4. 봇이 삭제되었다면 새로 생성

### 4단계: Chat ID 확인

브라우저에서 접속:
```
https://api.telegram.org/bot6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI/getUpdates
```

응답에서 Chat ID 확인:
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 123456789,
      "message": {
        "chat": {
          "id": -1002102828603,  // 이 값이 Chat ID
          "title": "그룹 이름",
          "type": "supergroup"
        }
      }
    }
  ]
}
```

### 5단계: 메시지 직접 테스트

브라우저에서 접속 (Chat ID를 실제 값으로 교체):
```
https://api.telegram.org/bot6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI/sendMessage?chat_id=-1002102828603&text=테스트
```

**성공**: 메시지가 Telegram에 전송됨
**실패**: 오류 메시지 확인

---

## 🔴 Google Sheets 401 오류 해결

### Apps Script 배포 설정 확인

1. **구글 시트에서 Apps Script 에디터 열기**
   - 확장 프로그램 > Apps Script

2. **배포 > 새 배포 클릭**
   - 또는 기존 배포 옆 연필 아이콘(수정)

3. **설정 확인 및 변경**
   - **종류 선택**: 웹 앱
   - **다음 사용자 인증 정보로 실행**: **나** ⬅️ 중요!
   - **엑세스 권한이 있는 사용자**: **모든 사용자** ⬅️ 중요!

4. **배포 클릭**

5. **권한 승인**
   - "권한 확인" 클릭
   - Google 계정 선택
   - "고급" 클릭
   - "(프로젝트 이름)로 이동" 클릭
   - "허용" 클릭

6. **Web App URL 테스트**
   - 브라우저에서 직접 접속:
     ```
     https://script.google.com/macros/s/AKfycbw9vFEXhk0A4yUI-0WaM2Gl9BNFJwm9f87Z3XczWw9LuLdzW7JGedkpUzQoIyGGlq2-7A/exec
     ```
   - **정상**: `{"message":"Google Apps Script Web App is running","method":"GET"}` JSON 응답
   - **오류**: 로그인 페이지가 나오면 설정이 잘못된 것

---

## ✅ 빠른 체크리스트

### Telegram
- [ ] 봇 토큰이 `getMe` API에서 정상 작동하는지 확인
- [ ] Vercel 환경 변수에 토큰이 정확히 입력되었는지 확인 (앞에 `bot` 없음)
- [ ] Chat ID가 `getUpdates` API에서 확인됨
- [ ] `sendMessage` API로 직접 테스트 성공

### Google Sheets
- [ ] Apps Script 배포 설정: "나"로 실행
- [ ] Apps Script 배포 설정: "모든 사용자" 접근 권한
- [ ] 권한 승인 완료
- [ ] Web App URL을 브라우저에서 직접 접속 시 JSON 응답 확인

---

## 🔍 디버깅 팁

### Telegram 토큰 테스트
```bash
# 브라우저에서 접속
https://api.telegram.org/bot6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI/getMe
```

### Google Sheets URL 테스트
```bash
# 브라우저에서 접속
https://script.google.com/macros/s/AKfycbw9vFEXhk0A4yUI-0WaM2Gl9BNFJwm9f87Z3XczWw9LuLdzW7JGedkpUzQoIyGGlq2-7A/exec
```

### Chat ID 확인
```bash
# 브라우저에서 접속
https://api.telegram.org/bot6613648395:AAGsp5d4LGp7hBd0DotXWyYMYcoKCdVFZtI/getUpdates
```

---

## ⚠️ 주의사항

1. **환경 변수 변경 후 반드시 Redeploy**
2. **봇 토큰 앞에 `bot` 접두사 없음**
3. **Apps Script는 "나"로 실행해야 외부 API 호출 가능**
4. **모든 설정 변경 후 테스트 필수**


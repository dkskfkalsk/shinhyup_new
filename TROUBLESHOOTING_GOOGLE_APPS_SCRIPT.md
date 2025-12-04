# 🔧 Google Apps Script 전송 오류 해결 가이드

Google Apps Script 코드를 실행한 후 웹사이트에서 전송 오류가 발생하는 경우, 다음 단계를 따라 해결하세요.

## ⚠️ 가장 흔한 원인

1. **웹 앱 재배포 누락** - 설정 변경 후 반드시 재배포해야 합니다!
2. **토큰 불일치** - Apps Script와 Vercel의 토큰이 일치해야 합니다.
3. **배포 설정 오류** - 접근 권한 설정이 잘못되었을 수 있습니다.

---

## 🔍 1단계: 설정 확인

### Apps Script에서 설정된 값 확인

1. Apps Script 편집기 열기
2. `checkConfig()` 함수 선택
3. **실행** 버튼 클릭
4. **실행 > 로그** (Ctrl+Enter) 확인

다음과 같이 표시되어야 합니다:
```
🔍 === 설정 및 시트 접근 테스트 ===
SECRET_TOKEN:  (또는 설정됨)
SPREADSHEET_ID: 
✅ 시트 접근 가능
```

### Vercel 환경 변수 확인

1. Vercel 대시보드 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables**
3. 다음 변수가 설정되어 있는지 확인:
   - `GOOGLE_APPS_SCRIPT_URL`: 웹 앱 URL (예: `https://script.google.com/macros/s/...`)
   - `GOOGLE_APPS_SCRIPT_TOKEN`: **`121217`** (Apps Script와 동일해야 함)

---

## 🔄 2단계: 웹 앱 재배포 (중요!)

설정을 변경한 후에는 **반드시 웹 앱을 재배포**해야 합니다.

### 재배포 방법

1. Apps Script 편집기에서 **배포 > 배포 관리** 클릭
2. 기존 배포 옆 **연필 아이콘(✏️)** 클릭
3. **새 버전** 선택
4. **설명** (선택사항): "설정 업데이트" 등
5. **배포** 클릭
6. **Web App URL 복사** (URL이 변경되었을 수 있음)

### ⚠️ 주의사항

- **URL이 변경되지 않더라도** 재배포해야 설정이 반영됩니다!
- 재배포 후 **새 URL을 Vercel 환경 변수에 업데이트**하세요.

---

## 🔐 3단계: 배포 설정 확인

웹 앱 배포 시 다음 설정이 **반드시** 올바르게 되어 있어야 합니다:

### ✅ 올바른 설정

- **다음 사용자 인증 정보로 실행**: **나**
- **엑세스 권한이 있는 사용자**: **모든 사용자**

### ❌ 잘못된 설정

- "나"로 실행 + "나" 접근 권한 → 외부에서 접근 불가!
- "사용자에게 인증 요청" → 로그인 페이지가 표시됨!

---

## 🧪 4단계: 테스트

### 1. Web App URL 직접 테스트

브라우저에서 Web App URL에 직접 접속:
```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**정상 응답:**
```json
{
  "message": "Google Apps Script Web App 정상 작동 중",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**오류 응답 (로그인 페이지):**
- HTML 페이지가 표시되면 배포 설정이 잘못되었습니다.
- "배포 설정 확인" 단계를 다시 확인하세요.

### 2. Apps Script 로그 확인

1. Apps Script 편집기에서 **실행 > 로그** (Ctrl+Enter)
2. 폼 제출 후 로그 확인

**정상 로그:**
```
🚀 === doPost 호출됨 (시간: ...) ===
✅ POST 요청 확인됨
✅ JSON 파싱 성공
✅ 토큰 검증 완료
✅ 시트 접근 성공
✅ 행 추가 성공
🎉 === 모든 과정 성공 완료 ===
```

**오류 로그 예시:**
- `❌ 토큰 불일치!` → 토큰이 일치하지 않음
- `❌ 시트 접근 실패` → 시트 ID가 잘못되었거나 권한 없음
- `❌ JSON 파싱 실패` → 데이터 형식 문제

### 3. Vercel 로그 확인

1. Vercel 대시보드 → 프로젝트 → **Functions** 탭
2. `api/submit.js` 로그 확인

**오류 예시:**
- `401 Unauthorized` → 배포 설정 또는 URL 오류
- `403 Forbidden` → 접근 권한 오류
- `404 Not Found` → URL이 잘못되었거나 배포되지 않음

---

## 🛠️ 5단계: 일반적인 오류 해결

### 오류: "Invalid token"

**원인:** Apps Script의 SECRET_TOKEN과 Vercel의 GOOGLE_APPS_SCRIPT_TOKEN이 일치하지 않음

**해결:**
1. Apps Script에서 설정된 토큰 확인 (`checkConfig()` 실행)
2. Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_TOKEN`을 동일한 값으로 설정
3. Vercel 함수 재배포 또는 잠시 대기 (환경 변수 변경 후 반영까지 시간 소요)

### 오류: "Spreadsheet access failed"

**원인:** 시트 ID가 잘못되었거나 접근 권한 없음

**해결:**
1. `checkConfig()` 실행하여 시트 접근 확인
2. 시트 ID가 올바른지 확인
3. Apps Script에 시트 접근 권한이 있는지 확인

### 오류: "401" 또는 "403"

**원인:** 웹 앱 배포 설정 오류

**해결:**
1. **배포 > 배포 관리**에서 기존 배포 삭제
2. **배포 > 새 배포**로 새로 배포
3. 다음 설정 확인:
   - **다음 사용자 인증 정보로 실행**: **나**
   - **엑세스 권한이 있는 사용자**: **모든 사용자**
4. 새 URL을 Vercel 환경 변수에 업데이트

### 오류: HTML 응답 (로그인 페이지)

**원인:** 배포 설정에서 "엑세스 권한이 있는 사용자: 나"로 설정됨

**해결:**
1. **배포 > 배포 관리**에서 배포 편집
2. **엑세스 권한이 있는 사용자**: **모든 사용자**로 변경
3. 재배포

---

## 📝 체크리스트

다음 사항을 모두 확인했는지 체크하세요:

- [ ] `setupScriptProperties()` 함수 실행 완료
- [ ] `checkConfig()` 함수로 설정 확인 완료
- [ ] 웹 앱 **재배포** 완료 (중요!)
- [ ] Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_URL` 업데이트
- [ ] Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_TOKEN`이 Apps Script와 동일
- [ ] 배포 설정: "나"로 실행 + "모든 사용자" 접근
- [ ] Web App URL 직접 접속 테스트 성공
- [ ] Apps Script 로그에서 오류 없음

---

## 🆘 여전히 오류가 발생하는 경우

1. **Apps Script 로그 전체 확인**
   - 실행 > 로그에서 모든 로그 확인
   - 오류 메시지 복사

2. **Vercel 로그 확인**
   - Functions 탭에서 상세 로그 확인
   - 오류 메시지 복사

3. **테스트 요청 보내기**
   - Apps Script 편집기에서 `doPost` 함수 직접 실행 불가 (웹 요청 필요)
   - 대신 브라우저 콘솔에서 테스트:
   ```javascript
   fetch('YOUR_WEB_APP_URL', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       token: '121217',
       uname: '테스트',
       tel: '010-1234-5678',
       message: '테스트 메시지'
     })
   }).then(r => r.json()).then(console.log).catch(console.error);
   ```

4. **문제가 계속되면:**
   - Apps Script 로그 전체 내용
   - Vercel 로그 전체 내용
   - 환경 변수 설정 스크린샷
   - 오류 메시지 전체
   
   위 내용을 모두 수집하여 문제를 진단하세요.


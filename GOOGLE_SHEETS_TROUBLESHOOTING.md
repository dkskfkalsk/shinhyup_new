# 🔍 구글 시트 저장 문제 해결 가이드

데이터가 구글 시트에 저장되지 않을 때 확인해야 할 사항들입니다.

## ✅ 필수 체크리스트

### 1️⃣ setupScriptProperties() 함수 실행 확인

**가장 중요합니다!** 이 함수를 실행하지 않으면 설정값이 저장되지 않습니다.

1. Apps Script 에디터에서 함수 선택: `setupScriptProperties`
2. **실행** 버튼 클릭 (▶️)
3. 권한 승인
4. 로그 확인:
   - ✅ `SECRET_TOKEN 설정 완료` 또는 `업데이트 완료`
   - ✅ `SPREADSHEET_ID 설정 완료` 또는 `업데이트 완료`
   - ✅ `설정 완료! 이제 doPost 함수가 정상 작동합니다.`

**확인 방법:**
- 함수 선택: `checkConfig`
- 실행 버튼 클릭
- 로그에서 설정값 확인

### 2️⃣ 코드에서 값 변경 확인

`setupScriptProperties()` 함수에서 다음 값이 실제 값으로 변경되었는지 확인:

```javascript
const SECRET_TOKEN = '121217'; // ✅ 실제 값으로 변경됨
const SPREADSHEET_ID = '17fKb6pNg1rHrLm-Jd4QxKiDsnQUPwI40dy9UBcegOf4'; // ✅ 실제 값으로 변경됨
```

### 3️⃣ 웹 앱 배포 확인

1. **배포 > 새 배포** 또는 기존 배포 수정
2. 설정 확인:
   - **다음 사용자 인증 정보로 실행**: **나** ⬅️ 중요!
   - **엑세스 권한이 있는 사용자**: **모든 사용자** ⬅️ 중요!
3. **배포** 클릭
4. Web App URL 복사

### 4️⃣ Vercel 환경 변수 확인

Vercel 대시보드에서 다음 환경 변수가 올바르게 설정되었는지 확인:

- `GOOGLE_APPS_SCRIPT_URL`: Web App URL이 올바른지
- `GOOGLE_APPS_SCRIPT_TOKEN`: `121217`과 일치하는지

**중요:** 환경 변수 변경 후 **Redeploy** 필수!

### 5️⃣ 시트 ID 확인

시트 ID가 올바른지 확인:
- 구글 시트 URL: `https://docs.google.com/spreadsheets/d/[시트_ID]/edit`
- 현재 설정된 ID: `17fKb6pNg1rHrLm-Jd4QxKiDsnQUPwI40dy9UBcegOf4`
- URL에서 ID 부분과 일치하는지 확인

### 6️⃣ 시트 접근 권한 확인

Apps Script를 실행한 계정이 해당 시트에 접근 권한이 있는지 확인:
- 시트를 직접 열 수 있는지 확인
- 시트 공유 설정 확인

## 🧪 테스트 방법

### 방법 1: Apps Script 로그 확인

1. Apps Script 에디터에서 **실행 > doPost** (실행 불가능 - POST만 가능)
2. 대신 **실행 > checkConfig** 실행
3. 로그에서 설정값 확인

### 방법 2: Web App URL 직접 테스트

브라우저에서 Web App URL 접속:
- 정상: `{"message":"Google Apps Script Web App is running","method":"GET"}`
- 오류: 로그인 페이지가 나오면 배포 설정 확인

### 방법 3: Vercel 로그 확인

1. Vercel 대시보드 → 프로젝트 → Functions
2. `/api/submit` 함수 로그 확인
3. 오류 메시지 확인:
   - `401`: 권한 문제 → 배포 설정 확인
   - `403`: 접근 거부 → 배포 설정 확인
   - `404`: URL 오류 → Web App URL 확인
   - `Invalid token`: 토큰 불일치 → 환경 변수 확인

### 방법 4: Apps Script 실행 로그 확인

1. Apps Script 에디터 → **실행 > 실행 기록**
2. 최근 실행 기록 확인
3. 로그에서 오류 메시지 확인

## 🔧 일반적인 문제와 해결 방법

### 문제 1: "스프레드시트를 찾을 수 없습니다"

**원인:** `setupScriptProperties()` 함수를 실행하지 않았거나 시트 ID가 잘못됨

**해결:**
1. `setupScriptProperties()` 함수 실행
2. 시트 ID 확인 및 수정
3. `checkConfig()` 함수로 확인

### 문제 2: "Invalid token"

**원인:** Vercel 환경 변수와 Apps Script 설정의 토큰이 일치하지 않음

**해결:**
1. Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_TOKEN` 확인
2. `setupScriptProperties()` 함수의 `SECRET_TOKEN` 확인
3. 두 값이 일치하는지 확인
4. 일치하지 않으면 수정 후 `setupScriptProperties()` 다시 실행

### 문제 3: 401 또는 403 오류

**원인:** 웹 앱 배포 설정이 잘못됨

**해결:**
1. 배포 > 새 배포 (또는 기존 배포 수정)
2. **다음 사용자 인증 정보로 실행**: **나**
3. **엑세스 권한이 있는 사용자**: **모든 사용자**
4. 배포 후 Web App URL 확인

### 문제 4: 데이터는 저장되지만 시트에 안 보임

**원인:** 
- 잘못된 시트를 보고 있음
- 시트의 다른 탭을 보고 있음
- 데이터가 다른 행에 저장됨

**해결:**
1. `checkConfig()` 함수로 시트 URL 확인
2. 올바른 시트와 탭 확인
3. 시트 전체 검색 (Ctrl+F)

## 📝 디버깅 단계별 가이드

### Step 1: 설정 확인
```
1. Apps Script 에디터 열기
2. 함수 선택: checkConfig
3. 실행 버튼 클릭
4. 로그 확인
```

### Step 2: 설정 저장
```
1. setupScriptProperties() 함수에서 값 확인
2. 실제 값으로 변경되어 있는지 확인
3. setupScriptProperties() 함수 실행
4. 로그에서 "설정 완료!" 확인
```

### Step 3: 배포 확인
```
1. 배포 > 새 배포
2. 설정 확인 (나, 모든 사용자)
3. Web App URL 복사
4. 브라우저에서 URL 접속 테스트
```

### Step 4: Vercel 확인
```
1. Vercel 환경 변수 확인
2. GOOGLE_APPS_SCRIPT_URL: Web App URL
3. GOOGLE_APPS_SCRIPT_TOKEN: 121217
4. Redeploy 실행
```

### Step 5: 테스트
```
1. 웹사이트에서 폼 제출
2. Vercel 로그 확인
3. Apps Script 실행 기록 확인
4. 구글 시트 확인
```

## 💡 빠른 확인 명령어

Apps Script 에디터에서 다음 함수들을 실행하여 확인:

1. **checkConfig()**: 현재 설정 확인
2. **setupScriptProperties()**: 설정 저장/업데이트
3. **doGet()**: Web App 동작 확인

## 🆘 여전히 안 되면

1. **Vercel 로그**에서 정확한 오류 메시지 확인
2. **Apps Script 실행 기록**에서 오류 확인
3. **checkConfig()** 함수 실행 결과 확인
4. 위 체크리스트를 다시 한 번 확인


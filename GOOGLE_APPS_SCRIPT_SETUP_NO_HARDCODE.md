# 🔧 Google Apps Script 설정 가이드 (하드코딩 없이)

이 가이드는 **하드코딩 없이** Google Apps Script를 설정하는 방법을 설명합니다.

## ✅ 장점

- ✅ 코드 수정 없이 설정 변경 가능
- ✅ 여러 시트에서 같은 스크립트 사용 가능
- ✅ 보안 토큰과 시트 ID를 안전하게 관리
- ✅ 설정값 변경 시 코드 재배포 불필요

## 📋 설정 방법

### 방법 1: Script Properties 사용 (권장)

#### 1단계: Apps Script 에디터 열기
1. 구글 시트에서 **확장 프로그램 > Apps Script** 클릭
2. `GOOGLE_APPS_SCRIPT_CODE.js` 파일의 코드를 붙여넣기
3. **저장** (Ctrl+S 또는 Cmd+S)

#### 2단계: 설정 함수 실행
1. 함수 선택 드롭다운에서 **`setupScriptProperties`** 선택
2. **실행** 버튼 클릭 (▶️)
3. **권한 검토** 클릭
4. Google 계정 선택
5. **고급** 클릭
6. **"(프로젝트 이름)로 이동"** 클릭
7. **허용** 클릭

#### 3단계: 설정값 입력
1. Apps Script 에디터로 돌아가기
2. `setupScriptProperties` 함수를 찾아서 다음 값 수정:

```javascript
function setupScriptProperties() {
  // ... 기존 코드 ...
  
  // 여기에 실제 값 입력
  const SECRET_TOKEN = 'your-actual-secret-token'; // Vercel 환경 변수와 동일
  const SPREADSHEET_ID = 'your-spreadsheet-id';   // 시트 ID 또는 비워두기
}
```

**시트 ID 찾는 방법:**
- 구글 시트 URL: `https://docs.google.com/spreadsheets/d/[여기가_시트_ID]/edit`
- 예: URL이 `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`이면
- 시트 ID는 `1a2b3c4d5e6f7g8h9i0j`

**SPREADSHEET_ID를 비워두면:**
- Apps Script가 시트 내에서 실행되면 자동으로 현재 시트 사용
- 별도 설정 불필요

#### 4단계: 설정 함수 다시 실행
1. `setupScriptProperties` 함수 선택
2. **실행** 버튼 클릭
3. 로그에서 "설정 완료!" 메시지 확인

#### 5단계: 웹 앱 배포
1. **배포 > 새 배포** 클릭
2. **종류 선택**: 웹 앱
3. **설명**: (선택사항) "Form submission webhook"
4. **다음 사용자 인증 정보로 실행**: **나** ⬅️ 중요!
5. **엑세스 권한이 있는 사용자**: **모든 사용자** ⬅️ 중요!
6. **배포** 클릭
7. **Web App URL** 복사
8. Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_URL`에 붙여넣기

### 방법 2: 현재 스프레드시트 자동 사용

Apps Script가 **시트 내에서 실행**되면 자동으로 현재 시트를 사용합니다.

#### 설정 방법:
1. `setupScriptProperties` 함수에서 `SPREADSHEET_ID`를 비워두거나 설정하지 않음
2. Apps Script를 시트 내에서 실행 (확장 프로그램 > Apps Script)
3. 별도 설정 불필요

## 🔄 설정값 변경 방법

### Script Properties에서 설정값 변경

#### 방법 1: 코드에서 변경 (권장)
1. `setupScriptProperties` 함수의 값 수정
2. 함수 다시 실행

#### 방법 2: Apps Script 에디터에서 직접 변경
1. Apps Script 에디터에서 **프로젝트 설정** (⚙️) 클릭
2. **스크립트 속성** 섹션에서 직접 추가/수정
3. 키: `SECRET_TOKEN`, 값: (토큰)
4. 키: `SPREADSHEET_ID`, 값: (시트 ID)

## 🧪 테스트 방법

### 1. 설정 확인
```javascript
// Apps Script 에디터에서 실행
function testConfig() {
  const config = getConfig();
  Logger.log('SECRET_TOKEN: ' + (config.secretToken ? '설정됨' : '미설정'));
  Logger.log('SPREADSHEET_ID: ' + (config.spreadsheetId || '미설정 (현재 시트 사용)'));
}
```

### 2. Web App URL 테스트
브라우저에서 Web App URL에 직접 접속:
- 정상: `{"message":"Google Apps Script Web App is running","method":"GET"}` JSON 응답
- 오류: 로그인 페이지가 나오면 배포 설정 확인

### 3. 전체 플로우 테스트
1. 웹사이트에서 폼 제출
2. 구글 시트에 데이터가 추가되는지 확인
3. Vercel 로그에서 오류 확인

## 🔒 보안 주의사항

1. **SECRET_TOKEN**: Vercel 환경 변수 `GOOGLE_APPS_SCRIPT_TOKEN`과 동일하게 설정
2. **SPREADSHEET_ID**: 공개 저장소에 커밋하지 않기 (이미 Script Properties에 저장되어 있으므로 안전)
3. **Web App URL**: 공개되어도 토큰으로 보호됨

## ❓ 문제 해결

### "스프레드시트를 찾을 수 없습니다" 오류
- `setupScriptProperties` 함수를 실행하여 `SPREADSHEET_ID` 설정
- 또는 Apps Script를 시트 내에서 실행

### "Invalid token" 오류
- `SECRET_TOKEN`이 Vercel 환경 변수와 일치하는지 확인
- `setupScriptProperties` 함수에서 토큰 재설정

### 데이터가 저장되지 않음
- 시트 ID가 올바른지 확인
- Apps Script 배포 설정 확인 ("나"로 실행, "모든 사용자" 접근)
- Vercel 로그에서 상세 오류 확인

## 📝 요약

1. ✅ 코드를 Apps Script에 붙여넣기
2. ✅ `setupScriptProperties` 함수 실행하여 설정값 저장
3. ✅ 웹 앱으로 배포
4. ✅ Vercel 환경 변수 설정
5. ✅ 테스트 및 확인

**하드코딩 없이 설정 완료!** 🎉


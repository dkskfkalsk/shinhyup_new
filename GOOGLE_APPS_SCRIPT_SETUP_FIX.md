# 🔧 Google Apps Script 설정 수정 가이드

## ❌ 현재 설정 (문제 있음)

- **다음 사용자 인증 정보로 실행**: 웹 앱을 엑세스하는 사용자
- **엑세스 권한이 있는 사용자**: Google 계정이 있는 모든 사용자

**문제점**: 이 설정은 Google 계정 로그인이 필요합니다. Vercel 서버리스 함수는 인증 없이 호출하므로 401 오류가 발생합니다.

## ✅ 올바른 설정

1. **구글 시트에서 Apps Script 에디터 열기**
   - 확장 프로그램 > Apps Script

2. **배포 > 새 배포 클릭**
   - 또는 기존 배포 옆의 연필 아이콘(수정) 클릭

3. **설정 변경**
   - **종류 선택**: 웹 앱
   - **설명**: (선택사항) "Form submission webhook"
   - **다음 사용자 인증 정보로 실행**: **나** ⬅️ 중요!
   - **엑세스 권한이 있는 사용자**: **모든 사용자** ⬅️ 중요!

4. **배포 클릭**

5. **권한 승인**
   - "권한 확인" 클릭
   - Google 계정 선택
   - "고급" 클릭
   - "(프로젝트 이름)로 이동" 클릭
   - "허용" 클릭

6. **Web App URL 복사**
   - 배포 완료 후 표시되는 URL 복사
   - 예: `https://script.google.com/macros/s/<YOUR_SCRIPT_ID>/exec`

7. **Vercel 환경 변수 업데이트**
   - Vercel 대시보드 → Settings → Environment Variables
   - `GOOGLE_APPS_SCRIPT_URL` 값 업데이트
   - **Redeploy** 필수!

## 🔍 설정 확인 방법

### 방법 1: 브라우저에서 직접 접속
1. Web App URL을 브라우저에서 직접 접속
2. **정상**: `{"message":"Google Apps Script Web App is running","method":"GET"}` JSON 응답
3. **오류**: Google 로그인 페이지가 나오면 설정이 잘못된 것

### 방법 2: curl로 테스트
```bash
curl "https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

정상 응답이 오면 설정이 올바른 것입니다.

## ⚠️ 주의사항

- **"나"로 실행** = Apps Script를 만든 계정의 권한으로 실행
- **"모든 사용자"** = 인증 없이 누구나 접근 가능
- 이 두 설정의 조합이 외부 API 호출에 필요합니다

## 📝 URL 테스트 방법

실제 배포된 Web App URL에 접속했을 때:
- ✅ JSON 응답이 나오면 → 설정 완료
- ❌ 로그인 페이지가 나오면 → 설정 수정 필요

**주의**: 실제 배포된 URL은 `<YOUR_SCRIPT_ID>` 부분을 실제 스크립트 ID로 교체해야 합니다.


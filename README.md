# 신협 주택담보대출 랜딩 페이지

정적 HTML 기반 랜딩 페이지로, Vercel에 배포되어 n8n을 통해 구글 시트에 데이터를 저장합니다.

---

## 📋 목차

- [프로젝트 개요](#프로젝트-개요)
- [시스템 아키텍처](#시스템-아키텍처)
- [빠른 시작](#빠른-시작)
- [상세 설정 가이드](#상세-설정-가이드)
- [n8n 워크플로우 설정](#n8n-워크플로우-설정)
- [구글 시트 설정](#구글-시트-설정)
- [파일 구조](#파일-구조)
- [로컬 개발](#로컬-개발)
- [배포 및 테스트](#배포-및-테스트)
- [문제 해결](#문제-해결)

---

## 🎯 프로젝트 개요

고객이 랜딩 페이지에서 폼을 제출하면:
1. **Vercel 서버리스 API**로 데이터 전송
2. **n8n 웹훅**으로 데이터 전달
3. **구글 시트**에 자동으로 저장

### 전송되는 데이터

- `uname`: 고객명
- `tel`: 연락처 (전화번호)
- `message`: 문의 내용
- `submittedAt`: 제출 시간 (자동)
- `clientIp`: 클라이언트 IP (자동)
- `userAgent`: 사용자 에이전트 (자동)

---

## 🏗️ 시스템 아키텍처

```
[사용자 폼 입력]
    ↓
[Vercel 배포된 사이트]
    ↓
[POST /api/submit.js]
    ↓
[n8n Webhook으로 전송]
    ↓
[n8n 워크플로우 처리]
    ↓
[Google Sheets에 데이터 추가]
    ↓
[구글 시트: A2(제출시간), B2(고객명), C2(연락처), D2(내용), E2(IP), F2(에이전트)]
```

**구글 시트 열 구조:**
- A열: 제출 시간 (submittedAt)
- B열: 고객명 (uname)
- C열: 연락처 (tel)
- D열: 문의 내용 (message)
- E열: 클라이언트 IP (clientIp)
- F열: 사용자 에이전트 (userAgent)

---

## 🚀 빠른 시작

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd shinhyup
```

### 2. Vercel에 배포

#### 방법 1: GitHub 연동 (권장)

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com) 로그인
3. "Add New..." → "Project"
4. GitHub 저장소 선택
5. 프로젝트 설정:
   - **Framework Preset**: Other
   - **Root Directory**: `.` (기본값)
   - **Build Command**: (없음)
   - **Output Directory**: `.` (기본값)
6. "Deploy" 클릭

#### 방법 2: Vercel CLI

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경 변수 설정

Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**

> ⚠️ **보안 경고**: 
> - **절대 코드에 민감한 정보를 하드코딩하지 마세요!**
> - `api/submit.js` 파일에는 기본값이 없습니다. 모든 값은 환경 변수로 설정해야 합니다.
> - GitHub에 코드를 올리기 전에 하드코딩된 URL, 토큰, 시크릿 키가 없는지 확인하세요.

**필수 환경 변수:**

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `N8N_WEBHOOK_URL` | n8n 웹훅 URL | `https://your-n8n.app.n8n.cloud/webhook/form-submit` |

**선택적 환경 변수 (인증 필요 시):**

| 변수명 | 설명 | 예시 | 필수 여부 |
|--------|------|------|----------|
| `N8N_AUTH_TOKEN` | n8n 웹훅 인증 토큰 (Bearer Token 방식) | `your-webhook-auth-token` | JWT 미사용 시 |
| `JWT_SECRET` | JWT 시크릿 키 (JWT 인증 사용 시 **필수**) | `your-secret-key-here-min-32-chars` | JWT 사용 시 필수 |
| `JWT_ISSUER` | JWT 발행자 (선택사항) | `vercel-api` | 선택 |
| `JWT_AUDIENCE` | JWT 대상자 (선택사항) | `n8n-webhook` | 선택 |
| `JWT_TTL_SECONDS` | JWT 토큰 유효 시간 (초, 기본값: 300) | `300` | 선택 |
| `ALLOWED_ORIGINS` | 허용된 도메인 (쉼표로 구분) | `https://example.com,https://www.example.com` | 선택 |

**인증 방식 선택:**
- **Bearer Token 방식**: `N8N_AUTH_TOKEN` 설정 (간단)
- **JWT 방식**: `JWT_SECRET` 필수 + `JWT_ISSUER`, `JWT_AUDIENCE` 선택 (더 안전)
- **인증 없음**: 둘 다 설정하지 않음 (비권장)

**환경 변수 적용:**
- Environment: **Production**, **Preview**, **Development** 모두 선택 권장
- 각 변수 추가 후 "Save" 클릭
- 환경 변수는 **Sensitive** 타입으로 설정하여 값이 로그에 노출되지 않도록 권장

---

## ⚙️ 상세 설정 가이드

### 1. JWT 인증 설정 (권장)

JWT 인증을 사용하면 더 안전하게 n8n 웹훅을 보호할 수 있습니다.

#### Vercel에서 JWT 환경 변수 설정

1. Vercel 대시보드 → 프로젝트 → **Settings** → **Environment Variables**

2. 다음 환경 변수들을 추가:

   **필수:**
   - `JWT_SECRET`: JWT 서명에 사용할 시크릿 키
     - **최소 32자 이상의 강력한 랜덤 문자열 사용 권장**
     - 예: `d2vlt2m1r8fVw1yZ8qk2y5k6t9R3pNwqHhJvQm4rSxUeYt1aW3z7n0b2c5d8g1jL`
     - **중요**: 이 값은 n8n과 동일하게 설정해야 합니다!

   **선택사항 (보안 강화용):**
   - `JWT_ISSUER`: JWT 발행자 식별자 (예: `vercel-api`)
   - `JWT_AUDIENCE`: JWT 대상자 식별자 (예: `n8n-webhook`)
   - `JWT_TTL_SECONDS`: 토큰 유효 시간 (초, 기본값: 300초 = 5분)

3. **환경 변수 추가 예시:**
   ```
   JWT_SECRET = d2vlt2m1r8fVw1yZ8qk2y5k6t9R3pNwqHhJvQm4rSxUeYt1aW3z7n0b2c5d8g1jL
   JWT_ISSUER = vercel-api
   JWT_AUDIENCE = n8n-webhook
   JWT_TTL_SECONDS = 300
   ```

4. **주의사항:**
   - `JWT_SECRET`은 절대 코드에 하드코딩하지 마세요!
   - 강력한 랜덤 문자열을 생성하여 사용하세요
   - n8n의 `JWT_SECRET`과 **반드시 동일한 값**을 사용해야 합니다

#### n8n에서 JWT 검증 설정

n8n에서는 직접 JWT 검증 기능이 없으므로, **Code 노드**를 사용하여 JWT를 검증합니다.

**워크플로우 구조:**
```
Webhook (POST)
  ↓
Code (JWT 검증)
  ├─ 검증 성공 → 다음 노드로 진행
  └─ 검증 실패 → 에러 응답
  ↓
Google Sheets (데이터 추가)
  ↓
Respond to Webhook (응답 반환) ⬅ 필수!
```

**설정 방법:**

1. **Webhook 노드 설정:**
   - **HTTP Method**: `POST`
   - **Path**: `/form-submit`
   - **Authentication**: `None` (JWT는 Code 노드에서 검증)

2. **Code 노드 추가** (Webhook 다음에 배치):
   - **Mode**: `Run Once for All Items`
   - **Language**: `JavaScript`

3. **Code 노드에 다음 코드 입력:**

```javascript
// 환경 변수에서 JWT 시크릿 가져오기 (n8n 환경 변수로 설정 필요)
const jwtSecret = $env.JWT_SECRET || 'your-secret-key-here-min-32-chars';

// Vercel에서 전송된 Authorization 헤더에서 JWT 토큰 추출
const authHeader = $input.first().headers['authorization'] || $input.first().headers['Authorization'];

if (!authHeader || !authHeader.startsWith('Bearer ')) {
  throw new Error('Missing or invalid Authorization header');
}

const token = authHeader.replace('Bearer ', '');

// JWT 토큰 검증 함수
function verifyJWT(token, secret) {
  try {
    // JWT 토큰을 세 부분으로 분리: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid JWT format');
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    // Base64 URL 디코딩
    function base64UrlDecode(str) {
      // Base64 URL 안전 문자를 표준 Base64로 변환
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      
      // 패딩 추가
      while (base64.length % 4) {
        base64 += '=';
      }
      
      // Base64 디코딩
      return Buffer.from(base64, 'base64').toString('utf-8');
    }

    // Payload 디코딩하여 exp 확인
    const payload = JSON.parse(base64UrlDecode(payloadB64));
    
    // 만료 시간 확인
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('JWT token has expired');
    }

    // Issuer 확인 (설정된 경우)
    if ($env.JWT_ISSUER && payload.iss !== $env.JWT_ISSUER) {
      throw new Error('Invalid JWT issuer');
    }

    // Audience 확인 (설정된 경우)
    if ($env.JWT_AUDIENCE && payload.aud !== $env.JWT_AUDIENCE) {
      throw new Error('Invalid JWT audience');
    }

    // 서명 검증 (간단한 HMAC-SHA256 검증)
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${parts[0]}.${parts[1]}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (signature !== signatureB64) {
      throw new Error('Invalid JWT signature');
    }

    return payload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
}

// JWT 토큰 검증
try {
  const payload = verifyJWT(token, jwtSecret);
  
  // 검증 성공: 원본 데이터 반환
  return $input.all().map(item => item.json);
} catch (error) {
  // 검증 실패: 에러 반환
  throw new Error(`Authentication failed: ${error.message}`);
}
```

4. **n8n 환경 변수 설정** (n8n 대시보드에서):
   - n8n → **Settings** → **Variables** → 새 변수 추가
   - `JWT_SECRET`: Vercel에서 설정한 것과 **동일한 값** 입력
   - `JWT_ISSUER`: Vercel에서 설정한 것과 동일 (설정한 경우)
   - `JWT_AUDIENCE`: Vercel에서 설정한 것과 동일 (설정한 경우)

5. **에러 처리 (선택사항):**
   - Code 노드에서 검증 실패 시 에러가 발생합니다
   - 필요시 **IF 노드**를 추가하여 에러를 처리할 수 있습니다

6. **노드 연결:**
   - **Webhook** → **Code (JWT 검증)** → **Google Sheets** → **Respond to Webhook**

**JWT 검증 실패 시 에러 응답 설정:**
- Code 노드의 에러를 처리하려면 **Error Trigger** 노드를 추가하거나
- **IF 노드**로 에러를 체크하여 적절한 응답을 반환할 수 있습니다

### 2. Bearer Token 인증 설정 (간단한 방법)

Bearer Token 방식은 JWT보다 간단하지만 보안이 약합니다.

#### Vercel에서 설정:
1. `N8N_AUTH_TOKEN` 환경 변수 설정 (예: `my-secret-token-12345`)

#### n8n에서 설정:
1. **Webhook 노드** 설정:
   - **Authentication**: `Header Auth` 또는 `Generic Credential Type`
   - **Name**: `Authorization`
   - **Value**: `Bearer my-secret-token-12345` (Vercel의 `N8N_AUTH_TOKEN`과 동일)

### 3. n8n 웹훅 URL 설정

1. n8n에서 워크플로우 생성
2. **Webhook** 노드 추가
3. 설정:
   - **HTTP Method**: `POST`
   - **Path**: `/form-submit` (또는 원하는 경로)
   - **Authentication**: 
     - JWT 사용 시: `None` (Code 노드에서 검증)
     - Bearer Token 사용 시: `Header Auth` 또는 `Generic Credential Type`
     - 인증 없음: `None` (비권장)
4. 웹훅 URL 복사 (예: `https://your-n8n.app.n8n.cloud/webhook/form-submit`)
5. Vercel 환경 변수 `N8N_WEBHOOK_URL`에 입력

### 2. 기본 도메인 설정 (선택사항)

`js/config.js` 파일에서 설정:

```javascript
// 사이트 도메인 (자동 감지되지 않을 경우 사용할 기본값)
const DEFAULT_DOMAIN = 'shinhyupsales.duckdns.org';

// 신청 완료 후 이동할 페이지 (null이면 alert만 표시)
const THANK_YOU_URL = null; // 예: "/thanks.html" 또는 전체 URL
```

**참고**: Vercel에 배포하면 자동으로 현재 도메인(`window.location.hostname`)을 사용하므로 별도 설정이 필요 없습니다.

---

## 🔄 n8n 워크플로우 설정

### 워크플로우 구조

```
Webhook (POST) 
  ↓
[Optional: IF 노드로 데이터 검증]
  ↓
Google Sheets (Append)
  ├─ Spreadsheet: [구글 시트 ID]
  ├─ Sheet: Sheet1
  ├─ Range: A2:F2
  └─ Values: [submittedAt, uname, tel, message, clientIp, userAgent]
  ↓
Respond to Webhook (응답 반환) ⬅ 필수! (500 오류 방지)
```

### 1단계: Webhook 노드 설정

1. **Webhook** 노드를 워크플로우에 추가
2. 설정:
   - **HTTP Method**: `POST`
   - **Path**: `/form-submit`
   - **Authentication**: 
     - **JWT 인증 사용 시**: `None` (Code 노드에서 검증)
     - **Bearer Token 사용 시**: `Header Auth` 설정
     - **인증 없음**: `None` (비권장)
3. 워크플로우 **활성화**
4. 웹훅 URL 확인 및 복사

### 1-1단계: JWT 검증 노드 설정 (JWT 인증 사용 시)

JWT 인증을 사용하는 경우, Webhook 노드 다음에 **Code 노드**를 추가하여 JWT를 검증해야 합니다.

**워크플로우 순서:**
```
Webhook → Code (JWT 검증) → Google Sheets
```

**Code 노드 설정:**
1. **Code** 노드를 Webhook 노드 다음에 추가
2. **Mode**: `Run Once for All Items`
3. **Language**: `JavaScript`
4. 위의 "n8n에서 JWT 검증 설정" 섹션의 코드 입력
5. n8n 환경 변수에 `JWT_SECRET` 설정 (Vercel과 동일한 값)

**중요**: 
- JWT 검증이 실패하면 워크플로우가 중단됩니다
- Vercel의 `JWT_SECRET`과 n8n의 `JWT_SECRET`이 **반드시 동일**해야 합니다

### 2단계: Google Sheets 노드 설정

1. **Google Sheets** 노드를 워크플로우에 추가
2. **Google 계정 연결**:
   - Credentials에서 Google 계정 인증
   - OAuth 2.0 또는 Service Account 사용
3. 노드 설정:
   - **Operation**: `Append`
   - **Spreadsheet ID**: 구글 시트 ID (URL에서 확인)
     - 예: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`
   - **Sheet**: `Sheet1` (또는 시트명)
   - **Range**: `A2:F2` (첫 행 시작 위치, Append 모드에서는 자동으로 다음 행에 추가됨)
4. **Values** 설정:
   
   **Mapping Column Mode**에 따라 설정 방법이 다릅니다:
   
   ---
   
   ### 방법 A: "Map Each Column Manually" 모드 (현재 설정)
   
   ⚠️ **중요**: 각 필드의 Value 입력란에 표현식을 입력할 때, **"fx" 버튼을 클릭**하여 표현식 모드로 전환해야 합니다!
   
   화면에 보이는 각 필드의 **Value 입력란**에 개별적으로 표현식을 입력합니다:
   
   | 필드명 | Value 입력란에 입력할 내용 |
   |--------|---------------------------|
   | `submittedAt` | `{{ $json.submittedAt }}` |
   | `uname` | `{{ $json.uname }}` |
   | `tel` | `{{ $json.tel }}` |
   | `message` | `{{ $json.message }}` |
   | `clientIp` | `{{ $json.clientIp }}` |
   | `userAgent` | `{{ $json.userAgent }}` |
   
   **설정 순서 (매우 중요!):**
   1. `submittedAt` 필드의 Value 입력란 클릭
   2. **입력란 왼쪽의 "fx" 버튼 클릭** (표현식 모드로 전환)
   3. `{{ $json.submittedAt }}` 입력
   4. `uname` 필드의 Value 입력란 클릭
   5. **"fx" 버튼 클릭** (표현식 모드로 전환)
   6. `{{ $json.uname }}` 입력
   7. 나머지 필드도 동일하게 반복 (각 필드마다 "fx" 버튼 클릭!)
   
   **⚠️ "fx" 버튼을 클릭하지 않으면:**
   - 표현식이 문자열로 인식되어 `{{ $json.submittedAt }}` 그대로 구글 시트에 입력됩니다!
   - 반드시 각 필드마다 "fx" 버튼을 클릭하여 표현식 모드로 전환해야 합니다!
   
   **빈 값 처리 (선택사항):**
   - 값이 없을 때 빈 문자열로 처리하려면:
   - `{{ $json.submittedAt || '' }}`
   - `{{ $json.uname || '' }}`
   - 등등...
   
   ---
   
   ### 방법 B: "Define Below" 또는 "Auto-Map Input Data" 모드
   
   **Values to Send** 필드에 배열 형식으로 입력:
   
   ```javascript
   {{ [$json.submittedAt, $json.uname, $json.tel, $json.message, $json.clientIp, $json.userAgent] }}
   ```
   
   또는 빈 값 처리 포함:
   ```javascript
   {{ [
       $json.submittedAt || '',
       $json.uname || '',
       $json.tel || '',
       ($json.message || '').toString(),
       $json.clientIp || '',
       $json.userAgent || ''
     ] }}
   ```
   
   ---
   
   **⚠️ 중요:**
   - **데이터 순서**: 구글 시트의 열 순서와 동일하게 입력하세요
   - **열 순서**: A열(submittedAt) → B열(uname) → C열(tel) → D열(message) → E열(clientIp) → F열(userAgent)
   - 표현식은 `{{ }}` 형식으로 입력해야 합니다

### 3단계: Respond to Webhook 노드 설정 (필수!)

⚠️ **중요**: Webhook 노드를 사용할 때는 반드시 "Respond to Webhook" 노드를 추가해야 합니다. 이 노드가 없으면 **500 오류**가 발생합니다.

**오류 예시:**
```
n8n webhook error: 500 {"code":0,"message":"No Respond to Webhook node found in the workflow"}
```

**설정 방법:**

1. **Respond to Webhook** 노드를 워크플로우에 추가
   - 노드 추가 버튼 클릭 → "Respond to Webhook" 검색 → 추가
   - Google Sheets 노드 **뒤에** 배치

2. **노드 연결:**
   - Google Sheets 노드의 출력을 "Respond to Webhook" 노드의 입력에 연결

3. **Respond to Webhook 노드 설정:**
   - **Respond With**: `JSON`
   - **Response Code**: `200` (성공 시)
   - **Response Body**: 
     
     ⚠️ **중요**: 
     - n8n에서는 JSON을 직접 입력하지 않고 **표현식(expression)** 형식으로 입력해야 합니다!
     - **반드시 한 줄로 입력**하세요! 줄바꿈이 있으면 오류가 발생합니다!
     
     **올바른 형식 (한 줄로 입력):**
     ```
     {{ { "success": true, "message": "Data saved successfully" } }}
     ```
     
     또는 간단하게:
     ```
     {{ { "success": true } }}
     ```
     
     **잘못된 형식 1 (줄바꿈 포함 - 오류 발생):**
     ```
     {{ { 
       "success": true,
       "message": "Data saved successfully"
     } }}
     ```
     ❌ 줄바꿈이 있으면 "Unexpected token" 오류가 발생합니다!
     
     **잘못된 형식 2 (직접 JSON 입력 - 오류 발생):**
     ```json
     {
       "success": true,
       "message": "Data saved successfully"
     }
     ```
     ❌ 이렇게 직접 JSON을 넣으면 "Unexpected token" 오류가 발생합니다!

4. **에러 응답 설정 (선택사항):**
   - 에러 처리 노드를 추가한 경우:
   - **Response Code**: `400` 또는 `500`
   - **Response Body**:
     ```
     {{ { "success": false, "error": $json.error } }}
     ```
     
     또는 동적 메시지:
     ```
     {{ { "success": false, "error": "Authentication failed" } }}
     ```

**완성된 워크플로우 구조:**
```
Webhook (POST /form-submit)
  ↓
[Optional: Code 노드 - JWT 검증]
  ↓
Google Sheets (데이터 추가)
  ↓
Respond to Webhook (응답: {"success": true}) ⬅ 필수!
```

### 4단계: 노드 연결

- **Webhook** → **[Code (JWT 검증)]** → **Google Sheets** → **Respond to Webhook** 순서로 연결
- 워크플로우 **활성화** 확인

### 5단계: 테스트

1. 워크플로우 실행
2. 폼 제출 테스트
3. 구글 시트에서 데이터 추가 확인:
   - A열: 제출 시간 (submittedAt)
   - B열: 고객명 (uname)
   - C열: 연락처 (tel)
   - D열: 문의 내용 (message)
   - E열: 클라이언트 IP (clientIp)
   - F열: 사용자 에이전트 (userAgent)

---

## 📊 구글 시트 설정

### 시트 구조

데이터는 전송되는 순서대로 A열부터 F열까지 자동으로 저장됩니다.

| 열 | 내용 | 데이터 필드 | 설명 |
|----|------|------------|------|
| A | 제출 시간 | `submittedAt` | 폼 제출 시간 (ISO 8601 형식) |
| B | 고객명 | `uname` | 폼에서 입력한 고객 이름 |
| C | 연락처 | `tel` | 폼에서 입력한 전화번호 |
| D | 문의 내용 | `message` | 폼에서 입력한 문의 내용 |
| E | 클라이언트 IP | `clientIp` | 요청한 클라이언트 IP 주소 |
| F | 사용자 에이전트 | `userAgent` | 브라우저 정보 |

### 헤더 행 설정 (선택사항)

구글 시트의 첫 번째 행(1행)에 헤더를 추가할 수 있습니다:

1. **A1 셀**: `제출 시간`
2. **B1 셀**: `고객명`
3. **C1 셀**: `연락처`
4. **D1 셀**: `문의 내용`
5. **E1 셀**: `클라이언트 IP`
6. **F1 셀**: `사용자 에이전트`

이렇게 설정하면 데이터가 2행부터 자동으로 추가됩니다.

---

## 📁 파일 구조

```
shinhyup/
├── index.html              # 메인 랜딩 페이지
├── api/
│   └── submit.js           # Vercel 서버리스 API (n8n 연동)
├── js/
│   ├── config.js           # ⭐ 설정 파일 (도메인, 엔드포인트 등)
│   ├── jquery.js           # jQuery 라이브러리 (v3.7.1)
│   ├── scroll.js           # 스크롤 관련 스크립트
│   └── swiper-bundle.min.js # Swiper 슬라이더 라이브러리
├── css/                    # 스타일시트
│   ├── reset.css
│   ├── common.css
│   ├── main.css
│   ├── form.css
│   └── ...
├── images/                 # 이미지 파일
├── font/                   # 폰트 파일
├── package.json            # Node.js 프로젝트 설정
├── vercel.json             # Vercel 배포 설정
├── .gitignore              # Git 제외 파일 목록
└── README.md               # 이 파일
```

### 주요 파일 설명

| 파일 | 역할 | 수정 필요 시 |
|------|------|-------------|
| `index.html` | 메인 페이지, 폼 제출 로직 | 사이트 내용 변경 시 |
| `api/submit.js` | n8n 웹훅으로 데이터 전송 | API 로직 변경 시 |
| `js/config.js` | 도메인, 엔드포인트 설정 | 기본 도메인 변경 시 |
| `vercel.json` | Vercel 배포 설정 | 런타임, 타임아웃 변경 시 |
| `package.json` | 프로젝트 메타데이터 | Node.js 버전 명시 |

---

## 💻 로컬 개발

### 방법 1: 브라우저에서 직접 열기 (가장 간단)

```bash
# index.html 파일을 브라우저로 열기
# 로컬 개발 모드로 동작 (외부 추적 스크립트 비로드)
```

### 방법 2: 로컬 서버 실행 (권장)

**Python:**
```bash
python -m http.server 8000
# 브라우저에서 http://localhost:8000 접속
```

**Node.js:**
```bash
npx http-server
# 브라우저에서 http://localhost:8080 접속
```

**PHP:**
```bash
php -S localhost:8000
# 브라우저에서 http://localhost:8000 접속
```

### 로컬 개발 모드 특징

- 외부 추적 스크립트 (Naver, Google, Meta 등)가 로드되지 않음
- `config.js`의 `DEFAULT_DOMAIN` 사용
- 폼 제출은 Vercel 배포 후에만 정상 작동 (로컬에서는 API 엔드포인트 없음)

---

## 🚢 배포 및 테스트

### 배포 후 확인 사항

1. **Vercel 배포 확인**
   - 배포 완료 후 제공되는 URL 접속 (예: `https://your-project.vercel.app`)
   - 페이지가 정상적으로 로드되는지 확인

2. **API 엔드포인트 테스트**
   - 브라우저 개발자 도구 → Network 탭 열기
   - 폼 제출
   - `/api/submit` 요청 확인
   - 응답: `200 OK` 또는 `{"success": true}` 확인

3. **n8n 워크플로우 확인**
   - n8n 대시보드에서 워크플로우 실행 로그 확인
   - 데이터가 올바르게 수신되는지 확인

4. **구글 시트 확인**
   - 구글 시트 열기
   - D, E, F 열에 데이터가 추가되었는지 확인
   - 새로운 데이터는 자동으로 다음 행에 추가됨

### 테스트 체크리스트

- [ ] Vercel 배포 URL 접속 확인
- [ ] `/api/submit` 엔드포인트 정상 작동 확인
- [ ] 폼 제출 테스트 (고객명, 번호, 내용 입력)
- [ ] 브라우저 콘솔에 에러 없는지 확인
- [ ] n8n에서 데이터 수신 확인
- [ ] 구글 시트에 데이터 추가 확인
  - [ ] A열: 제출 시간 (submittedAt)
  - [ ] B열: 고객명 (uname)
  - [ ] C열: 연락처 (tel)
  - [ ] D열: 문의 내용 (message)
  - [ ] E열: 클라이언트 IP (clientIp)
  - [ ] F열: 사용자 에이전트 (userAgent)

---

## 🔧 문제 해결

### 1. API가 응답하지 않는 경우

**증상**: 폼 제출 시 에러 발생 또는 응답 없음

**해결 방법:**
1. Vercel Functions 로그 확인:
   - Vercel 대시보드 → **Deployments** → 최신 배포 클릭
   - **Functions** 탭에서 로그 확인
2. 환경 변수 확인:
   - `N8N_WEBHOOK_URL`이 올바른지 확인
   - Vercel 대시보드 → **Settings** → **Environment Variables**
3. n8n 웹훅 URL 확인:
   - n8n에서 워크플로우 활성화 상태 확인
   - 웹훅 URL이 올바른지 확인

### 2. CORS 오류 발생

**증상**: 브라우저 콘솔에 CORS 관련 에러

**해결 방법:**
1. `api/submit.js`의 CORS 헤더 설정 확인
2. `ALLOWED_ORIGINS` 환경 변수 확인 (Vercel에서 설정)
3. 브라우저 콘솔에서 정확한 에러 메시지 확인

### 3. n8n에 데이터가 전달되지 않는 경우

**증상**: Vercel API는 성공했지만 n8n에서 데이터 미수신

**해결 방법:**
1. Vercel Functions 로그에서 n8n 요청 상태 확인:
   - 에러 메시지 확인
   - HTTP 상태 코드 확인
2. n8n 웹훅 설정 확인:
   - 웹훅 URL이 올바른지 확인
   - JWT 인증 사용 시: `JWT_SECRET` 환경 변수 확인
   - Bearer Token 사용 시: 인증 토큰이 올바른지 확인 (`N8N_AUTH_TOKEN`)
3. n8n 워크플로우 상태 확인:
   - 워크플로우가 활성화되어 있는지 확인
   - Webhook 노드가 올바르게 설정되어 있는지 확인
   - JWT 사용 시: Code 노드에서 JWT 검증이 성공하는지 확인

### 3-0. n8n 404 오류: "This webhook is not registered for POST requests"

**증상**: 
```
n8n webhook error: 404 {"code":404,"message":"This webhook is not registered for POST requests. Did you mean to make a GET request?"}
```

**원인**: n8n 웹훅이 POST 요청을 받을 수 있도록 등록되지 않았습니다. 주로 다음과 같은 원인입니다:
1. 워크플로우가 활성화되지 않음
2. Webhook 노드의 HTTP Method가 POST로 설정되지 않음
3. Production URL이 아닌 Test URL을 사용함

**해결 방법:**

1. **워크플로우 활성화 확인 (가장 중요!):**
   - n8n 워크플로우 편집기에서 상단 토글 확인
   - **워크플로우가 활성화(ON)되어 있어야 합니다!**
   - 활성화되지 않았다면 토글을 ON으로 변경
   - 워크플로우 저장

2. **Webhook 노드 HTTP Method 확인:**
   - Webhook 노드 클릭
   - **HTTP Method** 필드 확인
   - 반드시 `POST`로 설정되어 있어야 합니다
   - `GET`으로 설정되어 있다면 `POST`로 변경

3. **Production URL 사용 확인:**
   - Webhook 노드에서 **Production URL** 사용
   - Test URL이 아닌 **Production URL**을 Vercel에 설정
   - Webhook 노드 → "Production URL" 버튼 클릭 → URL 복사
   - Vercel의 `N8N_WEBHOOK_URL` 환경 변수에 Production URL 설정

4. **Webhook 노드 Path 확인:**
   - Webhook 노드의 **Path** 필드 확인
   - 예: `/form-submit`
   - Vercel의 `N8N_WEBHOOK_URL`에 이 경로가 포함되어 있는지 확인
   - 예: `https://dkskfkalsk.app.n8n.cloud/webhook/form-submit`

5. **워크플로우 재저장 및 재활성화:**
   - Webhook 노드 설정 변경 후 워크플로우 저장
   - 워크플로우 재활성화 (토글 OFF → ON)

**404 "not registered for POST requests" 오류 특별 체크리스트:**
- [ ] 워크플로우가 활성화(ON)되어 있는가?
- [ ] Webhook 노드의 HTTP Method가 `POST`로 설정되어 있는가?
- [ ] Webhook 노드의 "Respond"가 **"Using 'Respond to Webhook' Node"**로 설정되어 있는가?
- [ ] Vercel에서 Production URL을 사용하고 있는가? (Test URL 아님)
- [ ] Webhook 노드의 Path가 Vercel URL에 포함되어 있는가?
- [ ] 설정 변경 후 워크플로우를 저장 및 재활성화했는가?

### 3-1. JWT 인증 실패 오류

**증상**: 
- n8n에서 "JWT verification failed" 또는 "Authentication failed" 에러
- n8n webhook error: 403 "invalid signature"

**원인**: JWT 토큰의 서명(signature) 검증이 실패했습니다. 주로 JWT_SECRET 불일치나 검증 코드 문제입니다.

**해결 방법:**

1. **JWT_SECRET 확인 (가장 중요!):**
   - ⚠️ Vercel의 `JWT_SECRET`과 n8n의 `JWT_SECRET`이 **반드시 동일**해야 합니다!
   - n8n → Settings → Variables에서 `JWT_SECRET` 확인
   - Vercel → Settings → Environment Variables에서 `JWT_SECRET` 확인
   - **대소문자, 공백, 특수문자까지 정확히 일치**해야 합니다
   - 값 복사 시 앞뒤 공백이 없는지 확인

2. **JWT_SECRET 재설정 (권장):**
   - Vercel과 n8n 모두에서 기존 `JWT_SECRET` 삭제
   - 새로운 강력한 시크릿 키 생성 (최소 32자 이상)
   - Vercel에 새 `JWT_SECRET` 설정
   - n8n에 **동일한 값**으로 새 `JWT_SECRET` 설정
   - 워크플로우 저장 및 재활성화

3. **JWT 검증 코드 확인:**
   - n8n Code 노드의 JWT 검증 코드가 올바르게 입력되었는지 확인
   - 특히 서명 검증 부분이 정확한지 확인:
     ```javascript
     const signature = crypto
       .createHmac('sha256', secret)
       .update(`${parts[0]}.${parts[1]}`)
       .digest('base64')
       .replace(/=/g, '')
       .replace(/\+/g, '-')
       .replace(/\//g, '_');
     ```
   - Code 노드 실행 로그에서 에러 메시지 확인

4. **JWT 토큰 형식 확인:**
   - Vercel Functions 로그에서 전송되는 Authorization 헤더 확인
   - 형식: `Authorization: Bearer <jwt-token>`
   - JWT 토큰이 3부분(header.payload.signature)으로 구성되어 있는지 확인

5. **JWT 만료 시간 확인:**
   - `JWT_TTL_SECONDS` 환경 변수 확인 (기본값: 300초)
   - 토큰이 만료되기 전에 n8n이 처리하는지 확인
   - 만료된 토큰은 서명 검증 전에 실패합니다

6. **Issuer/Audience 확인:**
   - `JWT_ISSUER`와 `JWT_AUDIENCE`를 설정한 경우, Vercel과 n8n 모두 동일하게 설정되어 있는지 확인
   - 설정하지 않은 경우, Code 노드의 검증 코드에서 해당 부분이 무시되는지 확인

7. **환경 변수 적용 확인:**
   - n8n 환경 변수 변경 후 워크플로우 재저장 및 재활성화
   - Vercel 환경 변수 변경 후 재배포

**403 "invalid signature" 오류 특별 체크리스트:**
- [ ] Vercel `JWT_SECRET`과 n8n `JWT_SECRET`이 정확히 동일한가?
- [ ] JWT_SECRET에 앞뒤 공백이 없는가?
- [ ] JWT_SECRET이 최소 32자 이상인가?
- [ ] n8n Code 노드의 JWT 검증 코드가 올바른가?
- [ ] 환경 변수 변경 후 워크플로우를 재저장/재활성화했는가?
- [ ] Vercel 환경 변수 변경 후 재배포했는가?

### 3-2. n8n 500 오류: "No Respond to Webhook node found"

**증상**: 
```
n8n webhook error: 500 {"code":0,"message":"No Respond to Webhook node found in the workflow"}
```

**원인**: n8n 워크플로우에 "Respond to Webhook" 노드가 없거나, Webhook 노드의 "Respond" 설정이 잘못되어 발생하는 오류입니다.

**⚠️ 중요**: 워크플로우 구조가 올바르게 설정되어 있어도, 다음 사항들이 확인되지 않으면 오류가 계속 발생할 수 있습니다!

**단계별 해결 방법 (순서대로 진행):**

#### 1단계: Webhook 노드의 "Respond" 설정 확인 (필수!)

1. **Webhook 노드 클릭**
2. **Parameters 탭 확인**
3. **"Respond" 필드 확인:**
   - ✅ 올바른 설정: **"Using 'Respond to Webhook' Node"** 선택
   - ❌ 잘못된 설정: "Last Node", "Immediately" 등
4. **잘못 설정되어 있다면:**
   - "Respond" 드롭다운 클릭
   - **"Using 'Respond to Webhook' Node"** 선택
5. **워크플로우 저장** (저장 버튼 클릭)

#### 2단계: "Respond to Webhook" 노드 확인

1. **워크플로우 화면에서 확인:**
   - Webhook 노드
   - Google Sheets 노드
   - **"Respond to Webhook" 노드** ← 이 노드가 있는지 확인!

2. **없다면 추가:**
   - 노드 추가 버튼 클릭
   - "Respond to Webhook" 검색 → 추가
   - Google Sheets 노드 **뒤에** 배치

#### 3단계: 노드 연결 확인

1. **워크플로우 구조 확인:**
   ```
   Webhook → Google Sheets → Respond to Webhook
   ```

2. **연결 확인:**
   - Google Sheets 노드의 출력 포트
   - → "Respond to Webhook" 노드의 입력 포트
   - 연결선이 있는지 확인

3. **연결되어 있지 않다면:**
   - Google Sheets 노드의 출력 포트를
   - "Respond to Webhook" 노드의 입력 포트로 드래그하여 연결

#### 4단계: "Respond to Webhook" 노드 설정 확인

1. **"Respond to Webhook" 노드 클릭**
2. **Parameters 탭 확인:**
   - **Respond With**: `JSON` 선택
   - **Response Code**: `200` 입력
   - **Response Body**: 다음을 **한 줄로** 입력:
     ```
     {{ { "success": true, "message": "Data saved successfully" } }}
     ```
   - ⚠️ **주의**: 줄바꿈 없이 한 줄로 입력해야 합니다!

#### 5단계: 워크플로우 저장 및 재활성화 (매우 중요!)

1. **워크플로우 저장:**
   - 저장 버튼 클릭
   - 저장 완료 확인

2. **워크플로우 재활성화:**
   - 상단 활성화 토글 확인
   - **토글을 OFF로 변경** (비활성화)
   - **3-5초 대기**
   - **토글을 ON으로 변경** (활성화)
   - 활성화 완료 확인 (토글이 녹색으로 표시)

3. **30초 대기:**
   - n8n이 워크플로우 변경사항을 반영하는 데 시간이 필요합니다
   - 변경 후 즉시 테스트하지 말고 30초 정도 대기하세요

#### 6단계: Production URL 확인 (매우 중요!)

1. **n8n Webhook 노드에서 Production URL 확인:**
   - Webhook 노드 클릭
   - **"Production URL"** 버튼 클릭 (Test URL 아님!)
   - URL 복사
   - 예: `https://dkskfkalsk.app.n8n.cloud/webhook/form-submit`

2. **Vercel 환경 변수 확인:**
   - Vercel 대시보드 → 프로젝트 → Settings → Environment Variables
   - `N8N_WEBHOOK_URL` 확인
   - n8n의 Production URL과 **정확히 일치**하는지 확인

3. **URL이 다르다면:**
   - Vercel의 `N8N_WEBHOOK_URL` 수정
   - Production URL로 변경
   - 저장 후 Vercel 재배포 (또는 자동 재배포 대기)

**⚠️ 주의:**
- Test URL (`.../webhook-test/...`)을 사용하면 안 됩니다!
- 반드시 Production URL (`.../webhook/...`)을 사용해야 합니다!
- Production URL은 워크플로우가 활성화되어 있어야 작동합니다!

**완성된 워크플로우 구조:**
```
Webhook (POST /form-submit)
  ↓
[Optional: Code 노드 - JWT 검증]
  ↓
Google Sheets (데이터 추가)
  ↓
Respond to Webhook (응답: {"success": true}) ⬅ 필수!
```

**500 "No Respond to Webhook node found" 오류 완전 해결 체크리스트:**

다음을 **순서대로** 모두 확인하세요:

**Webhook 노드 설정:**
- [ ] Webhook 노드의 "Respond"가 **"Using 'Respond to Webhook' Node"**로 설정되어 있는가? ⬅ 필수!
- [ ] Webhook 노드의 HTTP Method가 `POST`로 설정되어 있는가?
- [ ] Webhook 노드의 Path가 `/form-submit` (또는 설정한 경로)인가?

**워크플로우 구조:**
- [ ] "Respond to Webhook" 노드가 워크플로우에 추가되었는가?
- [ ] "Respond to Webhook" 노드가 Google Sheets 뒤에 배치되어 있는가?
- [ ] Webhook → Google Sheets → Respond to Webhook 순서로 연결되어 있는가?
- [ ] 모든 노드가 연결선으로 연결되어 있는가?

**"Respond to Webhook" 노드 설정:**
- [ ] Respond With가 `JSON`으로 설정되어 있는가?
- [ ] Response Code가 `200`으로 설정되어 있는가?
- [ ] Response Body가 한 줄로 입력되었는가? (줄바꿈 없음)
- [ ] Response Body가 표현식 형식(`{{ }}`)으로 입력되었는가?

**워크플로우 활성화:**
- [ ] 워크플로우가 저장되었는가? (저장 버튼 클릭 확인)
- [ ] 워크플로우를 OFF → ON으로 재활성화했는가?
- [ ] 재활성화 후 30초 이상 대기했는가?

**URL 확인:**
- [ ] Vercel에서 Production URL을 사용하고 있는가? (Test URL 아님)
- [ ] Vercel의 `N8N_WEBHOOK_URL`이 n8n의 Production URL과 정확히 일치하는가?
- [ ] URL에 `-test`가 포함되어 있지 않은가?

**⚠️ 여전히 오류가 발생하는 경우 (마지막 해결 방법):**

위의 모든 단계를 확인했는데도 여전히 오류가 발생한다면:

#### 방법 1: 워크플로우 완전히 새로 만들기

1. **현재 워크플로우 백업 (선택사항):**
   - 워크플로우 설정 → Export 버튼으로 백업

2. **새 워크플로우 생성:**
   - n8n → Workflows → "New Workflow" 클릭
   - 새 워크플로우 이름 입력

3. **Webhook 노드 추가:**
   - 노드 추가 → "Webhook" 검색 → 추가
   - HTTP Method: `POST`
   - Path: `/form-submit`
   - Authentication: `JWT Auth`
   - Credential for JWT Auth: `JWT Auth account` 선택
   - **Respond: "Using 'Respond to Webhook' Node"** 선택 (매우 중요!)

4. **Google Sheets 노드 추가:**
   - 노드 추가 → "Google Sheets" 검색 → 추가
   - Webhook 노드의 출력을 Google Sheets 노드의 입력에 연결
   - Operation: `Append Row`
   - Spreadsheet ID: 구글 시트 ID 입력
   - Sheet: `시트1` (또는 시트명)
   - Mapping Column Mode: `Map Each Column Manually`
   - Values to Send:
     - `submittedAt`: `{{ $json.submittedAt }}`
     - `uname`: `{{ $json.uname }}`
     - `tel`: `{{ $json.tel }}`
     - `message`: `{{ $json.message }}`
     - `clientIp`: `{{ $json.clientIp }}`
     - `userAgent`: `{{ $json.userAgent }}`

5. **Respond to Webhook 노드 추가:**
   - 노드 추가 → "Respond to Webhook" 검색 → 추가
   - Google Sheets 노드의 출력을 Respond to Webhook 노드의 입력에 연결
   - Respond With: `JSON`
   - Response Code: `200`
   - Response Body (한 줄로 입력):
     ```
     {{ { "success": true, "message": "Data saved successfully" } }}
     ```

6. **워크플로우 저장 및 활성화:**
   - 워크플로우 저장
   - Production URL 확인 및 복사
   - 워크플로우 활성화 (토글 ON)
   - 30초 대기

7. **Vercel 환경 변수 업데이트:**
   - Vercel → Settings → Environment Variables
   - `N8N_WEBHOOK_URL`에 새 Production URL 설정
   - 저장 후 자동 재배포 대기

#### 방법 2: n8n 워크플로우 재배포 확인

1. **n8n 클라우드 계정 확인:**
   - n8n 클라우드에서 워크플로우가 제대로 배포되었는지 확인
   - 워크플로우 상태가 "Active"인지 확인

2. **n8n 캐시 문제 확인:**
   - 브라우저 새로고침 (F5)
   - 또는 브라우저 캐시 삭제 후 재접속
   - 다른 브라우저에서 테스트

3. **n8n 로그 확인:**
   - n8n 워크플로우 → Executions 탭에서 실행 로그 확인
   - 오류 메시지 자세히 확인

#### 방법 3: Webhook 노드 설정 재확인

1. **Webhook 노드 완전히 재설정:**
   - Webhook 노드 클릭 → Settings 탭
   - 모든 설정 초기화 후 다시 설정:
     - HTTP Method: `POST`
     - Path: `/form-submit`
     - Authentication: `JWT Auth`
     - **Respond: "Using 'Respond to Webhook' Node"** (다시 한 번 확인!)

2. **워크플로우 완전히 재저장:**
   - 저장 버튼 클릭
   - 워크플로우 토글 OFF → 5초 대기 → ON
   - 30초 대기

**참고**: 
- Webhook 노드를 사용할 때는 반드시 "Respond to Webhook" 노드가 필요합니다
- **Webhook 노드의 "Respond" 설정이 "Using 'Respond to Webhook' Node"로 설정되어 있어야 합니다!**
- 이 설정이 없으면 "Respond to Webhook" 노드가 있어도 인식되지 않아 500 오류가 발생합니다
- 워크플로우 구조가 올바르게 보여도 오류가 발생한다면, 워크플로우를 완전히 새로 만드는 것을 권장합니다
- 자세한 설정 방법은 위의 "3단계: Respond to Webhook 노드 설정" 섹션을 참고하세요

### 4. 구글 시트에 데이터가 추가되지 않는 경우

**증상**: 
- 사이트에서 성공 메시지 표시
- Vercel API 호출 성공
- n8n 워크플로우 실행됨
- 하지만 구글 시트에 데이터가 추가되지 않음

**단계별 해결 방법:**

#### 1단계: n8n 워크플로우 실행 로그 확인 (가장 중요!)

1. **n8n 워크플로우 → Executions 탭 확인:**
   - 최근 실행 내역 확인
   - 실행된 워크플로우 클릭

2. **각 노드의 실행 결과 확인:**
   - Webhook 노드: 데이터 수신 확인
   - Google Sheets 노드: 에러 메시지 확인
   - 에러가 있다면 정확한 에러 메시지 확인

3. **Google Sheets 노드 클릭:**
   - 노드 상세 정보 확인
   - 에러 메시지가 있는지 확인
   - 데이터가 전달되었는지 확인

#### 2단계: Google Sheets 노드 설정 확인

1. **Spreadsheet ID 확인:**
   - Google Sheets 노드 → Parameters 탭
   - Document: `By ID` 선택
   - Spreadsheet ID가 올바른지 확인
   - 구글 시트 URL에서 ID 확인:
     ```
     https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
     ```

2. **Sheet 이름 확인:**
   - Sheet: `From list` 선택
   - Sheet 이름이 정확한지 확인
   - 예: `시트1`, `Sheet1` 등
   - 대소문자, 공백까지 정확히 일치해야 함

3. **Operation 확인:**
   - Operation: `Append Row` 선택되어 있는지 확인

4. **Range 확인 (Append Row 모드에서는 자동 처리되지만 확인):**
   - Range는 비워두거나 `A2:F2`로 설정
   - Append Row 모드에서는 자동으로 다음 행에 추가됨

#### 3단계: 표현식 모드 확인 (매우 중요!)

**각 필드의 Value 입력란에서 "fx" 버튼을 클릭했는지 확인:**

1. Google Sheets 노드 → Parameters 탭
2. "Values to Send" 섹션 확인
3. 각 필드의 Value 입력란 확인:
   - 입력란 왼쪽에 "fx" 버튼이 있는지 확인
   - "fx" 버튼이 활성화되어 있는지 확인 (클릭된 상태)
   - 표현식이 제대로 입력되어 있는지 확인

4. **"fx" 버튼을 클릭하지 않았다면:**
   - 각 필드의 Value 입력란 클릭
   - "fx" 버튼 클릭 (표현식 모드로 전환)
   - 표현식 다시 입력:
     - `submittedAt`: `{{ $json.submittedAt }}`
     - `uname`: `{{ $json.uname }}`
     - `tel`: `{{ $json.tel }}`
     - `message`: `{{ $json.message }}`
     - `clientIp`: `{{ $json.clientIp }}`
     - `userAgent`: `{{ $json.userAgent }}`

#### 4단계: Google 계정 권한 확인

1. **Google Sheets 노드 → Credentials 확인:**
   - "Credential to connect with" 필드 확인
   - Google 계정이 연결되어 있는지 확인
   - 연결이 안 되어 있다면 "Connect account" 클릭하여 연결

2. **Google 계정 권한 확인:**
   - Google 계정이 구글 시트에 접근 권한이 있는지 확인
   - 구글 시트가 공유되어 있는지 확인
   - n8n에서 사용하는 Google 계정이 구글 시트에 접근 가능한지 확인

3. **구글 시트 공유 설정 확인:**
   - 구글 시트 → 공유 버튼
   - n8n에서 사용하는 Google 계정이 공유되어 있는지 확인
   - 또는 구글 시트를 "링크가 있는 모든 사용자"에게 공유

#### 5단계: 데이터 형식 확인

1. **n8n 워크플로우 실행 로그에서 데이터 확인:**
   - Webhook 노드의 출력 데이터 확인
   - Google Sheets 노드의 입력 데이터 확인
   - 데이터가 올바르게 전달되는지 확인

2. **데이터 필드명 확인:**
   - `submittedAt`, `uname`, `tel`, `message`, `clientIp`, `userAgent`가 모두 있는지 확인
   - 필드명이 정확한지 확인 (대소문자 구분)

#### 6단계: Google Sheets 노드 테스트

1. **Google Sheets 노드에서 "Execute step" 버튼 클릭:**
   - 노드 우측 상단의 빨간색 "Execute step" 버튼
   - 테스트 실행하여 에러 확인

2. **에러 메시지 확인:**
   - 에러가 발생하면 정확한 메시지 확인
   - 에러 메시지를 바탕으로 문제 해결

**구글 시트 데이터 미추가 완전 해결 체크리스트:**
- [ ] n8n 워크플로우 실행 로그에서 Google Sheets 노드 에러 확인
- [ ] Spreadsheet ID가 올바른가?
- [ ] Sheet 이름이 정확한가? (대소문자, 공백 포함)
- [ ] 각 필드의 Value 입력란에서 "fx" 버튼을 클릭했는가?
- [ ] 표현식이 올바르게 입력되어 있는가?
- [ ] Google 계정이 연결되어 있는가?
- [ ] Google 계정이 구글 시트에 접근 권한이 있는가?
- [ ] 구글 시트가 공유되어 있는가?
- [ ] Operation이 "Append Row"로 설정되어 있는가?
- [ ] 워크플로우를 저장하고 재활성화했는가?

#### 7단계: 단계별 완전 해결 가이드 (반드시 순서대로 확인!)

**🔴 1단계: n8n 워크플로우 구조 확인 (가장 중요!)**

워크플로우가 다음과 같은 구조인지 확인하세요:

```
Webhook → [Code (JWT 검증)] → Google Sheets → Respond to Webhook
```

**확인 사항:**
1. **Webhook 노드**가 첫 번째 노드인가?
2. **Google Sheets 노드**가 Webhook 노드 뒤에 연결되어 있는가?
3. **Respond to Webhook 노드**가 Google Sheets 노드 뒤에 연결되어 있는가? ⚠️ **이 노드가 없으면 반드시 추가하세요!**
4. 모든 노드가 순서대로 연결되어 있는가?

**🔴 2단계: 워크플로우 활성화 확인**

1. n8n 워크플로우 편집기 상단 확인
2. **워크플로우 토글이 ON(활성화) 상태인지 확인**
3. OFF 상태라면 ON으로 변경
4. 워크플로우 저장 (Ctrl+S 또는 Save 버튼)

**🔴 3단계: n8n 실행 로그 확인 (에러 메시지 확인)**

1. n8n 워크플로우 → **Executions** 탭 클릭
2. 최근 실행 내역에서 가장 최근 실행 클릭
3. 각 노드 클릭하여 확인:
   - **Webhook 노드**: 데이터가 수신되었는지 확인
   - **Google Sheets 노드**: 
     - ✅ 성공: 초록색 체크 표시
     - ❌ 실패: 빨간색 X 표시 + 에러 메시지 확인
   - **Respond to Webhook 노드**: 응답이 전송되었는지 확인

**에러 메시지 예시 및 해결:**
- `"The caller does not have permission"` → Google 계정 권한 문제
- `"Unable to parse range"` → Sheet 이름 또는 Range 설정 문제
- `"No Respond to Webhook node found"` → Respond to Webhook 노드 추가 필요
- `"Spreadsheet not found"` → Spreadsheet ID 확인 필요

**🔴 4단계: Google Sheets 노드 설정 재확인**

1. **Operation**: `Append Row` 선택 확인
2. **Document**: 
   - `From list` 선택
   - Spreadsheet ID가 올바른지 확인
   - 구글 시트 URL에서 ID 확인: `https://docs.google.com/spreadsheets/d/[ID]/edit`
3. **Sheet**: 
   - `From list` 선택
   - Sheet 이름이 정확한지 확인 (`시트1` 또는 `Sheet1`)
   - 대소문자, 공백까지 정확히 일치해야 함
4. **Mapping Column Mode**: `Map Each Column Manually` 선택 확인

**🔴 5단계: Values to Send 필드 재확인 (매우 중요!)**

각 필드의 Value가 올바른지 다시 한 번 확인하세요:

| 필드명 | 올바른 표현식 | 확인 |
|--------|-------------|------|
| `submittedAt` | `{{ $json.submittedAt }}` | [ ] |
| `uname` | `{{ $json.uname }}` | [ ] |
| `tel` | `{{ $json.tel }}` | [ ] |
| `message` | `{{ $json.message }}` | [ ] |
| `clientIp` | `{{ $json.clientIp }}` | [ ] |
| `userAgent` | `{{ $json.userAgent }}` | [ ] |

**각 필드 확인 방법:**
1. 필드의 Value 입력란 클릭
2. "fx" 버튼이 파란색(활성화)인지 확인
3. 표현식이 올바른지 확인
4. 잘못된 표현식이 있다면 수정

**🔴 6단계: Google 계정 권한 확인**

1. **Google Sheets 노드 → Credentials 확인:**
   - "Credential to connect with" 필드에 Google 계정이 연결되어 있는지 확인
   - 연결이 안 되어 있다면 "Connect account" 클릭하여 연결

2. **구글 시트 공유 설정:**
   - 구글 시트 열기
   - 우측 상단 "공유" 버튼 클릭
   - n8n에서 사용하는 Google 계정 이메일 추가
   - 또는 "링크가 있는 모든 사용자"에게 공유 설정

3. **Google 계정 권한 재인증:**
   - n8n → Settings → Credentials
   - Google Sheets 계정 선택
   - "Test connection" 클릭하여 연결 확인
   - 실패 시 "Update" 클릭하여 재인증

**🔴 7단계: Google Sheets 노드 테스트 실행**

1. **Google Sheets 노드에서 "Execute step" 버튼 클릭:**
   - 노드 우측 상단의 빨간색 "Execute step" 버튼
   - 이전 노드(Webhook)의 데이터를 사용하여 테스트 실행

2. **결과 확인:**
   - 성공: 구글 시트에 데이터가 추가되었는지 확인
   - 실패: 에러 메시지 확인하고 위 단계 반복

**🔴 8단계: 워크플로우 재저장 및 재활성화**

모든 설정을 변경한 후:
1. 워크플로우 저장 (Ctrl+S)
2. 워크플로우 토글 OFF → ON (재활성화)
3. 실제 폼 제출 테스트

**🔴 9단계: 실제 테스트 및 로그 확인**

1. 사이트에서 폼 제출
2. n8n → Executions 탭에서 최근 실행 확인
3. 각 노드의 실행 결과 확인
4. Google Sheets 노드에서 에러가 없다면 구글 시트 확인

**여전히 작동하지 않는다면:**
1. n8n 실행 로그의 정확한 에러 메시지를 확인하세요
2. 에러 메시지를 복사하여 문제 해결 가이드에서 검색하세요
3. Google Sheets 노드의 "Execute step" 결과를 확인하세요

#### 10단계: Code 노드 데이터 전달 확인 (JWT 검증 사용 시)

**증상**: Fixed 값으로는 구글 시트에 기록되지만, 표현식(`{{ $json.submittedAt }}` 등)이 작동하지 않음

**원인**: Code 노드(JWT 검증)가 데이터를 제대로 전달하지 않거나, 데이터 구조가 변경됨

**해결 방법:**

1. **Code 노드의 return 문 확인:**
   - Code 노드 코드에서 마지막 부분 확인
   - 반드시 다음 코드가 있어야 합니다:
   ```javascript
   // 검증 성공: 원본 데이터 반환
   return $input.all().map(item => item.json);
   ```
   - 이 return 문이 없거나 다르면 데이터가 전달되지 않습니다!

2. **Webhook 노드의 출력 데이터 확인:**
   - n8n 실행 로그에서 Webhook 노드 클릭
   - "Output" 탭에서 데이터 구조 확인
   - 데이터가 `json` 객체 안에 있는지 확인
   - 예: `{ json: { uname: "...", tel: "...", ... } }`

3. **Code 노드의 출력 데이터 확인:**
   - n8n 실행 로그에서 Code 노드 클릭
   - "Output" 탭에서 데이터 구조 확인
   - Webhook 노드와 동일한 구조인지 확인
   - `$json.submittedAt` 같은 표현식이 작동하려면 데이터가 `json` 객체 안에 있어야 합니다

4. **Code 노드 코드 수정 (필요한 경우):**
   
   만약 Code 노드가 데이터를 제대로 전달하지 않는다면, 다음과 같이 수정하세요:
   
   ```javascript
   // JWT 검증 성공 후
   try {
     const payload = verifyJWT(token, jwtSecret);
     
     // ⚠️ 중요: 원본 데이터를 그대로 반환해야 합니다!
     // Webhook 노드에서 받은 데이터를 그대로 전달
     return $input.all().map(item => ({
       json: item.json  // json 객체를 그대로 유지
     }));
   } catch (error) {
     throw new Error(`Authentication failed: ${error.message}`);
   }
   ```

5. **데이터 구조 확인 방법:**
   - Google Sheets 노드에서 "Execute step" 클릭
   - "Input" 탭에서 데이터 확인
   - 각 필드의 표현식(`{{ $json.submittedAt }}` 등)이 올바른 값을 표시하는지 확인
   - "Result" 섹션에서 실제 값이 보이는지 확인

6. **대안: Code 노드 없이 테스트:**
   - Code 노드를 일시적으로 제거하고 Webhook → Google Sheets 직접 연결
   - 이렇게 해서 작동하면 Code 노드 문제임을 확인
   - 테스트 후 Code 노드 다시 추가하고 위의 방법으로 수정

**Code 노드가 없는 경우 (JWT 검증 미사용):**
- Webhook 노드에서 직접 Google Sheets 노드로 연결
- `{{ $json.submittedAt }}` 같은 표현식이 바로 작동해야 합니다
- 작동하지 않으면 Webhook 노드의 출력 데이터 구조를 확인하세요

### 5. 로컬에서 느리게 로딩되는 경우

**해결 방법:**
- 정상입니다. 로컬 개발 모드에서는 외부 추적 스크립트가 로드되지 않아 실제로는 더 빠릅니다.
- 프로덕션 환경(Vercel 배포 후)에서 확인하세요.

### 6. 도메인이 자동 감지되지 않는 경우

**해결 방법:**
1. `js/config.js`의 `DEFAULT_DOMAIN` 확인
2. Vercel 배포 후에는 자동으로 현재 도메인 사용
3. 커스텀 도메인 연결 후에도 자동 감지됨

---

## 🔐 보안 구성

### ⚠️ 보안 주의사항

**절대 하지 말아야 할 것:**
- ❌ `api/submit.js` 파일에 n8n 웹훅 URL 하드코딩
- ❌ `api/submit.js` 파일에 JWT 시크릿 키 하드코딩
- ❌ `api/submit.js` 파일에 인증 토큰 하드코딩
- ❌ `.env` 파일을 Git에 커밋
- ❌ 민감한 정보가 포함된 코드를 GitHub에 푸시

**올바른 방법:**
- ✅ 모든 민감한 정보는 Vercel 환경 변수로 관리
- ✅ `api/submit.js`는 환경 변수만 사용 (기본값 없음)
- ✅ `.gitignore`에 `.env` 파일 포함 확인
- ✅ GitHub에 푸시하기 전에 코드 검토

### 환경 변수 보호

- **민감한 정보는 절대 코드에 하드코딩하지 마세요!**
- 모든 API 키, 토큰, 웹훅 URL은 Vercel 환경 변수로 관리
- 환경 변수는 **Sensitive** 타입으로 설정 권장
- `api/submit.js` 파일에는 기본값이 없으므로 반드시 환경 변수를 설정해야 합니다

**코드 검증:**
`api/submit.js` 파일을 확인하여 다음과 같은 하드코딩이 없는지 확인하세요:
```javascript
// ❌ 잘못된 예시 (하드코딩)
const webhookUrl = process.env.N8N_WEBHOOK_URL || 'https://your-webhook-url.com';
const jwtSecret = process.env.JWT_SECRET || 'hardcoded-secret-key';

// ✅ 올바른 예시 (환경 변수만 사용)
const webhookUrl = process.env.N8N_WEBHOOK_URL;
const jwtSecret = process.env.JWT_SECRET;
```

### CORS 설정

- `api/submit.js`에서 동적으로 CORS 헤더 설정
- `ALLOWED_ORIGINS` 환경 변수로 허용 도메인 제어 가능
- 기본값은 `*` (모든 도메인 허용)

### 인증

#### JWT 인증 (권장)

- **JWT 토큰 기반 인증** 사용 가능
- `JWT_SECRET` 환경 변수로 설정 (Vercel과 n8n 모두 동일한 값 사용)
- 토큰에 만료 시간(`exp`), 발행자(`iss`), 대상자(`aud`) 포함
- n8n에서는 Code 노드를 사용하여 JWT 검증
- 더 안전하고 유연한 인증 방식

**JWT 토큰 특징:**
- 자동 만료 (기본 5분, `JWT_TTL_SECONDS`로 설정 가능)
- 서명 검증으로 위조 방지
- 발행자/대상자 검증으로 추가 보안 강화

#### Bearer Token 인증 (간단)

- **Bearer Token 기반 인증** 사용 가능
- `N8N_AUTH_TOKEN` 환경 변수로 설정
- n8n Webhook 노드에서 직접 설정
- 간단하지만 토큰 만료 기능 없음

**인증 방식 선택 가이드:**
- **프로덕션 환경**: JWT 인증 권장 (더 안전)
- **개발/테스트 환경**: Bearer Token 또는 인증 없음 (간단)

---

## 📝 주요 변경 사항

### 최근 업데이트

- ✅ `message` 필드가 폼 제출 데이터에 포함되도록 수정
- ✅ Vercel 배포 설정 (`vercel.json`) 최적화
- ✅ n8n → 구글 시트 연동 설정 가이드 추가
- ✅ 구글 시트 D, E, F 열 자동 추가 기능 구현
- ✅ 환경 변수 기반 CORS 설정 개선
- ✅ **JWT 인증 설정 가이드 추가** (Vercel + n8n)
- ✅ n8n Code 노드를 사용한 JWT 검증 방법 상세 설명
- ✅ **보안 강화: 하드코딩된 민감 정보 제거** (`api/submit.js`)
- ✅ **보안 가이드 추가**: 환경 변수만 사용하도록 수정 및 문서화

---

## 📞 지원 및 문의

### 설정 변경 가이드

| 변경 내용 | 수정 위치 |
|----------|----------|
| 환경 변수 (n8n URL, JWT 시크릿, 토큰) | Vercel 프로젝트 설정 → Environment Variables |
| n8n 환경 변수 (JWT 시크릿) | n8n → Settings → Variables |
| 기본 도메인 | `js/config.js` → `DEFAULT_DOMAIN` |
| 신청 완료 페이지 | `js/config.js` → `THANK_YOU_URL` |
| 사이트 내용 | `index.html` |
| API 로직 | `api/submit.js` |
| 배포 설정 | `vercel.json` |
| n8n JWT 검증 코드 | n8n 워크플로우 → Code 노드 |

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [n8n 공식 문서](https://docs.n8n.io/)
- [Google Sheets API 문서](https://developers.google.com/sheets/api)

---

## ✅ 배포 체크리스트

### 배포 전 확인

- [ ] `vercel.json` 파일이 프로젝트 루트에 있음
- [ ] `package.json` 파일이 있음
- [ ] **보안 확인 (중요!)**
  - [ ] `api/submit.js`에 하드코딩된 웹훅 URL이 없음
  - [ ] `api/submit.js`에 하드코딩된 JWT 시크릿이 없음
  - [ ] `api/submit.js`에 하드코딩된 인증 토큰이 없음
  - [ ] `.env` 파일이 `.gitignore`에 포함되어 있음
  - [ ] 민감한 정보가 코드에 포함되지 않았는지 최종 확인
- [ ] n8n 웹훅 URL 확인 및 테스트 완료
- [ ] Vercel 환경 변수 설정 완료
  - [ ] `N8N_WEBHOOK_URL` 설정
  - [ ] JWT 인증 사용 시: `JWT_SECRET` 설정 (n8n과 동일한 값)
  - [ ] JWT 인증 사용 시: `JWT_ISSUER`, `JWT_AUDIENCE` 선택 설정
  - [ ] Bearer Token 사용 시: `N8N_AUTH_TOKEN` 설정
  - [ ] 모든 환경 변수가 **Sensitive** 타입으로 설정됨
- [ ] n8n 환경 변수 설정 완료 (JWT 사용 시)
  - [ ] n8n → Settings → Variables에서 `JWT_SECRET` 설정 (Vercel과 동일)
  - [ ] n8n → Settings → Variables에서 `JWT_ISSUER`, `JWT_AUDIENCE` 설정 (사용하는 경우)
- [ ] n8n 워크플로우 설정 완료
  - [ ] Webhook 노드 설정
  - [ ] JWT 인증 사용 시: Code 노드 추가 및 JWT 검증 코드 입력
  - [ ] Google Sheets 노드 설정
  - [ ] 워크플로우 활성화
- [ ] 코드가 Git에 커밋됨

### 배포 후 확인

- [ ] Vercel 배포 URL 접속 확인
- [ ] `/api/submit` 엔드포인트 정상 작동 확인
- [ ] 폼 제출 테스트 성공
- [ ] Vercel Functions 로그에서 JWT 토큰 생성 확인 (JWT 사용 시)
- [ ] n8n에서 데이터 수신 확인
  - [ ] JWT 인증 사용 시: Code 노드에서 JWT 검증 성공 확인
- [ ] 구글 시트에 데이터 추가 확인
  - [ ] A열: 제출 시간 (submittedAt)
  - [ ] B열: 고객명 (uname)
  - [ ] C열: 연락처 (tel)
  - [ ] D열: 문의 내용 (message)
  - [ ] E열: 클라이언트 IP (clientIp)
  - [ ] F열: 사용자 에이전트 (userAgent)

---

**마지막 업데이트**: 2025년

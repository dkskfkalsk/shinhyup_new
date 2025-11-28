/**
 * 구글 시트 Apps Script 코드
 * 
 * 사용 방법:
 * 1. 구글 시트에서 확장 프로그램 > Apps Script 클릭
 * 2. 아래 코드를 붙여넣기
 * 3. 저장 후 배포 > 새 배포 > 웹 앱으로 배포
 * 4. 생성된 Web App URL을 Vercel 환경 변수에 추가
 */

function doPost(e) {
  try {
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 보안 토큰 확인 (선택사항이지만 권장)
    const SECRET_TOKEN = 'YOUR_SECRET_TOKEN_HERE'; // Vercel 환경 변수와 동일하게 설정
    if (data.token && data.token !== SECRET_TOKEN) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid token' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 스프레드시트 ID (환경 변수에서 가져오거나 하드코딩)
    const SPREADSHEET_ID = '17fKb6pNg1rHrLm-Jd4QxKiDsnQUPwI40dy9UBcegOf4';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    // 현재 시간 (대한민국 시간 기준, KST UTC+9)
    // Apps Script는 기본적으로 스크립트 소유자의 시간대를 사용
    // 한국 시간대로 명시적으로 변환
    const now = new Date();
    // UTC 시간을 한국 시간(UTC+9)으로 변환
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000)); // UTC+9
    const timestamp = koreaTime;
    
    // 데이터 배열 준비
    // B열: 접수시간, C열: 고객이름, D열: 연락처, E열: 접수내용, F열: 고객IP
    const row = [
      '',                                          // A열: 비워둠
      timestamp,                                   // B열: 접수시간
      data.uname || '',                            // C열: 고객이름
      data.tel || '',                              // D열: 연락처
      data.message || '',                         // E열: 접수내용
      data.clientIp || ''                          // F열: 고객IP
    ];
    
    // 시트에 데이터 추가
    sheet.appendRow(row);
    
    // 성공 응답 반환
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 발생 시
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// GET 요청 테스트용 (선택사항)
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Google Apps Script Web App is running',
      method: 'GET'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


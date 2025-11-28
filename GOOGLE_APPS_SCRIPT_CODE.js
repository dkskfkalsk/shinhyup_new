/**
 * 구글 시트 Apps Script 코드 (하드코딩 없이 동적 설정)
 * 
 * 📋 사용 방법 (3단계):
 * 
 * 1️⃣ 코드 복붙
 *    - 구글 시트에서 확장 프로그램 > Apps Script 클릭
 *    - 이 파일의 전체 코드를 복사해서 붙여넣기
 * 
 * 2️⃣ 설정값 변경 (아래 두 값만 변경!)
 *    - setupScriptProperties() 함수를 찾아서
 *    - SECRET_TOKEN: Vercel 환경 변수 GOOGLE_APPS_SCRIPT_TOKEN과 동일하게 입력
 *    - SPREADSHEET_ID: 구글 시트 ID 입력 (또는 비워두면 현재 시트 자동 사용)
 * 
 * 3️⃣ 설정 함수 실행
 *    - 함수 선택: setupScriptProperties
 *    - 실행 버튼 클릭 (▶️)
 *    - 권한 승인
 *    - 로그에서 "설정 완료!" 확인
 * 
 * 4️⃣ 웹 앱 배포
 *    - 배포 > 새 배포 > 웹 앱
 *    - "다음 사용자 인증 정보로 실행": 나
 *    - "엑세스 권한이 있는 사용자": 모든 사용자
 *    - Web App URL 복사해서 Vercel 환경 변수에 추가
 * 
 * 💡 시트 ID 찾는 방법:
 *    구글 시트 URL: https://docs.google.com/spreadsheets/d/[여기가_시트_ID]/edit
 */

// 설정값 가져오기 함수 (Script Properties 사용)
function getConfig() {
  const properties = PropertiesService.getScriptProperties();
  
  // Script Properties에서 설정값 가져오기 (없으면 null)
  const secretToken = properties.getProperty('SECRET_TOKEN');
  const spreadsheetId = properties.getProperty('SPREADSHEET_ID');
  
  return {
    secretToken: secretToken,
    spreadsheetId: spreadsheetId
  };
}

// 설정값 저장 함수 (처음 한 번만 실행)
function setupScriptProperties() {
  const properties = PropertiesService.getScriptProperties();
  
  // ============================================
  // ⚠️ 여기만 변경하세요! ⚠️
  // 아래 두 줄의 'YOUR_SECRET_TOKEN_HERE'와 'YOUR_SPREADSHEET_ID_HERE'를
  // 실제 값으로 바꿔주세요!
  // ============================================
  const SECRET_TOKEN = 'YOUR_SECRET_TOKEN_HERE'; // 👈 여기를 실제 토큰으로 변경 (예: 'my-secret-token-123')
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // 👈 여기를 실제 시트 ID로 변경 (예: '1a2b3c4d5e6f7g8h9i0j')
  // ============================================
  
  // 현재 설정값 확인
  const currentToken = properties.getProperty('SECRET_TOKEN');
  const currentSheetId = properties.getProperty('SPREADSHEET_ID');
  
  // 이미 설정되어 있으면 현재 값 표시
  if (currentToken || currentSheetId) {
    Logger.log('현재 설정값:');
    Logger.log('SECRET_TOKEN: ' + (currentToken ? '설정됨' : '미설정'));
    Logger.log('SPREADSHEET_ID: ' + (currentSheetId || '미설정'));
    Logger.log('\n설정을 변경하려면 위 코드의 값을 수정하고 다시 실행하세요.');
    
    // 값이 변경되었으면 업데이트
    // ⚠️ 아래 'YOUR_SECRET_TOKEN_HERE'는 비교용이므로 그대로 두세요!
    if (SECRET_TOKEN && SECRET_TOKEN !== 'YOUR_SECRET_TOKEN_HERE') {
      properties.setProperty('SECRET_TOKEN', SECRET_TOKEN);
      Logger.log('SECRET_TOKEN 업데이트 완료');
    }
    
    // ⚠️ 아래 'YOUR_SPREADSHEET_ID_HERE'는 비교용이므로 그대로 두세요!
    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
      properties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
      Logger.log('SPREADSHEET_ID 업데이트 완료: ' + SPREADSHEET_ID);
    }
    
    return;
  }
  
  // 설정값 저장
  // ⚠️ 아래 'YOUR_SECRET_TOKEN_HERE'는 비교용이므로 그대로 두세요!
  if (SECRET_TOKEN && SECRET_TOKEN !== 'YOUR_SECRET_TOKEN_HERE') {
    properties.setProperty('SECRET_TOKEN', SECRET_TOKEN);
    Logger.log('SECRET_TOKEN 설정 완료');
  }
  
  // ⚠️ 아래 'YOUR_SPREADSHEET_ID_HERE'는 비교용이므로 그대로 두세요!
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
    properties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
    Logger.log('SPREADSHEET_ID 설정 완료: ' + SPREADSHEET_ID);
  } else {
    Logger.log('SPREADSHEET_ID를 비워두면 현재 스프레드시트를 자동으로 사용합니다.');
  }
  
  Logger.log('\n설정 완료! 이제 doPost 함수가 정상 작동 합니다.');
}

function doPost(e) {
  try {
    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);
    
    // 디버깅: 받은 데이터 로그
    Logger.log('=== doPost 호출됨 ===');
    Logger.log('받은 데이터: ' + JSON.stringify(data));
    
    // 설정값 가져오기
    const config = getConfig();
    
    // 디버깅: 설정값 확인
    Logger.log('설정값 확인:');
    Logger.log('SECRET_TOKEN: ' + (config.secretToken ? '설정됨' : '미설정'));
    Logger.log('SPREADSHEET_ID: ' + (config.spreadsheetId || '미설정'));
    
    // 보안 토큰 확인 (설정되어 있는 경우에만)
    if (config.secretToken) {
      if (data.token && data.token !== config.secretToken) {
        Logger.log('토큰 불일치! 받은 토큰: ' + data.token + ', 설정된 토큰: ' + config.secretToken);
        return ContentService
          .createTextOutput(JSON.stringify({ success: false, error: 'Invalid token' }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      Logger.log('토큰 확인 완료');
    } else {
      Logger.log('토큰이 설정되지 않아 토큰 검증을 건너뜁니다.');
    }
    
    // 스프레드시트 가져오기
    let spreadsheet;
    if (config.spreadsheetId) {
      // Script Properties에 ID가 설정되어 있으면 해당 시트 사용
      Logger.log('시트 ID로 열기 시도: ' + config.spreadsheetId);
      try {
        spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
        Logger.log('시트 열기 성공: ' + spreadsheet.getName());
      } catch (error) {
        Logger.log('시트 열기 실패: ' + error.toString());
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            error: '시트를 열 수 없습니다. 시트 ID가 올바른지 확인하세요: ' + error.toString()
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    } else {
      // 설정되지 않았으면 현재 스프레드시트 사용 (Apps Script가 시트 내에서 실행되는 경우)
      Logger.log('현재 스프레드시트 사용 시도');
      try {
        spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        Logger.log('현재 시트 열기 성공: ' + spreadsheet.getName());
      } catch (error) {
        Logger.log('현재 시트 열기 실패: ' + error.toString());
        // 현재 시트를 찾을 수 없으면 에러 반환
        return ContentService
          .createTextOutput(JSON.stringify({ 
            success: false, 
            error: '스프레드시트를 찾을 수 없습니다. setupScriptProperties() 함수를 실행하여 SPREADSHEET_ID를 설정하거나, Apps Script를 시트 내에서 실행하세요.' 
          }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 시트 가져오기 (명시적으로 "sheet1" 탭 사용)
    let sheet;
    const targetSheetName = 'sheet1'; // 저장할 시트 이름
    
    try {
      // "sheet1"이라는 이름의 시트 찾기
      sheet = spreadsheet.getSheetByName(targetSheetName);
      
      if (!sheet) {
        // "sheet1"이 없으면 첫 번째 시트 사용
        Logger.log('⚠️ "sheet1" 시트를 찾을 수 없습니다. 첫 번째 시트를 사용합니다.');
        sheet = spreadsheet.getSheets()[0];
      } else {
        Logger.log('✅ "sheet1" 시트를 찾았습니다.');
      }
    } catch (error) {
      // 오류 발생 시 첫 번째 시트 사용
      Logger.log('⚠️ 시트 찾기 오류: ' + error.toString() + ', 첫 번째 시트를 사용합니다.');
      sheet = spreadsheet.getSheets()[0];
    }
    
    Logger.log('사용할 시트 이름: ' + sheet.getName());
    Logger.log('시트 URL: ' + spreadsheet.getUrl() + '#gid=' + sheet.getSheetId());
    
    // 시트 이름 확인 (예상과 다르면 경고)
    if (sheet.getName().toLowerCase() !== targetSheetName.toLowerCase()) {
      Logger.log('⚠️ 경고: 예상한 시트 이름("' + targetSheetName + '")과 다릅니다. 실제 시트: "' + sheet.getName() + '"');
    }
    
    // 현재 시트의 마지막 행 확인 (디버깅용)
    const lastRow = sheet.getLastRow();
    Logger.log('현재 시트의 마지막 행: ' + lastRow);
    
    // 시트의 모든 데이터 확인 (디버깅용 - 최근 5행만)
    if (lastRow > 0) {
      const lastDataRange = sheet.getRange(Math.max(1, lastRow - 4), 1, Math.min(5, lastRow), 6);
      const lastData = lastDataRange.getValues();
      Logger.log('최근 데이터 (최근 5행):');
      for (let i = 0; i < lastData.length; i++) {
        Logger.log('행 ' + (lastRow - 4 + i) + ': ' + JSON.stringify(lastData[i]));
      }
    }
    
    // 현재 시간 (대한민국 시간 기준, KST UTC+9)
    // Apps Script는 기본적으로 스크립트 소유자의 시간대를 사용
    // 한국 시간대로 명시적으로 변환
    const now = new Date();
    // UTC 시간을 한국 시간(UTC+9)으로 변환
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
    const koreaTime = new Date(utcTime + (9 * 60 * 60 * 1000)); // UTC+9
    const timestamp = koreaTime;
    
    // 데이터 배열 준비
    // A열: 비워둠, B열: 접수시간, C열: 고객이름, D열: 연락처, E열: 접수내용, F열: 고객IP
    const row = [
      '',                                          // A열: 비워둠
      timestamp,                                   // B열: 접수시간
      data.uname || '',                            // C열: 고객이름
      data.tel || '',                              // D열: 연락처
      data.message || '',                         // E열: 접수내용
      data.clientIp || ''                          // F열: 고객IP
    ];
    
    // 디버깅: 저장될 데이터 확인
    Logger.log('=== 저장될 데이터 ===');
    Logger.log('A열: (비워둠)');
    Logger.log('B열 (시간): ' + timestamp);
    Logger.log('C열 (고객명): ' + (data.uname || ''));
    Logger.log('D열 (연락처): ' + (data.tel || ''));
    Logger.log('E열 (문의내용): ' + (data.message || ''));
    Logger.log('F열 (IP): ' + (data.clientIp || ''));
    
    // 시트에 데이터 추가 (appendRow는 자동으로 마지막 비어있는 행에 추가)
    // 헤더가 1행에 있으면 2행부터, 데이터가 있으면 그 다음 행에 자동 추가됨
    const beforeRow = sheet.getLastRow();
    Logger.log('저장 전 마지막 행: ' + beforeRow);
    
    sheet.appendRow(row);
    
    // 저장 후 마지막 행 확인 및 검증
    const afterRow = sheet.getLastRow();
    Logger.log('저장 후 마지막 행: ' + afterRow);
    
    if (afterRow <= beforeRow) {
      Logger.log('⚠️ 경고: 행이 증가하지 않았습니다! appendRow가 제대로 실행되지 않았을 수 있습니다.');
    } else {
      Logger.log('✅ 행이 증가했습니다: ' + beforeRow + ' → ' + afterRow);
    }
    
    // 저장된 데이터 확인 (실제로 저장되었는지 검증)
    const savedRow = afterRow;
    const savedData = sheet.getRange(savedRow, 1, 1, 6).getValues()[0];
    Logger.log('저장된 위치: B' + savedRow + ' ~ F' + savedRow);
    Logger.log('저장된 데이터 확인:');
    Logger.log('  A열: ' + savedData[0]);
    Logger.log('  B열: ' + savedData[1]);
    Logger.log('  C열: ' + savedData[2]);
    Logger.log('  D열: ' + savedData[3]);
    Logger.log('  E열: ' + savedData[4]);
    Logger.log('  F열: ' + savedData[5]);
    
    // 데이터 일치 여부 확인
    if (savedData[1] && savedData[2] === (data.uname || '')) {
      Logger.log('✅ 데이터 저장 확인됨!');
    } else {
      Logger.log('⚠️ 경고: 저장된 데이터가 예상과 다릅니다.');
    }
    
    // 성공 응답 반환
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully' 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // 에러 발생 시
    Logger.log('에러 발생: ' + error.toString());
    Logger.log('에러 스택: ' + error.stack);
    return ContentService
      .createTextOutput(JSON.stringify({ 
        success: false, 
        error: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 설정 확인 함수 (디버깅용)
function checkConfig() {
  const config = getConfig();
  Logger.log('=== 현재 설정 확인 ===');
  Logger.log('SECRET_TOKEN: ' + (config.secretToken || '미설정'));
  Logger.log('SPREADSHEET_ID: ' + (config.spreadsheetId || '미설정'));
  
  if (config.spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
      Logger.log('시트 이름: ' + spreadsheet.getName());
      Logger.log('시트 URL: ' + spreadsheet.getUrl());
      Logger.log('시트 접근 가능: 예');
    } catch (error) {
      Logger.log('시트 접근 불가: ' + error.toString());
    }
  } else {
    Logger.log('SPREADSHEET_ID가 설정되지 않았습니다.');
    Logger.log('setupScriptProperties() 함수를 실행하여 설정하세요.');
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


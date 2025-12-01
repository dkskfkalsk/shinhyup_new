/**
 * 구글 시트 Apps Script 코드 (B열부터 시작, A열 완전 무시)
 * 
 * 📋 사용 방법:
 * 1️⃣ 코드 전체 복붙 → Apps Script 편집기
 * 2️⃣ setupScriptProperties() 실행 → 로그에서 "설정 완료!" 확인
 * 3️⃣ 웹 앱 재배포 → 새 URL을 Vercel에 설정
 * 
 * 🔑 특징:
 * - A열에 뭐가 있든 상관없이 완전히 무시 (함수, 값, 아무것도 안 건드림)
 * - B열부터만 값이 있는지 확인하여 다음 빈 행에 저장
 * - B~F열에만 데이터 저장 (A열은 건드리지 않음)
 * - B열 기준으로 올바른 다음 빈 행 자동 찾기
 */

// 설정값 가져오기 함수
function getConfig() {
  const properties = PropertiesService.getScriptProperties();
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
  const SECRET_TOKEN = ' '; 
  const SPREADSHEET_ID = ' '; 
  // ============================================
  
  const currentToken = properties.getProperty('SECRET_TOKEN');
  const currentSheetId = properties.getProperty('SPREADSHEET_ID');
  
  if (currentToken || currentSheetId) {
    Logger.log('현재 설정값:');
    Logger.log('SECRET_TOKEN: ' + (currentToken ? '설정됨' : '미설정'));
    Logger.log('SPREADSHEET_ID: ' + (currentSheetId || '미설정'));
    
    if (SECRET_TOKEN && SECRET_TOKEN !== 'YOUR_SECRET_TOKEN_HERE') {
      properties.setProperty('SECRET_TOKEN', SECRET_TOKEN);
      Logger.log('🔄 SECRET_TOKEN 업데이트 완료');
    }
    
    if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
      properties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
      Logger.log('🔄 SPREADSHEET_ID 업데이트 완료: ' + SPREADSHEET_ID);
    }
    return;
  }
  
  if (SECRET_TOKEN && SECRET_TOKEN !== 'YOUR_SECRET_TOKEN_HERE') {
    properties.setProperty('SECRET_TOKEN', SECRET_TOKEN);
    Logger.log('✅ SECRET_TOKEN 설정 완료');
  }
  
  if (SPREADSHEET_ID && SPREADSHEET_ID !== 'YOUR_SPREADSHEET_ID_HERE') {
    properties.setProperty('SPREADSHEET_ID', SPREADSHEET_ID);
    Logger.log('✅ SPREADSHEET_ID 설정 완료: ' + SPREADSHEET_ID);
  }
  
  Logger.log('\n🎉 설정 완료! 이제 웹 앱 재배포하세요.');
}

function doPost(e) {
  Logger.log('🚀 === doPost 호출됨 (시간: ' + new Date() + ') ===');
  
  try {
    // 1단계: POST 요청 검증
    if (!e) {
      Logger.log('❌ 오류: e 파라미터가 undefined (편집기 직접 실행)');
      return errorResponse('Invalid request: e is undefined');
    }
    
    if (!e.postData) {
      Logger.log('❌ 오류: e.postData가 undefined');
      Logger.log('e.queryString: ' + (e.queryString || '없음'));
      Logger.log('e.parameter: ' + JSON.stringify(e.parameter || {}));
      return errorResponse('Invalid POST data');
    }
    
    Logger.log('✅ POST 요청 확인됨');
    Logger.log('📥 postData.type: ' + e.postData.type);
    Logger.log('📥 postData.contents (원본): ' + e.postData.contents);
    
    // 2단계: JSON 파싱
    let data;
    try {
      data = JSON.parse(e.postData.contents);
      Logger.log('✅ JSON 파싱 성공: ' + JSON.stringify(data));
    } catch (parseError) {
      Logger.log('❌ JSON 파싱 실패: ' + parseError.toString());
      Logger.log('원본 데이터: ' + e.postData.contents);
      return errorResponse('Invalid JSON: ' + parseError.toString());
    }
    
    // 3단계: 설정값 확인
    const config = getConfig();
    Logger.log('🔧 설정값:');
    Logger.log('  SECRET_TOKEN: ' + (config.secretToken ? '설정됨' : '❌ 미설정'));
    Logger.log('  SPREADSHEET_ID: ' + (config.spreadsheetId || '❌ 미설정'));
    
    // 4단계: 토큰 검증
    if (config.secretToken) {
      if (!data.token || data.token !== config.secretToken) {
        Logger.log('❌ 토큰 불일치! 받은 토큰: "' + (data.token || '없음') + '"');
        return errorResponse('Invalid token');
      }
      Logger.log('✅ 토큰 검증 완료');
    }
    
    // 5단계: 스프레드시트 접근
    let spreadsheet;
    if (config.spreadsheetId) {
      Logger.log('📊 시트 열기 시도: ' + config.spreadsheetId);
      try {
        spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
        Logger.log('✅ 시트 접근 성공: ' + spreadsheet.getName());
        Logger.log('📎 시트 URL: ' + spreadsheet.getUrl());
      } catch (sheetError) {
        Logger.log('❌ 시트 접근 실패: ' + sheetError.toString());
        return errorResponse('Spreadsheet access failed: ' + sheetError.toString());
      }
    } else {
      Logger.log('❌ SPREADSHEET_ID 미설정');
      return errorResponse('SPREADSHEET_ID not configured');
    }
    
    // 6단계: 시트 선택
    let sheet;
    const targetSheetName = 'sheet1';
    try {
      sheet = spreadsheet.getSheetByName(targetSheetName);
      if (!sheet) {
        Logger.log('⚠️ "' + targetSheetName + '" 없음 → 첫 번째 시트 사용');
        sheet = spreadsheet.getSheets()[0];
      } else {
        Logger.log('✅ "' + targetSheetName + '" 시트 찾음');
      }
    } catch (sheetError) {
      Logger.log('⚠️ 시트 선택 오류 → 첫 번째 시트 사용: ' + sheetError.toString());
      sheet = spreadsheet.getSheets()[0];
    }
    
    Logger.log('📄 사용 시트: ' + sheet.getName());
    
    // 7단계: B열 기준으로 다음 빈 행 찾기 (A열은 완전히 무시)
    // A열에 뭐가 있든 상관없이 B열만 확인하여 다음 빈 행에 저장
    
    // B열 전체 가져오기
    const bColumnRange = sheet.getRange('B:B');
    const bColumnValues = bColumnRange.getValues();
    
    // B열에서 아래에서 위로 스캔하여 마지막으로 값이 있는 행 찾기
    let lastRowWithData = 0;
    for (let i = bColumnValues.length - 1; i >= 0; i--) {
      const cellValue = bColumnValues[i][0];
      // 값이 있는지 확인 (null, 빈 문자열, 공백만 있는 경우 제외)
      if (cellValue !== null && cellValue !== '' && String(cellValue).trim() !== '') {
        lastRowWithData = i + 1; // Apps Script 행 번호는 1부터 시작
        break;
      }
    }
    
    // 다음 빈 행 계산 (B열에 값이 있는 마지막 행 + 1)
    let targetRow;
    if (lastRowWithData > 0) {
      targetRow = lastRowWithData + 1;
    } else {
      // B열이 완전히 비어있으면 2번째 행부터 시작 (1번째 행은 헤더일 수 있음)
      targetRow = 2;
    }
    
    Logger.log('📏 A열 무시 - B열 기준 마지막 데이터 행: ' + lastRowWithData);
    Logger.log('📝 데이터를 저장할 행: ' + targetRow + ' (B열~F열)');
    
    // 8단계: 데이터 준비 (B열부터 시작)
    const koreaTime = new Date(new Date().getTime() + (9 * 60 * 60 * 1000));
    const rowData = [
      koreaTime,                    // B열: 접수시간
      data.uname || '',             // C열: 고객이름
      data.tel || '',               // D열: 연락처
      data.message || '',           // E열: 접수내용
      data.clientIp || ''           // F열: 고객IP
    ];
    
    Logger.log('💾 저장할 데이터:');
    Logger.log('  B열 시간: ' + koreaTime);
    Logger.log('  C열 이름: ' + (data.uname || '없음'));
    Logger.log('  D열 전화: ' + (data.tel || '없음'));
    Logger.log('  E열 내용: ' + (data.message || '없음'));
    Logger.log('  F열 IP: ' + (data.clientIp || '없음'));
    
    // 9단계: B열부터 데이터 저장 (A열은 완전히 무시, 건드리지 않음)
    // getRange(행, 열, 행 수, 열 수) 형식
    // B열 = 열 2, C열 = 열 3, D열 = 열 4, E열 = 열 5, F열 = 열 6
    // 5개 열에 데이터 저장 (B~F열만, A열은 건드리지 않음)
    const range = sheet.getRange(targetRow, 2, 1, 5); // 행=targetRow, 열=2(B열), 행수=1, 열수=5
    range.setValues([rowData]);
    
    Logger.log('✅ 데이터 저장 완료: 행 ' + targetRow + ', B열~F열');
    
    // 10단계: 저장 검증
    const savedData = sheet.getRange(targetRow, 2, 1, 5).getValues()[0];
    Logger.log('✅ 저장 검증:');
    Logger.log('  실제 저장된 데이터: ' + JSON.stringify(savedData));
    
    Logger.log('🎉 === 모든 과정 성공 완료 ===');
    
    return successResponse('Data saved successfully to row ' + targetRow + ' (columns B~F)');
    
  } catch (error) {
    Logger.log('💥 최종 에러: ' + error.toString());
    Logger.log('에러 스택: ' + error.stack);
    return errorResponse('Server error: ' + error.toString());
  }
}

// 헬퍼 함수들
function successResponse(message) {
  const response = { success: true, message: message, timestamp: new Date().toISOString() };
  Logger.log('📤 응답: ' + JSON.stringify(response));
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(error) {
  const response = { success: false, error: error };
  Logger.log('📤 에러 응답: ' + JSON.stringify(response));
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// 설정 확인 함수 (디버깅용)
function checkConfig() {
  Logger.log('🔍 === 설정 및 시트 접근 테스트 ===');
  const config = getConfig();
  Logger.log('SECRET_TOKEN: ' + (config.secretToken || '❌ 미설정'));
  Logger.log('SPREADSHEET_ID: ' + (config.spreadsheetId || '❌ 미설정'));
  
  if (config.spreadsheetId) {
    try {
      const spreadsheet = SpreadsheetApp.openById(config.spreadsheetId);
      Logger.log('✅ 시트 이름: ' + spreadsheet.getName());
      Logger.log('✅ 시트 URL: ' + spreadsheet.getUrl());
      Logger.log('✅ 시트 접근 가능');
      
      const sheets = spreadsheet.getSheets();
      Logger.log('📋 모든 시트 목록:');
      sheets.forEach((sheet, index) => {
        Logger.log('  ' + (index+1) + '. ' + sheet.getName());
      });
    } catch (error) {
      Logger.log('❌ 시트 접근 불가: ' + error.toString());
    }
  }
}

// GET 요청 테스트용
function doGet(e) {
  Logger.log('🌐 GET 요청 수신');
  return ContentService
    .createTextOutput(JSON.stringify({ 
      message: 'Google Apps Script Web App 정상 작동 중',
      config: getConfig(),
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


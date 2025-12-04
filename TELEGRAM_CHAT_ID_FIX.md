# 📱 Telegram "chat not found" 오류 해결 가이드

## 오류 원인

`Bad Request: chat not found` 오류는 다음 중 하나일 수 있습니다:

1. **Chat ID가 잘못됨**
2. **봇이 해당 채팅방에 없음**
3. **봇이 채팅방에서 제거됨**
4. **봇과 개인 채팅을 시작하지 않음**

## 해결 방법

### 1단계: Chat ID 재확인

#### 개인 채팅인 경우:
1. Telegram에서 봇과 1:1 채팅 시작
2. 봇에게 아무 메시지나 보내기 (예: `/start`)
3. 브라우저에서 접속 (YOUR_BOT_TOKEN을 실제 토큰으로 교체):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
4. JSON 응답에서 `"chat":{"id":122136789}` 값 확인
5. **양수**인지 확인 (개인 채팅은 양수)

#### 그룹 채팅인 경우:
1. 그룹에 봇 추가 (봇이 그룹에 있어야 함!)
2. 그룹에서 봇에게 메시지 보내기
3. 위와 동일하게 `getUpdates` API로 Chat ID 확인
4. **음수**인지 확인 (그룹 채팅은 음수, 예: `-1234073437`)

### 2단계: 봇이 채팅방에 있는지 확인

#### 그룹 채팅인 경우:
- 그룹 멤버 목록에서 봇이 있는지 확인
- 봇이 없다면 그룹에 추가

#### 개인 채팅인 경우:
- 봇과 1:1 채팅을 시작했는지 확인
- 봇에게 `/start` 명령어 보내기

### 3단계: Chat ID 테스트

브라우저에서 직접 테스트 (YOUR_BOT_TOKEN과 YOUR_CHAT_ID를 실제 값으로 교체):
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/sendMessage?chat_id=<YOUR_CHAT_ID>&text=테스트
```

**성공**: 메시지가 Telegram에 전송됨
**실패**: "chat not found" 오류 → Chat ID가 잘못되었거나 봇이 채팅방에 없음

### 4단계: Vercel 환경 변수 업데이트

1. 올바른 Chat ID 확인 후
2. Vercel 대시보드 → Settings → Environment Variables
3. `TELEGRAM_CHAT_ID` 값 업데이트
4. 여러 채팅방인 경우 쉼표로 구분:
   ```
   123456789,987654321
   ```
5. **Redeploy** 필수!

## 현재 Chat ID 확인

현재 설정된 Chat ID:
- `-1003234073437` (그룹 채팅)
- `-1002528732393` (그룹 채팅)

이 Chat ID들이 올바른지 확인:
1. 각 그룹에 봇이 추가되어 있는지 확인
2. 봇에게 메시지를 보낼 수 있는지 확인
3. `getUpdates` API로 최신 Chat ID 확인

## 빠른 확인 방법

### 방법 1: getUpdates로 확인
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
```

응답에서:
```json
{
  "ok": true,
  "result": [
    {
      "update_id": 12341236789,
      "message": {
        "chat": {
          "id": -1003123073437,  // 이 값이 Chat ID
          "title": "그룹 이름",
          "type": "supergroup"
        }
      }
    }
  ]
}
```

### 방법 2: 봇에게 직접 메시지 보내기
1. 봇과 1:1 채팅 시작
2. 봇에게 메시지 보내기
3. `getUpdates`로 Chat ID 확인
4. 개인 채팅 ID는 양수입니다

## 주의사항

- **그룹 채팅 ID는 음수**입니다 (예: `-1001233437`)
- **개인 채팅 ID는 양수**입니다 (예: `121236789`)
- 봇이 그룹에 **추가되어 있어야** 메시지를 보낼 수 있습니다
- 봇이 그룹에서 **제거되면** Chat ID가 유효하지 않습니다


# Portfolio Pilot - Yahoo Finance Proxy Server

Yahoo Finance API는 CORS를 허용하지 않아 브라우저/Flutter Web에서 직접 호출이 불가능합니다.
이 프록시 서버가 요청을 대신 처리합니다.

## 빠른 시작

```bash
cd proxy-server
npm install
npm start
```

서버가 `http://localhost:3001`에서 실행됩니다.

## API 엔드포인트

### 실시간 시세 조회
```
GET /api/quote?symbols=TSLA,NVDA,005930.KS,000660.KS
```

### 히스토리 데이터
```
GET /api/history?symbol=TSLA&range=1mo&interval=1d
```
- range: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, ytd, max
- interval: 1m, 5m, 15m, 1h, 1d, 1wk, 1mo

### 환율 조회
```
GET /api/exchange?from=USD&to=KRW
GET /api/exchange?pairs=USDKRW,USDJPY
```

### 종목 검색
```
GET /api/search?q=삼성
GET /api/search?q=tesla
```

### 포트폴리오 일괄 조회
```
POST /api/portfolio-quote
Content-Type: application/json

{
  "holdings": [
    { "symbol": "TSLA", "qty": 320, "buyPrice": 185 },
    { "symbol": "005930", "qty": 500, "buyPrice": 62000 },
    { "symbol": "NVDA", "qty": 280, "buyPrice": 45 }
  ]
}
```

### 헬스 체크
```
GET /api/health
```

## 한국 종목코드
- 6자리 숫자 입력 시 자동으로 `.KS` (KOSPI) 접미사 추가
- KOSDAQ 종목은 직접 `.KQ` 붙여야 함
- 예: `005930` → `005930.KS` (삼성전자)

## 캐시
- 시세: 30초
- 히스토리: 5분
- 환율: 1분
- 검색: 10분

## 배포
Render, Railway, Fly.io 등에 무료 배포 가능.

```bash
# Render 예시
# package.json의 start 스크립트 사용
# PORT 환경변수 자동 설정됨
```

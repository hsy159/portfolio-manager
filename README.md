# Portfolio Pilot

실시간 주식 시세 조회 및 AI 기반 포트폴리오 분석 서비스입니다.
미국, 한국 등 글로벌 주식 시장 데이터를 제공하며, AI를 활용한 포트폴리오 건강도 평가 및 개선 제안 기능을 제공합니다.

## 빠른 시작

```bash
cd server
npm install
npm start
```

서버가 `http://localhost:3001`에서 실행됩니다.

## 환경 설정

`.env` 파일을 생성하여 다음 환경변수를 설정할 수 있습니다:

```env
# LLM 설정 (Ollama 또는 Anthropic)
USE_OLLAMA=true                          # Ollama 사용 여부 (기본값: true 또는 ANTHROPIC_API_KEY가 없을 때)
OLLAMA_MODEL=qwen2.5:7b                  # Ollama 모델 (기본값: qwen2.5:7b)
OLLAMA_HOST=http://localhost:11434       # Ollama 서버 주소 (기본값: http://localhost:11434)
ANTHROPIC_API_KEY=your-api-key           # Anthropic API 키 (선택사항)
LLM_BASE_URL=https://api.anthropic.com   # Anthropic API 엔드포인트 (선택사항)

# 서버 설정
PORT=3001                                # 서버 포트 (기본값: 3001)
```

## 주요 기능

### 📊 실시간 시세 조회
- 미국/한국 주식 실시간 가격 조회
- 일/주/월별 히스토리 차트 데이터
- 여러 종목 동시 조회 지원

### 💱 환율 정보
- 주요 통화 환율 실시간 조회
- USD, KRW, JPY, EUR 등 지원

### 🔍 종목 검색
- 한글/영문 종목명 검색
- 심볼, 종목명, 거래소 정보 제공

### ⭐ 관심종목 관리
- 관심종목 등록/삭제
- 섹터/시장별 분류
- 커스텀 색상 지정

### 🤖 AI 포트폴리오 분석
- **포트폴리오 건강도 평가**: 전체 수익률, 리스크 분석
- **섹터/지역별 분산도 분석**: 집중도 평가 및 리밸런싱 제안
- **개별 종목 분석**: 비중, 수익률 기반 평가
- **시장 상황 반영**: 현재 시장 컨디션 고려한 전략 제안
- **Ollama/Anthropic 선택 가능**: 로컬 또는 클라우드 LLM 활용

## API 엔드포인트

### 실시간 시세 조회
```http
GET /api/quote?symbols=TSLA,NVDA,005930.KS
```

### 히스토리 데이터
```http
GET /api/history?symbol=TSLA&range=1mo&interval=1d
```
**파라미터:**
- `range`: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, ytd, max
- `interval`: 1m, 5m, 15m, 1h, 1d, 1wk, 1mo

### 환율 조회
```http
GET /api/exchange?from=USD&to=KRW
```

### 종목 검색
```http
GET /api/search?q=삼성
GET /api/search?q=tesla
```

### 포트폴리오 일괄 조회
```http
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

### 관심종목 관리
```http
# 조회
GET /api/watchlist

# 추가
POST /api/watchlist
{
  "symbol": "AAPL",
  "name": "Apple Inc.",
  "market": "US",
  "sector": "Technology",
  "color": "#95a5c4"
}

# 삭제
DELETE /api/watchlist/:symbol
```

### AI 포트폴리오 분석
```http
POST /api/portfolio-analysis
Content-Type: application/json

{
  "holdings": [
    {
      "symbol": "TSLA",
      "name": "Tesla Inc.",
      "qty": 320,
      "buyPrice": 185,
      "currentPrice": 245,
      "returnPct": 32.4
    }
  ],
  "summary": {
    "totalValueKRW": 150000000,
    "totalCostKRW": 120000000,
    "totalReturnPct": 25.0
  },
  "marketConditions": {
    "sp500Change": 1.2,
    "nasdaqChange": 1.5,
    "kospiChange": -0.3
  }
}
```

### 헬스 체크
```http
GET /api/health
```

## 종목 코드 형식
- **미국 주식**: `AAPL`, `TSLA`, `NVDA`
- **한국 KOSPI**: `005930` (6자리 입력 시 자동으로 `.KS` 추가)
- **한국 KOSDAQ**: `035720.KQ` (직접 `.KQ` 접미사 추가 필요)

## 기술 스택
- **Express.js**: REST API 서버
- **yahoo-finance2**: 글로벌 주식 시장 데이터 수집
- **Ollama / Anthropic Claude**: AI 포트폴리오 분석 엔진
- **Node.js**: 서버 런타임

## 배포
Render, Railway, Fly.io 등 Node.js 호스팅 플랫폼에 배포 가능합니다.

**환경변수 설정:**
- `PORT`: 서버 포트 (자동 설정됨)
- `USE_OLLAMA`: Ollama 사용 여부
- `ANTHROPIC_API_KEY`: Anthropic API 키 (선택)
- `OLLAMA_HOST`: Ollama 서버 주소 (로컬 실행 시)

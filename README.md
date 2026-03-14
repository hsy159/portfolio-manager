# Portfolio Pilot

실시간 주식 시세 조회 및 AI 기반 포트폴리오 관리 서비스입니다.
미국/한국 글로벌 주식 시장 데이터를 제공하며, AI를 활용한 포트폴리오 분석 및 리밸런싱 기능을 제공합니다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 19, React Router, Zustand, Tailwind CSS v4, Vite |
| 백엔드 | Node.js, Express.js |
| 데이터 | yahoo-finance2 |
| AI | Ollama (로컬) / Anthropic Claude (클라우드) |

## 프로젝트 구조

```
portfolio-manager/
├── client/          # React + Vite 프론트엔드
│   └── src/
│       ├── pages/   # Dashboard, Watchlist, Analysis, Rebalance, Search, Settings
│       ├── components/
│       ├── stores/  # Zustand 상태 관리
│       ├── api/
│       └── hooks/
└── server/          # Express.js 백엔드
    ├── server.js
    └── watchlist.json
```

## 빠른 시작

**백엔드 서버**
```bash
cd server
npm install
npm start
```
서버: `http://localhost:3001`

**프론트엔드 클라이언트**
```bash
cd client
npm install
npm run dev
```
클라이언트: `http://localhost:5173`

## 환경 설정

`server/.env` 파일 생성:

```env
# LLM 설정 (Ollama 또는 Anthropic)
USE_OLLAMA=true                          # Ollama 사용 여부 (기본값: true)
OLLAMA_MODEL=qwen2.5:7b                  # Ollama 모델
OLLAMA_HOST=http://localhost:11434       # Ollama 서버 주소
ANTHROPIC_API_KEY=your-api-key           # Anthropic API 키 (선택)

# 서버 설정
PORT=3001
```

> `ANTHROPIC_API_KEY`가 설정되고 `USE_OLLAMA=true`가 없으면 Anthropic Claude를 사용합니다.

## 주요 기능

### 📊 대시보드
- 보유 종목 현재가 및 수익률 실시간 조회
- 평가금액, 수익률, 현재가 기준 정렬
- 1원 단위 손익 표시

### ⭐ 관심종목
- 종목 등록/삭제
- 섹터/시장별 분류, 커스텀 색상 지정

### 🤖 AI 포트폴리오 분석
- 포트폴리오 건강도 평가 (1~10점)
- 섹터 분산도 분석 및 리밸런싱 제안
- 개별 종목 매수/매도/유지 추천
- 장기 투자 관점 조언

### ⚖️ 리밸런싱
- 목표 비중 대비 현재 비중 비교
- 리밸런싱 계획 수립

### 🔍 종목 검색
- 한글/영문 종목명 검색
- 심볼, 종목명, 거래소 정보 제공

### 💱 환율 정보
- USD/KRW 실시간 환율 조회

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/quote?symbols=TSLA,005930` | 실시간 시세 조회 |
| GET | `/api/history?symbol=TSLA&range=1mo&interval=1d` | 히스토리 데이터 |
| GET | `/api/exchange?from=USD&to=KRW` | 환율 조회 |
| GET | `/api/search?q=삼성` | 종목 검색 |
| POST | `/api/portfolio-quote` | 포트폴리오 일괄 조회 |
| GET | `/api/watchlist` | 관심종목 조회 |
| POST | `/api/watchlist` | 관심종목 추가 |
| DELETE | `/api/watchlist/:symbol` | 관심종목 삭제 |
| POST | `/api/portfolio-analysis` | AI 포트폴리오 분석 |
| GET | `/api/health` | 헬스 체크 |

### 히스토리 파라미터
- `range`: `1d`, `5d`, `1mo`, `3mo`, `6mo`, `1y`, `2y`, `5y`, `ytd`, `max`
- `interval`: `1m`, `5m`, `15m`, `1h`, `1d`, `1wk`, `1mo`

## 종목 코드 형식

- **미국 주식**: `AAPL`, `TSLA`, `NVDA`
- **한국 KOSPI**: `005930` (6자리 입력 시 자동으로 `.KS` 추가)
- **한국 KOSDAQ**: `035720.KQ` (`.KQ` 접미사 직접 입력)

## 배포

Render, Railway, Fly.io 등 Node.js 호스팅 플랫폼에 배포 가능합니다.

**필수 환경변수:**
- `PORT`: 서버 포트 (플랫폼 자동 설정)
- `ANTHROPIC_API_KEY`: Anthropic API 키 (클라우드 LLM 사용 시)
- `USE_OLLAMA=false`: 배포 환경에서는 Ollama 비활성화 권장

# Portfolio Optimizer Web App

A modern web application that helps investors optimize their portfolios using **Modern Portfolio Theory** (Markowitz optimization). Built with Python FastAPI backend and Next.js frontend.

![Portfolio Optimizer Demo](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-teal)

## 🚀 Live Demo

**Frontend**: `http://localhost:3000` (when running locally)  
**API Documentation**: `http://localhost:8000/docs` (Swagger UI)

## ✨ Features

### 🎯 Core Functionality
- **Portfolio Optimization**: Markowitz mean-variance optimization
- **Efficient Frontier**: Interactive visualization of optimal risk-return combinations
- **Multiple Optimization Methods**:
  - Minimum Variance (lowest risk)
  - Maximum Sharpe Ratio (best risk-adjusted return)
- **Real-time Data**: Live stock data from Yahoo Finance
- **Smart Caching**: 24-hour data caching to avoid rate limits

### 📊 User Interface
- **Modern Dark Theme**: Beautiful gradient UI with glass morphism effects
- **Responsive Design**: Mobile-friendly interface
- **Interactive Charts**: Plotly.js powered efficient frontier visualization
- **Smart Ticker Selection**: Categorized stock/ETF picker with search
- **Sortable Results**: Portfolio weights table with sorting and CSV export
- **Real-time Validation**: Instant ticker validation and feedback

### 🔧 Technical Features
- **FastAPI Backend**: Async REST API with automatic documentation
- **Next.js Frontend**: Server-side rendering with TypeScript
- **Docker Support**: Multi-stage containerization
- **Unit Testing**: Comprehensive test suite
- **Error Handling**: Robust error handling and user feedback
- **Type Safety**: Full TypeScript implementation

## 🏗️ Architecture

```
Portfolio-Optimizer/
├── backend/                 # Python FastAPI Backend
│   ├── api.py              # FastAPI application & routes
│   ├── data_service.py     # Stock data fetching & caching
│   ├── optimizer.py        # Portfolio optimization engine
│   ├── test_optimizer.py   # Unit tests
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   │   ├── page.tsx   # Landing page
│   │   │   └── results/   # Results page
│   │   └── components/    # React components
│   │       ├── TickerSelector.tsx
│   │       ├── OptimizeButton.tsx
│   │       ├── FrontierChart.tsx
│   │       ├── WeightsTable.tsx
│   │       └── MetricsCard.tsx
│   └── package.json
└── Dockerfile             # Backend containerization
```

## 🛠️ Tech Stack

### Backend
- **Python 3.12**: Core language
- **FastAPI**: Modern async web framework
- **NumPy & SciPy**: Numerical computing & optimization
- **Pandas**: Data manipulation
- **yfinance**: Stock data fetching
- **Pydantic**: Data validation
- **pytest**: Testing framework

> **Note**: We use yfinance which has rate limits (~60 requests/hour). For heavy use, consider integrating Alpha Vantage (API key required).

### Frontend
- **Next.js 14**: React framework with App Router
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Plotly.js**: Interactive charts
- **React Select**: Advanced multi-select component
- **Framer Motion**: Smooth animations
- **SWR**: Data fetching & caching

## 🚀 Quick Start

### Prerequisites
- **Python 3.12+**
- **Node.js 18+**
- **Docker** (optional)

### Option 1: Local Development

#### Backend Setup
```bash
# 1. Clone the repository
git clone https://github.com/mian-abd/portfolio-optimizer.git
cd Portfolio-Optimizer

# 2. Backend setup
cd backend
python -m pip install -r requirements.txt

# 3. Start the FastAPI server
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Main API**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

#### Frontend Setup
```bash
# 1. Open a new terminal
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The frontend will be available at: http://localhost:3000

### Option 2: Docker

```bash
# Build and run the backend
docker build -t portfolio-optimizer .
docker run -p 8000:8000 portfolio-optimizer

# Frontend still needs to be run separately for development
cd frontend && npm run dev
```

## 📈 How to Use

### 1. Select Assets
- Choose 2-20 stock tickers or ETFs
- Use the searchable dropdown with popular options
- Categories include: Tech, Finance, Healthcare, Consumer, ETFs

### 2. Choose Optimization Method
- **Minimum Variance**: Reduces portfolio risk
- **Maximum Sharpe Ratio**: Maximizes risk-adjusted returns

### 3. Optimize Portfolio
- Click "Optimize My Portfolio"
- View results with interactive efficient frontier chart
- Analyze optimal weights and key metrics

### 4. Interpret Results
- **Portfolio Weights**: How much to allocate to each asset
- **Expected Return**: Projected annual return
- **Risk (Volatility)**: Standard deviation of returns
- **Sharpe Ratio**: Risk-adjusted performance metric

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest test_optimizer.py -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📡 API Endpoints

### Core Endpoints

#### `POST /optimize`
Optimize portfolio weights for given tickers.

**Request:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOGL"],
  "method": "min_variance"
}
```

**Response:**
```json
{
  "weights": {"AAPL": 0.4, "MSFT": 0.35, "GOOGL": 0.25},
  "exp_return": 0.12,
  "exp_risk": 0.18,
  "sharpe": 0.67,
  "success": true,
  "message": "Optimization completed"
}
```

#### `POST /frontier`
Generate efficient frontier points.

**Request:** Same as `/optimize`

**Response:**
```json
{
  "points": [
    {"risk": 0.15, "return": 0.08},
    {"risk": 0.18, "return": 0.12}
  ]
}
```

#### `GET /validate-ticker/{ticker}`
Validate a single ticker symbol.

**Response:**
```json
{
  "ticker": "AAPL",
  "valid": true,
  "message": "Valid ticker"
}
```

## 🐳 Deployment

### Backend Deployment (Render/Railway)

1. **Dockerfile** is already configured
2. Set environment variables:
   - `PORT=8000`
3. Deploy from GitHub repository

### Frontend Deployment (Vercel/Netlify)

1. Set environment variable:
   - `NEXT_PUBLIC_API_URL=http://localhost:8000` (for local development)
2. Deploy from `frontend/` directory

### Full Stack Deployment (Docker Compose)

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🎓 Financial Theory Background

### Modern Portfolio Theory (MPT)
This application implements **Harry Markowitz's Modern Portfolio Theory**, which:

1. **Quantifies Risk & Return**: Uses historical data to estimate expected returns and risks
2. **Finds Optimal Combinations**: Mathematically determines the best asset allocation
3. **Efficient Frontier**: Shows all optimal risk-return combinations
4. **Diversification Benefits**: Reduces risk through uncorrelated assets

### Key Concepts

- **Expected Return (μ)**: Average historical return, annualized
- **Risk/Volatility (σ)**: Standard deviation of returns, annualized  
- **Sharpe Ratio**: (Return - Risk-free rate) / Risk
- **Covariance Matrix**: Measures how assets move together
- **Optimization**: Uses `scipy.optimize.minimize()` with constraints

### Limitations & Disclaimers

⚠️ **Important**: This is an educational tool. Investment decisions should consider:
- Past performance doesn't predict future results
- Market conditions change over time
- Consider transaction costs and taxes
- Consult with financial advisors for major decisions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Harry Markowitz** for Modern Portfolio Theory
- **Yahoo Finance** for free market data
- **FastAPI & Next.js** communities for excellent frameworks
- **Plotly** for interactive visualization capabilities

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/portfolio-optimizer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/portfolio-optimizer/discussions)
- **Documentation**: Check `/docs` for additional documentation

---

**Built with ❤️ for the investment community**
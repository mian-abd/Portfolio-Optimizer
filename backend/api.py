"""
FastAPI Application for Portfolio Optimizer

This module provides REST API endpoints for portfolio optimization
and efficient frontier generation.
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from data_service import DataService
from optimizer import PortfolioOptimizer

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Portfolio Optimizer API",
    description="REST API for portfolio optimization using Modern Portfolio Theory",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
data_service = DataService()
optimizer = PortfolioOptimizer()

# Pydantic models for request/response validation
class OptimizationRequest(BaseModel):
    tickers: List[str]
    method: str = "min_variance"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    
    @validator('tickers')
    def validate_tickers(cls, v):
        if not v or len(v) < 2:
            raise ValueError('At least 2 tickers are required')
        if len(v) > 20:
            raise ValueError('Maximum 20 tickers allowed')
        # Clean ticker symbols
        return [ticker.upper().strip() for ticker in v]
    
    @validator('method')
    def validate_method(cls, v):
        allowed_methods = ['min_variance', 'max_sharpe']
        if v not in allowed_methods:
            raise ValueError(f'Method must be one of: {allowed_methods}')
        return v
    
    @validator('start_date', 'end_date')
    def validate_dates(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, '%Y-%m-%d')
            except ValueError:
                raise ValueError('Date must be in YYYY-MM-DD format')
        return v

class OptimizationResponse(BaseModel):
    weights: Dict[str, float]
    exp_return: float
    exp_risk: float
    sharpe: float
    success: bool
    message: str
    individual_assets: Optional[List[Dict[str, Any]]] = None

class FrontierResponse(BaseModel):
    points: List[Dict[str, float]]
    individual_assets: Optional[List[Dict[str, Any]]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

# Dependency to validate and fetch stock data
async def get_stock_data(request: OptimizationRequest):
    """
    Dependency to validate tickers and fetch stock data.
    """
    try:
        # Validate tickers
        valid_tickers = data_service.validate_tickers(request.tickers)
        
        if len(valid_tickers) < 2:
            raise HTTPException(
                status_code=422,
                detail=f"At least 2 valid tickers required. Valid tickers from your list: {valid_tickers}"
            )
        
        # Fetch stock data
        stock_data = data_service.get_stock_data(
            tickers=valid_tickers,
            start_date=request.start_date,
            end_date=request.end_date
        )
        
        if stock_data.empty:
            raise HTTPException(
                status_code=422,
                detail="No stock data available for the specified tickers and date range"
            )
        
        return stock_data
        
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching stock data: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while fetching data")

# API Endpoints
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Detailed health check endpoint."""
    return HealthResponse(
        status="healthy",
        timestamp=datetime.now().isoformat(),
        version="1.0.0"
    )

@app.post("/optimize", response_model=OptimizationResponse)
async def optimize_portfolio(
    request: OptimizationRequest,
    stock_data = Depends(get_stock_data)
):
    """
    Optimize portfolio weights for given tickers.
    
    Returns optimal weights, expected return, risk, and Sharpe ratio.
    """
    try:
        logger.info(f"Optimizing portfolio for {list(stock_data.columns)} using {request.method}")
        
        # Perform optimization
        result = optimizer.optimize_portfolio(stock_data, method=request.method)
        
        # Get individual asset performance for comparison
        individual_assets = optimizer.get_individual_asset_performance(stock_data)
        
        response = OptimizationResponse(
            weights=result["weights"],
            exp_return=result["exp_return"],
            exp_risk=result["exp_risk"],
            sharpe=result["sharpe"],
            success=result["success"],
            message=result["message"],
            individual_assets=individual_assets
        )
        
        logger.info(f"Optimization completed successfully. Sharpe ratio: {result['sharpe']:.3f}")
        return response
        
    except ValueError as e:
        logger.error(f"Optimization error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during optimization: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during optimization")

@app.post("/frontier", response_model=FrontierResponse)
async def generate_efficient_frontier(
    request: OptimizationRequest,
    stock_data = Depends(get_stock_data)
):
    """
    Generate efficient frontier points for given tickers.
    
    Returns a list of risk-return points representing the efficient frontier.
    """
    try:
        logger.info(f"Generating efficient frontier for {list(stock_data.columns)}")
        
        # Generate efficient frontier
        frontier_points = optimizer.generate_efficient_frontier(stock_data, n_points=30)
        
        if not frontier_points:
            raise HTTPException(
                status_code=422,
                detail="Unable to generate efficient frontier. Check your tickers and try again."
            )
        
        # Get individual asset performance for plotting
        individual_assets = optimizer.get_individual_asset_performance(stock_data)
        
        response = FrontierResponse(
            points=frontier_points,
            individual_assets=individual_assets
        )
        
        logger.info(f"Generated efficient frontier with {len(frontier_points)} points")
        return response
        
    except ValueError as e:
        logger.error(f"Frontier generation error: {e}")
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during frontier generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error during frontier generation")

@app.get("/validate-ticker/{ticker}")
async def validate_single_ticker(ticker: str):
    """
    Validate a single ticker symbol.
    
    Useful for frontend ticker validation.
    """
    try:
        valid_tickers = data_service.validate_tickers([ticker.upper()])
        
        return {
            "ticker": ticker.upper(),
            "valid": len(valid_tickers) > 0,
            "message": "Valid ticker" if valid_tickers else "Invalid or unavailable ticker"
        }
        
    except Exception as e:
        logger.error(f"Error validating ticker {ticker}: {e}")
        return {
            "ticker": ticker.upper(),
            "valid": False,
            "message": "Error validating ticker"
        }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler for better error responses."""
    return {
        "error": True,
        "message": exc.detail,
        "status_code": exc.status_code,
        "timestamp": datetime.now().isoformat()
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler for unexpected errors."""
    logger.error(f"Unexpected error: {exc}")
    return {
        "error": True,
        "message": "An unexpected error occurred",
        "status_code": 500,
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 

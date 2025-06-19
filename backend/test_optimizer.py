"""
Unit tests for the Portfolio Optimizer module.
"""

import pytest
import numpy as np
import pandas as pd
from optimizer import PortfolioOptimizer

@pytest.fixture
def sample_price_data():
    """Create sample price data for testing."""
    dates = pd.date_range('2020-01-01', periods=252, freq='D')
    
    # Create synthetic price data
    np.random.seed(42)  # For reproducible tests
    
    # Generate correlated returns
    returns = np.random.multivariate_normal(
        mean=[0.001, 0.0008, 0.0012],  # Different expected returns
        cov=[[0.0004, 0.0001, 0.0002],  # Covariance matrix
             [0.0001, 0.0009, 0.0001],
             [0.0002, 0.0001, 0.0016]],
        size=252
    )
    
    # Convert to price data
    prices = np.zeros((252, 3))
    prices[0] = [100, 50, 200]  # Initial prices
    
    for i in range(1, 252):
        prices[i] = prices[i-1] * (1 + returns[i])
    
    return pd.DataFrame(
        prices,
        index=dates,
        columns=['AAPL', 'MSFT', 'GOOGL']
    )

@pytest.fixture
def optimizer():
    """Create optimizer instance for testing."""
    return PortfolioOptimizer(risk_free_rate=0.02)

def test_optimizer_initialization(optimizer):
    """Test optimizer initialization."""
    assert optimizer.risk_free_rate == 0.02

def test_calculate_returns_and_covariance(optimizer, sample_price_data):
    """Test returns and covariance calculation."""
    expected_returns, covariance_matrix = optimizer.calculate_returns_and_covariance(sample_price_data)
    
    # Check dimensions
    assert len(expected_returns) == 3
    assert covariance_matrix.shape == (3, 3)
    
    # Check that covariance matrix is symmetric
    np.testing.assert_array_almost_equal(covariance_matrix, covariance_matrix.T)
    
    # Check that diagonal elements are positive (variances)
    assert all(covariance_matrix.diagonal() > 0)

def test_portfolio_performance(optimizer, sample_price_data):
    """Test portfolio performance calculation."""
    expected_returns, covariance_matrix = optimizer.calculate_returns_and_covariance(sample_price_data)
    weights = np.array([0.4, 0.3, 0.3])
    
    portfolio_return, portfolio_risk, sharpe = optimizer.portfolio_performance(
        weights, expected_returns, covariance_matrix
    )
    
    # Check that results are reasonable
    assert isinstance(portfolio_return, float)
    assert isinstance(portfolio_risk, float)
    assert isinstance(sharpe, float)
    assert portfolio_risk > 0
    
    # Check that equal weights give reasonable results
    equal_weights = np.array([1/3, 1/3, 1/3])
    eq_return, eq_risk, eq_sharpe = optimizer.portfolio_performance(
        equal_weights, expected_returns, covariance_matrix
    )
    assert eq_return > 0
    assert eq_risk > 0

def test_optimize_portfolio_min_variance(optimizer, sample_price_data):
    """Test minimum variance optimization."""
    result = optimizer.optimize_portfolio(sample_price_data, method="min_variance")
    
    # Check result structure
    assert "weights" in result
    assert "exp_return" in result
    assert "exp_risk" in result
    assert "sharpe" in result
    assert "success" in result
    
    # Check weights sum to 1
    weights_sum = sum(result["weights"].values())
    assert abs(weights_sum - 1.0) < 1e-6
    
    # Check all weights are non-negative
    assert all(w >= -1e-6 for w in result["weights"].values())
    
    # Check that we have weights for all tickers
    assert set(result["weights"].keys()) == set(sample_price_data.columns)

def test_optimize_portfolio_max_sharpe(optimizer, sample_price_data):
    """Test maximum Sharpe ratio optimization."""
    result = optimizer.optimize_portfolio(sample_price_data, method="max_sharpe")
    
    # Check result structure
    assert "weights" in result
    assert "exp_return" in result
    assert "exp_risk" in result
    assert "sharpe" in result
    assert "success" in result
    
    # Check weights sum to 1
    weights_sum = sum(result["weights"].values())
    assert abs(weights_sum - 1.0) < 1e-6
    
    # Check all weights are non-negative
    assert all(w >= -1e-6 for w in result["weights"].values())

def test_optimize_portfolio_invalid_method(optimizer, sample_price_data):
    """Test optimization with invalid method."""
    with pytest.raises(ValueError):
        optimizer.optimize_portfolio(sample_price_data, method="invalid_method")

def test_generate_efficient_frontier(optimizer, sample_price_data):
    """Test efficient frontier generation."""
    frontier_points = optimizer.generate_efficient_frontier(sample_price_data, n_points=10)
    
    # Check that we get frontier points
    assert len(frontier_points) > 0
    assert len(frontier_points) <= 10
    
    # Check structure of frontier points
    for point in frontier_points:
        assert "risk" in point
        assert "return" in point
        assert isinstance(point["risk"], float)
        assert isinstance(point["return"], float)
        assert point["risk"] > 0
    
    # Check that points are sorted by risk (ascending)
    risks = [point["risk"] for point in frontier_points]
    assert risks == sorted(risks)

def test_get_individual_asset_performance(optimizer, sample_price_data):
    """Test individual asset performance calculation."""
    performance = optimizer.get_individual_asset_performance(sample_price_data)
    
    # Check that we get performance for all assets
    assert len(performance) == len(sample_price_data.columns)
    
    # Check structure
    for asset_perf in performance:
        assert "ticker" in asset_perf
        assert "risk" in asset_perf
        assert "return" in asset_perf
        assert "sharpe" in asset_perf
        assert asset_perf["risk"] > 0
        assert isinstance(asset_perf["ticker"], str)

def test_empty_price_data(optimizer):
    """Test behavior with empty price data."""
    empty_data = pd.DataFrame()
    
    with pytest.raises(Exception):
        optimizer.optimize_portfolio(empty_data)

def test_single_asset_data(optimizer):
    """Test behavior with single asset (should fail)."""
    dates = pd.date_range('2020-01-01', periods=100, freq='D')
    single_asset_data = pd.DataFrame({
        'AAPL': np.random.lognormal(0, 0.1, 100)
    }, index=dates)
    
    # Should fail because we need at least 2 assets for portfolio optimization
    with pytest.raises(Exception):
        optimizer.optimize_portfolio(single_asset_data) 
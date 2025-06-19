"""
Portfolio Optimization Engine

This module implements Markowitz mean-variance optimization to find
optimal portfolio weights and generate the efficient frontier.
"""

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from typing import Dict, List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class PortfolioOptimizer:
    def __init__(self, risk_free_rate: float = 0.0):
        """
        Initialize the portfolio optimizer.
        
        Args:
            risk_free_rate: Risk-free rate for Sharpe ratio calculation (default: 0.0)
        """
        self.risk_free_rate = risk_free_rate
    
    def calculate_returns_and_covariance(self, price_data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculate expected returns and covariance matrix from price data.
        
        Args:
            price_data: DataFrame with stock prices (columns = tickers, rows = dates)
            
        Returns:
            Tuple of (expected_returns, covariance_matrix)
        """
        # Calculate daily returns
        daily_returns = price_data.pct_change().dropna()
        
        # Annualize returns (assuming 252 trading days per year)
        expected_returns = daily_returns.mean() * 252
        
        # Annualize covariance matrix
        covariance_matrix = daily_returns.cov() * 252
        
        return expected_returns.values, covariance_matrix.values
    
    def portfolio_performance(self, weights: np.ndarray, expected_returns: np.ndarray, 
                            covariance_matrix: np.ndarray) -> Tuple[float, float, float]:
        """
        Calculate portfolio performance metrics.
        
        Args:
            weights: Portfolio weights
            expected_returns: Expected returns for each asset
            covariance_matrix: Covariance matrix of returns
            
        Returns:
            Tuple of (expected_return, volatility, sharpe_ratio)
        """
        # Portfolio expected return
        portfolio_return = np.dot(weights, expected_returns)
        
        # Portfolio volatility (risk)
        portfolio_variance = np.dot(weights.T, np.dot(covariance_matrix, weights))
        portfolio_volatility = np.sqrt(portfolio_variance)
        
        # Sharpe ratio
        sharpe_ratio = (portfolio_return - self.risk_free_rate) / portfolio_volatility if portfolio_volatility > 0 else 0
        
        return portfolio_return, portfolio_volatility, sharpe_ratio
    
    def optimize_portfolio(self, price_data: pd.DataFrame, method: str = "min_variance") -> Dict:
        """
        Optimize portfolio weights using specified method.
        
        Args:
            price_data: DataFrame with stock prices
            method: Optimization method ("min_variance", "max_sharpe", "target_return")
            
        Returns:
            Dictionary containing optimization results
        """
        tickers = price_data.columns.tolist()
        n_assets = len(tickers)
        
        # Calculate returns and covariance
        expected_returns, covariance_matrix = self.calculate_returns_and_covariance(price_data)
        
        # Initial guess: equal weights
        initial_weights = np.array([1.0 / n_assets] * n_assets)
        
        # Constraints: weights sum to 1
        constraints = {'type': 'eq', 'fun': lambda x: np.sum(x) - 1}
        
        # Bounds: weights between 0 and 1 (no short selling)
        bounds = tuple((0, 1) for _ in range(n_assets))
        
        if method == "min_variance":
            # Minimize portfolio variance
            def objective(weights):
                return np.dot(weights.T, np.dot(covariance_matrix, weights))
            
        elif method == "max_sharpe":
            # Maximize Sharpe ratio (minimize negative Sharpe)
            def objective(weights):
                portfolio_return, portfolio_volatility, sharpe_ratio = self.portfolio_performance(
                    weights, expected_returns, covariance_matrix
                )
                return -sharpe_ratio  # Minimize negative Sharpe ratio
        
        else:
            raise ValueError(f"Unknown optimization method: {method}")
        
        # Perform optimization
        try:
            result = minimize(
                objective,
                initial_weights,
                method='SLSQP',
                bounds=bounds,
                constraints=constraints,
                options={'disp': False, 'maxiter': 1000}
            )
            
            if not result.success:
                logger.warning(f"Optimization did not converge: {result.message}")
            
            optimal_weights = result.x
            
            # Calculate performance metrics
            exp_return, exp_risk, sharpe = self.portfolio_performance(
                optimal_weights, expected_returns, covariance_matrix
            )
            
            # Create weights dictionary
            weights_dict = {ticker: float(weight) for ticker, weight in zip(tickers, optimal_weights)}
            
            return {
                "weights": weights_dict,
                "exp_return": float(exp_return),
                "exp_risk": float(exp_risk),
                "sharpe": float(sharpe),
                "success": result.success,
                "message": result.message if hasattr(result, 'message') else "Optimization completed"
            }
            
        except Exception as e:
            logger.error(f"Optimization failed: {e}")
            raise ValueError(f"Portfolio optimization failed: {str(e)}")
    
    def generate_efficient_frontier(self, price_data: pd.DataFrame, n_points: int = 30) -> List[Dict]:
        """
        Generate efficient frontier points.
        
        Args:
            price_data: DataFrame with stock prices
            n_points: Number of points to generate on the frontier
            
        Returns:
            List of dictionaries with risk and return for each point
        """
        tickers = price_data.columns.tolist()
        n_assets = len(tickers)
        
        # Calculate returns and covariance
        expected_returns, covariance_matrix = self.calculate_returns_and_covariance(price_data)
        
        # Find the range of returns for the frontier
        min_return = np.min(expected_returns)
        max_return = np.max(expected_returns)
        
        # Generate target returns
        target_returns = np.linspace(min_return, max_return, n_points)
        
        frontier_points = []
        
        for target_return in target_returns:
            try:
                # Minimize variance subject to target return constraint
                def objective(weights):
                    return np.dot(weights.T, np.dot(covariance_matrix, weights))
                
                # Constraints
                constraints = [
                    {'type': 'eq', 'fun': lambda x: np.sum(x) - 1},  # Weights sum to 1
                    {'type': 'eq', 'fun': lambda x: np.dot(x, expected_returns) - target_return}  # Target return
                ]
                
                # Bounds
                bounds = tuple((0, 1) for _ in range(n_assets))
                
                # Initial guess
                initial_weights = np.array([1.0 / n_assets] * n_assets)
                
                # Optimize
                result = minimize(
                    objective,
                    initial_weights,
                    method='SLSQP',
                    bounds=bounds,
                    constraints=constraints,
                    options={'disp': False, 'maxiter': 1000}
                )
                
                if result.success:
                    optimal_weights = result.x
                    portfolio_return, portfolio_risk, _ = self.portfolio_performance(
                        optimal_weights, expected_returns, covariance_matrix
                    )
                    
                    frontier_points.append({
                        "risk": float(portfolio_risk),
                        "return": float(portfolio_return)
                    })
                else:
                    logger.warning(f"Failed to optimize for target return {target_return}")
                    
            except Exception as e:
                logger.warning(f"Error generating frontier point for target return {target_return}: {e}")
                continue
        
        # Sort by risk (ascending)
        frontier_points.sort(key=lambda x: x["risk"])
        
        logger.info(f"Generated {len(frontier_points)} efficient frontier points")
        return frontier_points
    
    def get_individual_asset_performance(self, price_data: pd.DataFrame) -> List[Dict]:
        """
        Get performance metrics for individual assets.
        
        Args:
            price_data: DataFrame with stock prices
            
        Returns:
            List of dictionaries with performance metrics for each asset
        """
        expected_returns, covariance_matrix = self.calculate_returns_and_covariance(price_data)
        
        individual_performance = []
        
        for i, ticker in enumerate(price_data.columns):
            # Individual asset risk (standard deviation)
            asset_risk = np.sqrt(covariance_matrix[i, i])
            asset_return = expected_returns[i]
            asset_sharpe = (asset_return - self.risk_free_rate) / asset_risk if asset_risk > 0 else 0
            
            individual_performance.append({
                "ticker": ticker,
                "risk": float(asset_risk),
                "return": float(asset_return),
                "sharpe": float(asset_sharpe)
            })
        
        return individual_performance 
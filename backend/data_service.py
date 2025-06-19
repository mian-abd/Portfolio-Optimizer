"""
Data Service Module for Portfolio Optimizer

This module handles fetching historical stock data using yfinance,
with caching to avoid rate limits and data cleaning for optimization.
"""

import os
import pandas as pd
import yfinance as yf
from datetime import datetime, timedelta
from typing import List, Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataService:
    def __init__(self, cache_dir: str = "cache"):
        """Initialize the data service with caching directory."""
        self.cache_dir = cache_dir
        os.makedirs(cache_dir, exist_ok=True)
    
    def get_stock_data(
        self, 
        tickers: List[str], 
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        interval: str = "1d"
    ) -> pd.DataFrame:
        """
        Fetch historical stock data for given tickers.
        
        Args:
            tickers: List of stock ticker symbols
            start_date: Start date in YYYY-MM-DD format (default: 3 years ago)
            end_date: End date in YYYY-MM-DD format (default: today)
            interval: Data interval (default: 1d)
        
        Returns:
            DataFrame with adjusted close prices for each ticker
        """
        # Set default dates if not provided
        if not start_date:
            start_date = (datetime.now() - timedelta(days=3*365)).strftime('%Y-%m-%d')
        if not end_date:
            end_date = datetime.now().strftime('%Y-%m-%d')
        
        # Create cache filename
        cache_filename = f"{'_'.join(sorted(tickers))}_{start_date}_{end_date}_{interval}.csv"
        cache_path = os.path.join(self.cache_dir, cache_filename)
        
        # Check if cached data exists and is less than 24 hours old
        if os.path.exists(cache_path):
            cache_age = datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_path))
            if cache_age.total_seconds() < 24 * 3600:  # 24 hours
                logger.info(f"Loading cached data for {tickers}")
                try:
                    return pd.read_csv(cache_path, index_col=0, parse_dates=True)
                except Exception as e:
                    logger.warning(f"Error reading cache file: {e}")
        
        # Fetch fresh data from yfinance
        logger.info(f"Fetching fresh data for {tickers} from {start_date} to {end_date}")
        try:
            # Download data for all tickers at once
            data = yf.download(
                tickers=tickers,
                start=start_date,
                end=end_date,
                interval=interval,
                group_by='ticker',
                auto_adjust=True,
                prepost=True,
                threads=True
            )
            
            # Handle single ticker case (yfinance returns different structure)
            if len(tickers) == 1:
                if 'Adj Close' in data.columns:
                    adj_close_data = pd.DataFrame({tickers[0]: data['Adj Close']})
                else:
                    adj_close_data = pd.DataFrame({tickers[0]: data['Close']})
            else:
                # Extract adjusted close prices for multiple tickers
                adj_close_data = pd.DataFrame()
                for ticker in tickers:
                    try:
                        if ('Adj Close' in data[ticker].columns):
                            adj_close_data[ticker] = data[ticker]['Adj Close']
                        elif ('Close' in data[ticker].columns):
                            adj_close_data[ticker] = data[ticker]['Close']
                        else:
                            logger.warning(f"No price data found for {ticker}")
                    except (KeyError, AttributeError):
                        logger.warning(f"Error extracting data for {ticker}")
            
            # Clean the data
            cleaned_data = self._clean_data(adj_close_data)
            
            # Cache the cleaned data
            try:
                cleaned_data.to_csv(cache_path)
                logger.info(f"Data cached to {cache_path}")
            except Exception as e:
                logger.warning(f"Error caching data: {e}")
            
            return cleaned_data
            
        except Exception as e:
            logger.error(f"Error fetching data from yfinance: {e}")
            raise ValueError(f"Failed to fetch data for tickers: {tickers}")
    
    def _clean_data(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Clean the stock data for optimization.
        
        Args:
            data: Raw stock price data
            
        Returns:
            Cleaned DataFrame ready for optimization
        """
        # Forward fill missing values
        data_cleaned = data.fillna(method='ffill')
        
        # Drop rows where all values are NaN
        data_cleaned = data_cleaned.dropna(how='all')
        
        # Drop columns (tickers) that have too many missing values (>50%)
        threshold = len(data_cleaned) * 0.5
        data_cleaned = data_cleaned.dropna(thresh=threshold, axis=1)
        
        # Ensure we have at least 252 trading days (1 year) of data
        if len(data_cleaned) < 252:
            logger.warning(f"Only {len(data_cleaned)} days of data available. Minimum recommended: 252 days")
        
        # Remove any remaining NaN values by backward fill
        data_cleaned = data_cleaned.fillna(method='bfill')
        
        logger.info(f"Data cleaned: {len(data_cleaned)} days, {len(data_cleaned.columns)} tickers")
        return data_cleaned
    
    def validate_tickers(self, tickers: List[str]) -> List[str]:
        """
        Validate that tickers exist and have sufficient data.
        
        Args:
            tickers: List of ticker symbols to validate
            
        Returns:
            List of valid ticker symbols
        """
        valid_tickers = []
        
        for ticker in tickers:
            try:
                # Try to fetch a small sample of data
                info = yf.Ticker(ticker)
                hist = info.history(period="5d")
                
                if not hist.empty and len(hist) > 0:
                    valid_tickers.append(ticker.upper())
                else:
                    logger.warning(f"Ticker {ticker} has no recent data")
                    
            except Exception as e:
                logger.warning(f"Ticker {ticker} validation failed: {e}")
        
        return valid_tickers 
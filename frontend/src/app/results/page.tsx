'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import FrontierChart from '@/components/FrontierChart';
import WeightsTable from '@/components/WeightsTable';
import MetricsCard from '@/components/MetricsCard';

interface OptimizationResult {
  weights: Record<string, number>;
  exp_return: number;
  exp_risk: number;
  sharpe: number;
  success: boolean;
  message: string;
  individual_assets?: Array<{
    ticker: string;
    risk: number;
    return: number;
    sharpe: number;
  }>;
}

interface FrontierData {
  points: Array<{
    risk: number;
    return: number;
  }>;
  individual_assets?: Array<{
    ticker: string;
    risk: number;
    return: number;
    sharpe: number;
  }>;
}

export default function ResultsPage() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [optimizationMethod, setOptimizationMethod] = useState<string>('min_variance');
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [frontierData, setFrontierData] = useState<FrontierData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // API base URL - adjust for your environment
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Get data from localStorage
    const tickers = localStorage.getItem('selectedTickers');
    const method = localStorage.getItem('optimizationMethod');

    if (!tickers) {
      router.push('/');
      return;
    }

    const parsedTickers = JSON.parse(tickers);
    setSelectedTickers(parsedTickers);
    setOptimizationMethod(method || 'min_variance');

    // Fetch optimization results
    fetchOptimizationData(parsedTickers, method || 'min_variance');
  }, [router]);

  const fetchOptimizationData = async (tickers: string[], method: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const requestBody = {
        tickers: tickers,
        method: method,
      };

      // Fetch both optimization and frontier data in parallel
      const [optimizeResponse, frontierResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/optimize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }),
        fetch(`${API_BASE_URL}/frontier`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }),
      ]);

      if (!optimizeResponse.ok) {
        const errorData = await optimizeResponse.json();
        throw new Error(errorData.message || 'Failed to optimize portfolio');
      }

      if (!frontierResponse.ok) {
        const errorData = await frontierResponse.json();
        throw new Error(errorData.message || 'Failed to generate efficient frontier');
      }

      const optimizeData = await optimizeResponse.json();
      const frontierData = await frontierResponse.json();

      setOptimizationResult(optimizeData);
      setFrontierData(frontierData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      console.error('Error fetching optimization data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleReoptimize = () => {
    fetchOptimizationData(selectedTickers, optimizationMethod);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">Optimizing Your Portfolio</h2>
          <p className="text-gray-300">Analyzing {selectedTickers.length} assets using Modern Portfolio Theory...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center bg-red-500/10 backdrop-blur-lg rounded-2xl p-8 border border-red-500/20"
        >
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">Optimization Failed</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleReoptimize}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleBackToHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-white">Portfolio Optimization Results</h1>
              <p className="text-gray-300 mt-1">
                Optimized portfolio for {selectedTickers.join(', ')} using {optimizationMethod === 'min_variance' ? 'Minimum Variance' : 'Maximum Sharpe Ratio'}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-x-3"
            >
              <button
                onClick={handleReoptimize}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Refresh Data
              </button>
              <button
                onClick={handleBackToHome}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                New Portfolio
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-semibold text-white mb-4">Efficient Frontier</h2>
              {frontierData && optimizationResult && (
                <FrontierChart
                  frontierPoints={frontierData.points}
                  individualAssets={frontierData.individual_assets || []}
                  optimalPortfolio={{
                    risk: optimizationResult.exp_risk,
                    return: optimizationResult.exp_return,
                  }}
                />
              )}
            </div>
          </motion.div>

          {/* Right Column - Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {optimizationResult && (
              <MetricsCard
                expectedReturn={optimizationResult.exp_return}
                expectedRisk={optimizationResult.exp_risk}
                sharpeRatio={optimizationResult.sharpe}
                method={optimizationMethod}
              />
            )}
          </motion.div>
        </div>

        {/* Bottom Row - Weights Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8"
        >
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-xl font-semibold text-white mb-4">Optimal Portfolio Weights</h2>
            {optimizationResult && (
              <WeightsTable
                weights={optimizationResult.weights}
                individualAssets={optimizationResult.individual_assets || []}
              />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
} 
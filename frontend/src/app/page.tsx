'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TickerSelector from '@/components/TickerSelector';
import OptimizeButton from '@/components/OptimizeButton';
import { motion } from 'framer-motion';

export default function Home() {
  const [selectedTickers, setSelectedTickers] = useState<string[]>([]);
  const [optimizationMethod, setOptimizationMethod] = useState<string>('min_variance');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const router = useRouter();

  const handleOptimize = async () => {
    if (selectedTickers.length < 2) {
      alert('Please select at least 2 tickers for portfolio optimization');
      return;
    }

    setIsOptimizing(true);
    
    // Store selected tickers in localStorage for the results page
    localStorage.setItem('selectedTickers', JSON.stringify(selectedTickers));
    localStorage.setItem('optimizationMethod', optimizationMethod);
    
    // Navigate to results page
    router.push('/results');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Portfolio
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                {' '}Optimizer
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Optimize your investment portfolio using Modern Portfolio Theory. 
              Find the perfect balance between risk and return.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
        >
          <div className="space-y-8">
            {/* Ticker Selection */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                Select Stocks/ETFs for Your Portfolio
              </label>
              <TickerSelector
                selectedTickers={selectedTickers}
                onTickersChange={setSelectedTickers}
              />
              <p className="text-sm text-gray-300 mt-2">
                Select at least 2 tickers. Popular choices: AAPL, MSFT, GOOGL, AMZN, TSLA, SPY, QQQ
              </p>
            </div>

            {/* Optimization Method */}
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                Optimization Method
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="min_variance"
                    checked={optimizationMethod === 'min_variance'}
                    onChange={(e) => setOptimizationMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    optimizationMethod === 'min_variance'
                      ? 'border-blue-400 bg-blue-500/20 text-white'
                      : 'border-gray-500 bg-gray-700/30 text-gray-300 hover:border-gray-400'
                  }`}>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      optimizationMethod === 'min_variance'
                        ? 'border-blue-400 bg-blue-400'
                        : 'border-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Minimum Variance</div>
                      <div className="text-sm opacity-75">Minimize portfolio risk</div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    value="max_sharpe"
                    checked={optimizationMethod === 'max_sharpe'}
                    onChange={(e) => setOptimizationMethod(e.target.value)}
                    className="sr-only"
                  />
                  <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                    optimizationMethod === 'max_sharpe'
                      ? 'border-purple-400 bg-purple-500/20 text-white'
                      : 'border-gray-500 bg-gray-700/30 text-gray-300 hover:border-gray-400'
                  }`}>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      optimizationMethod === 'max_sharpe'
                        ? 'border-purple-400 bg-purple-400'
                        : 'border-gray-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Maximum Sharpe Ratio</div>
                      <div className="text-sm opacity-75">Maximize risk-adjusted return</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Optimize Button */}
            <div className="pt-4">
              <OptimizeButton
                onClick={handleOptimize}
                disabled={selectedTickers.length < 2 || isOptimizing}
                isLoading={isOptimizing}
              />
            </div>

            {/* Info Cards */}
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="text-blue-400 text-2xl mb-2">📊</div>
                <h3 className="text-white font-semibold mb-2">Modern Portfolio Theory</h3>
                <p className="text-gray-300 text-sm">
                  Uses Markowitz optimization to find the optimal balance between risk and return.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="text-purple-400 text-2xl mb-2">📈</div>
                <h3 className="text-white font-semibold mb-2">Efficient Frontier</h3>
                <p className="text-gray-300 text-sm">
                  Visualize the optimal risk-return combinations for your selected assets.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-white/5 p-6 rounded-xl border border-white/10"
              >
                <div className="text-green-400 text-2xl mb-2">⚡</div>
                <h3 className="text-white font-semibold mb-2">Real-time Data</h3>
                <p className="text-gray-300 text-sm">
                  Uses live market data from Yahoo Finance to ensure accurate optimization.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

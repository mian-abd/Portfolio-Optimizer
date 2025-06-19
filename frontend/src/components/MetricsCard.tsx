'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface MetricsCardProps {
  expectedReturn: number;
  expectedRisk: number;
  sharpeRatio: number;
  method: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
  expectedReturn,
  expectedRisk,
  sharpeRatio,
  method,
}) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatRatio = (value: number) => value.toFixed(3);

  const getMethodTitle = (method: string) => {
    switch (method) {
      case 'min_variance':
        return 'Minimum Variance Portfolio';
      case 'max_sharpe':
        return 'Maximum Sharpe Ratio Portfolio';
      default:
        return 'Optimized Portfolio';
    }
  };

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'min_variance':
        return 'Minimizes portfolio risk while maintaining diversification';
      case 'max_sharpe':
        return 'Maximizes risk-adjusted returns for optimal performance';
      default:
        return 'Optimized using Modern Portfolio Theory';
    }
  };

  const getSharpeRating = (sharpe: number) => {
    if (sharpe < 0) return { text: 'Poor', color: 'text-red-400', bg: 'bg-red-500/20' };
    if (sharpe < 0.5) return { text: 'Fair', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    if (sharpe < 1.0) return { text: 'Good', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (sharpe < 2.0) return { text: 'Very Good', color: 'text-green-400', bg: 'bg-green-500/20' };
    return { text: 'Excellent', color: 'text-blue-400', bg: 'bg-blue-500/20' };
  };

  const sharpeRating = getSharpeRating(sharpeRatio);

  const metrics = [
    {
      title: 'Expected Return',
      value: formatPercentage(expectedReturn),
      subtitle: 'Annualized',
      icon: '📈',
      color: expectedReturn >= 0 ? 'text-green-400' : 'text-red-400',
      bgColor: expectedReturn >= 0 ? 'bg-green-500/10' : 'bg-red-500/10',
      description: 'Expected annual return based on historical data',
    },
    {
      title: 'Portfolio Risk',
      value: formatPercentage(expectedRisk),
      subtitle: 'Volatility',
      icon: '📊',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      description: 'Standard deviation of returns (risk measure)',
    },
    {
      title: 'Sharpe Ratio',
      value: formatRatio(sharpeRatio),
      subtitle: sharpeRating.text,
      icon: '⚡',
      color: sharpeRating.color,
      bgColor: sharpeRating.bg,
      description: 'Risk-adjusted return metric (higher is better)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
      >
        <div className="text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            {getMethodTitle(method)}
          </h3>
          <p className="text-gray-300 text-sm">
            {getMethodDescription(method)}
          </p>
        </div>
      </motion.div>

      {/* Metrics Cards */}
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${metric.bgColor} backdrop-blur-lg rounded-xl p-4 border border-white/10`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{metric.icon}</div>
                <div>
                  <h4 className="text-white font-medium">{metric.title}</h4>
                  <p className="text-gray-400 text-xs">{metric.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${metric.color}`}>
                  {metric.value}
                </div>
                <div className="text-xs text-gray-400">
                  {metric.subtitle}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Risk-Return Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-white font-medium mb-3 flex items-center">
          <span className="mr-2">🎯</span>
          Portfolio Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Risk Level:</span>
            <span className="text-white">
              {expectedRisk > 0.2 ? 'High' : expectedRisk > 0.15 ? 'Medium' : 'Conservative'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Return Target:</span>
            <span className="text-white">
              {expectedReturn > 0.15 ? 'Aggressive' : expectedReturn > 0.08 ? 'Moderate' : 'Conservative'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Efficiency:</span>
            <span className={sharpeRating.color}>
              {sharpeRating.text}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Educational Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10"
      >
        <h4 className="text-white font-medium mb-2 flex items-center">
          <span className="mr-2">💡</span>
          Key Insights
        </h4>
        <div className="text-xs text-gray-400 space-y-1">
          <p>• Expected returns are based on historical data and not guaranteed</p>
          <p>• A Sharpe ratio above 1.0 is generally considered good</p>
          <p>• Consider rebalancing your portfolio periodically</p>
          <p>• Past performance does not predict future results</p>
        </div>
      </motion.div>
    </div>
  );
};

export default MetricsCard; 
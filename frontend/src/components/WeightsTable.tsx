'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface IndividualAsset {
  ticker: string;
  risk: number;
  return: number;
  sharpe: number;
}

interface WeightsTableProps {
  weights: Record<string, number>;
  individualAssets: IndividualAsset[];
}

type SortField = 'ticker' | 'weight' | 'return' | 'risk' | 'sharpe';
type SortDirection = 'asc' | 'desc';

const WeightsTable: React.FC<WeightsTableProps> = ({ weights, individualAssets }) => {
  const [sortField, setSortField] = useState<SortField>('weight');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [copied, setCopied] = useState(false);

  // Combine weights with individual asset data
  const tableData = Object.entries(weights).map(([ticker, weight]) => {
    const assetData = individualAssets.find(asset => asset.ticker === ticker);
    return {
      ticker,
      weight,
      return: assetData?.return || 0,
      risk: assetData?.risk || 0,
      sharpe: assetData?.sharpe || 0,
    };
  });

  // Sort data
  const sortedData = [...tableData].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'ticker') {
      aValue = aValue as string;
      bValue = bValue as string;
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }

    aValue = aValue as number;
    bValue = bValue as number;
    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return '⟨⟩';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const copyToClipboard = async () => {
    const csvData = [
      'Ticker,Weight (%),Expected Return (%),Risk (%),Sharpe Ratio',
      ...sortedData.map(row => 
        `${row.ticker},${(row.weight * 100).toFixed(2)},${(row.return * 100).toFixed(2)},${(row.risk * 100).toFixed(2)},${row.sharpe.toFixed(3)}`
      )
    ].join('\n');

    try {
      await navigator.clipboard.writeText(csvData);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(3);

  return (
    <div className="space-y-4">
      {/* Header with copy button */}
      <div className="flex justify-between items-center">
        <p className="text-gray-300 text-sm">
          Portfolio allocation across {Object.keys(weights).length} assets
        </p>
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? '✓ Copied!' : '📋 Copy CSV'}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/20">
              <th className="text-left py-3 px-2">
                <button
                  onClick={() => handleSort('ticker')}
                  className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
                >
                  <span>Ticker</span>
                  <span className="text-xs">{getSortIcon('ticker')}</span>
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('weight')}
                  className="flex items-center justify-end space-x-1 hover:text-blue-400 transition-colors w-full"
                >
                  <span>Weight</span>
                  <span className="text-xs">{getSortIcon('weight')}</span>
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('return')}
                  className="flex items-center justify-end space-x-1 hover:text-blue-400 transition-colors w-full"
                >
                  <span>Expected Return</span>
                  <span className="text-xs">{getSortIcon('return')}</span>
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('risk')}
                  className="flex items-center justify-end space-x-1 hover:text-blue-400 transition-colors w-full"
                >
                  <span>Risk</span>
                  <span className="text-xs">{getSortIcon('risk')}</span>
                </button>
              </th>
              <th className="text-right py-3 px-2">
                <button
                  onClick={() => handleSort('sharpe')}
                  className="flex items-center justify-end space-x-1 hover:text-blue-400 transition-colors w-full"
                >
                  <span>Sharpe Ratio</span>
                  <span className="text-xs">{getSortIcon('sharpe')}</span>
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, index) => (
              <motion.tr
                key={row.ticker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="py-3 px-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white">{row.ticker}</span>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-white">
                      {formatPercentage(row.weight)}
                    </span>
                    {/* Weight bar */}
                    <div className="w-16 h-1 bg-gray-700 rounded-full mt-1">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-300"
                        style={{ width: `${row.weight * 100}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`${row.return >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(row.return)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className="text-gray-300">
                    {formatPercentage(row.risk)}
                  </span>
                </td>
                <td className="py-3 px-2 text-right">
                  <span className={`${row.sharpe >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatNumber(row.sharpe)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      <div className="border-t border-white/20 pt-4">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Total Allocation:</span>
          <span className="font-semibold text-white">
            {formatPercentage(Object.values(weights).reduce((sum, weight) => sum + weight, 0))}
          </span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-xs text-gray-400 bg-white/5 p-3 rounded-lg">
        <p className="mb-1">
          <strong>How to read this table:</strong>
        </p>
        <ul className="space-y-0.5">
          <li>• <strong>Weight:</strong> Percentage of your portfolio to allocate to each asset</li>
          <li>• <strong>Expected Return:</strong> Annualized expected return based on historical data</li>
          <li>• <strong>Risk:</strong> Annualized volatility (standard deviation of returns)</li>
          <li>• <strong>Sharpe Ratio:</strong> Risk-adjusted return metric (higher is better)</li>
        </ul>
      </div>
    </div>
  );
};

export default WeightsTable; 
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Plotly to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface FrontierPoint {
  risk: number;
  return: number;
}

interface IndividualAsset {
  ticker: string;
  risk: number;
  return: number;
  sharpe: number;
}

interface OptimalPortfolio {
  risk: number;
  return: number;
}

interface FrontierChartProps {
  frontierPoints: FrontierPoint[];
  individualAssets: IndividualAsset[];
  optimalPortfolio: OptimalPortfolio;
}

const FrontierChart: React.FC<FrontierChartProps> = ({
  frontierPoints,
  individualAssets,
  optimalPortfolio,
}) => {
  // Prepare data for Plotly
  const traces: any[] = [
    // Efficient Frontier
    {
      x: frontierPoints.map(p => p.risk * 100), // Convert to percentage
      y: frontierPoints.map(p => p.return * 100), // Convert to percentage
      type: 'scatter' as const,
      mode: 'lines' as const,
      name: 'Efficient Frontier',
      line: {
        color: 'rgb(99, 102, 241)',
        width: 3,
      },
      hovertemplate: 'Risk: %{x:.2f}%<br>Return: %{y:.2f}%<extra></extra>',
    },
    // Individual Assets
    {
      x: individualAssets.map(asset => asset.risk * 100),
      y: individualAssets.map(asset => asset.return * 100),
      type: 'scatter' as const,
      mode: 'markers+text' as const,
      name: 'Individual Assets',
      text: individualAssets.map(asset => asset.ticker),
      textposition: 'top center' as const,
      textfont: {
        size: 12,
        color: 'white',
      },
      marker: {
        color: 'rgb(239, 68, 68)',
        size: 10,
        line: {
          color: 'white',
          width: 2,
        },
      },
      hovertemplate: 
        '<b>%{text}</b><br>' +
        'Risk: %{x:.2f}%<br>' +
        'Return: %{y:.2f}%<br>' +
        'Sharpe: %{customdata:.3f}<extra></extra>',
      customdata: individualAssets.map(asset => asset.sharpe),
    },
    // Optimal Portfolio
    {
      x: [optimalPortfolio.risk * 100],
      y: [optimalPortfolio.return * 100],
      type: 'scatter' as const,
      mode: 'markers' as const,
      name: 'Optimal Portfolio',
      marker: {
        color: 'rgb(34, 197, 94)',
        size: 15,
        symbol: 'star',
        line: {
          color: 'white',
          width: 2,
        },
      },
      hovertemplate: 
        '<b>Optimal Portfolio</b><br>' +
        'Risk: %{x:.2f}%<br>' +
        'Return: %{y:.2f}%<extra></extra>',
    },
  ];

  // Layout configuration
  const layout = {
    title: {
      text: 'Efficient Frontier & Asset Allocation',
      font: {
        color: 'white',
        size: 16,
      },
    },
    xaxis: {
      title: {
        text: 'Risk (Standard Deviation %)',
        font: { color: 'white' },
      },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      tickfont: { color: 'white' },
      zeroline: false,
    },
    yaxis: {
      title: {
        text: 'Expected Return (%)',
        font: { color: 'white' },
      },
      gridcolor: 'rgba(255, 255, 255, 0.1)',
      tickfont: { color: 'white' },
      zeroline: false,
    },
    plot_bgcolor: 'rgba(0, 0, 0, 0)',
    paper_bgcolor: 'rgba(0, 0, 0, 0)',
    font: {
      color: 'white',
    },
    legend: {
      font: { color: 'white' },
      bgcolor: 'rgba(0, 0, 0, 0.3)',
      bordercolor: 'rgba(255, 255, 255, 0.2)',
      borderwidth: 1,
    },
    margin: {
      l: 60,
      r: 20,
      t: 60,
      b: 60,
    },
    autosize: true,
    responsive: true,
  };

  // Configuration for Plotly
  const config: any = {
    displayModeBar: true,
    displaylogo: false,
    responsive: true,
  };

  return (
    <div className="w-full h-96 md:h-[500px]">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
      
      {/* Legend/Info */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-0.5 bg-blue-500"></div>
          <span className="text-gray-300">Efficient Frontier</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-gray-300">Individual Assets</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-gray-300">Optimal Portfolio</span>
        </div>
      </div>
      
      {/* Chart Description */}
      <div className="mt-4 text-xs text-gray-400">
        <p>
          The efficient frontier shows the optimal risk-return combinations. 
          Your optimized portfolio (green star) provides the best risk-adjusted return 
          based on your selected optimization method.
        </p>
      </div>
    </div>
  );
};

export default FrontierChart; 
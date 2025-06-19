'use client';

import React from 'react';
import Select from 'react-select';

interface TickerOption {
  value: string;
  label: string;
  category: string;
}

interface TickerSelectorProps {
  selectedTickers: string[];
  onTickersChange: (tickers: string[]) => void;
}

const TickerSelector: React.FC<TickerSelectorProps> = ({
  selectedTickers,
  onTickersChange,
}) => {
  // Popular stock and ETF options
  const tickerOptions: TickerOption[] = [
    // Large Cap Tech Stocks
    { value: 'AAPL', label: 'AAPL - Apple Inc.', category: 'Tech' },
    { value: 'MSFT', label: 'MSFT - Microsoft Corp.', category: 'Tech' },
    { value: 'GOOGL', label: 'GOOGL - Alphabet Inc.', category: 'Tech' },
    { value: 'AMZN', label: 'AMZN - Amazon.com Inc.', category: 'Tech' },
    { value: 'TSLA', label: 'TSLA - Tesla Inc.', category: 'Tech' },
    { value: 'META', label: 'META - Meta Platforms Inc.', category: 'Tech' },
    { value: 'NVDA', label: 'NVDA - Nvidia Corp.', category: 'Tech' },
    { value: 'NFLX', label: 'NFLX - Netflix Inc.', category: 'Tech' },
    
    // Financial Sector
    { value: 'JPM', label: 'JPM - JPMorgan Chase & Co.', category: 'Finance' },
    { value: 'BAC', label: 'BAC - Bank of America Corp.', category: 'Finance' },
    { value: 'WFC', label: 'WFC - Wells Fargo & Co.', category: 'Finance' },
    { value: 'GS', label: 'GS - Goldman Sachs Group Inc.', category: 'Finance' },
    { value: 'MS', label: 'MS - Morgan Stanley', category: 'Finance' },
    
    // Healthcare
    { value: 'JNJ', label: 'JNJ - Johnson & Johnson', category: 'Healthcare' },
    { value: 'PFE', label: 'PFE - Pfizer Inc.', category: 'Healthcare' },
    { value: 'UNH', label: 'UNH - UnitedHealth Group Inc.', category: 'Healthcare' },
    { value: 'ABBV', label: 'ABBV - AbbVie Inc.', category: 'Healthcare' },
    
    // Consumer Goods
    { value: 'PG', label: 'PG - Procter & Gamble Co.', category: 'Consumer' },
    { value: 'KO', label: 'KO - Coca-Cola Co.', category: 'Consumer' },
    { value: 'PEP', label: 'PEP - PepsiCo Inc.', category: 'Consumer' },
    { value: 'WMT', label: 'WMT - Walmart Inc.', category: 'Consumer' },
    
    // Industrial
    { value: 'BA', label: 'BA - Boeing Co.', category: 'Industrial' },
    { value: 'CAT', label: 'CAT - Caterpillar Inc.', category: 'Industrial' },
    { value: 'GE', label: 'GE - General Electric Co.', category: 'Industrial' },
    
    // ETFs
    { value: 'SPY', label: 'SPY - SPDR S&P 500 ETF', category: 'ETF' },
    { value: 'QQQ', label: 'QQQ - Invesco QQQ ETF', category: 'ETF' },
    { value: 'IWM', label: 'IWM - iShares Russell 2000 ETF', category: 'ETF' },
    { value: 'VTI', label: 'VTI - Vanguard Total Stock Market ETF', category: 'ETF' },
    { value: 'VXUS', label: 'VXUS - Vanguard Total International Stock ETF', category: 'ETF' },
    { value: 'BND', label: 'BND - Vanguard Total Bond Market ETF', category: 'ETF' },
    { value: 'GLD', label: 'GLD - SPDR Gold Shares', category: 'ETF' },
    { value: 'VNQ', label: 'VNQ - Vanguard Real Estate ETF', category: 'ETF' },
  ];

  const handleChange = (selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((option: any) => option.value) : [];
    onTickersChange(values);
  };

  const selectedOptions = tickerOptions.filter(option => 
    selectedTickers.includes(option.value)
  );

  // Group options by category
  const groupedOptions = tickerOptions.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<string, TickerOption[]>);

  const formatGroupLabel = (data: any) => (
    <div className="flex items-center justify-between px-3 py-2">
      <span className="text-sm font-semibold text-gray-600">{data.label}</span>
      <span className="text-xs text-gray-400">{data.options.length} options</span>
    </div>
  );

  const formatOptionLabel = (option: TickerOption) => (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium text-gray-900">{option.value}</span>
        <span className="text-sm text-gray-500 ml-2">
          {option.label.split(' - ')[1]}
        </span>
      </div>
      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
        {option.category}
      </span>
    </div>
  );

  const customStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: state.isFocused ? '#60a5fa' : 'rgba(255, 255, 255, 0.2)',
      borderWidth: '2px',
      borderRadius: '12px',
      minHeight: '48px',
      boxShadow: state.isFocused ? '0 0 0 3px rgba(96, 165, 250, 0.1)' : 'none',
      '&:hover': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(96, 165, 250, 0.2)',
      borderRadius: '8px',
      border: '1px solid rgba(96, 165, 250, 0.3)',
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: '#ffffff',
      fontWeight: '500',
      fontSize: '14px',
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: '#ffffff',
      '&:hover': {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        color: '#ef4444',
      },
    }),
    input: (provided: any) => ({
      ...provided,
      color: '#ffffff',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: '#ffffff',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 50,
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'rgba(96, 165, 250, 0.1)' 
        : state.isFocused 
        ? 'rgba(96, 165, 250, 0.05)' 
        : 'transparent',
      color: state.isSelected ? '#1e40af' : '#374151',
      padding: '12px 16px',
      borderRadius: '8px',
      margin: '2px 8px',
      '&:active': {
        backgroundColor: 'rgba(96, 165, 250, 0.1)',
      },
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
      '&:hover': {
        color: '#ffffff',
      },
    }),
    clearIndicator: (provided: any) => ({
      ...provided,
      color: 'rgba(255, 255, 255, 0.6)',
      '&:hover': {
        color: '#ef4444',
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
    }),
  };

  return (
    <div className="space-y-2">
      <Select
        isMulti
        options={Object.entries(groupedOptions).map(([category, options]) => ({
          label: category,
          options: options,
        }))}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Type to search or select from popular tickers..."
        isSearchable={true}
        isClearable={true}
        formatGroupLabel={formatGroupLabel}
        formatOptionLabel={formatOptionLabel}
        styles={customStyles}
        className="react-select-container"
        classNamePrefix="react-select"
        maxMenuHeight={300}
        menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
      />
      
      {selectedTickers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTickers.map((ticker) => (
            <div
              key={ticker}
              className="flex items-center space-x-2 bg-blue-500/20 text-blue-100 px-3 py-1 rounded-full text-sm border border-blue-400/30"
            >
              <span className="font-medium">{ticker}</span>
              <button
                onClick={() => {
                  const newTickers = selectedTickers.filter(t => t !== ticker);
                  onTickersChange(newTickers);
                }}
                className="text-blue-200 hover:text-red-300 transition-colors"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="text-xs text-gray-400 mt-2">
        Selected: {selectedTickers.length} ticker{selectedTickers.length !== 1 ? 's' : ''}
        {selectedTickers.length >= 2 && (
          <span className="text-green-400 ml-2">✓ Ready to optimize</span>
        )}
      </div>
    </div>
  );
};

export default TickerSelector; 
'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface OptimizeButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading: boolean;
}

const OptimizeButton: React.FC<OptimizeButtonProps> = ({
  onClick,
  disabled,
  isLoading,
}) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      className={`
        w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 relative overflow-hidden
        ${disabled 
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
          : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
        }
      `}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
            <span>Optimizing Portfolio...</span>
          </div>
        </div>
      )}
      
      {/* Button content */}
      <div className={`flex items-center justify-center space-x-3 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <span className="text-2xl">🚀</span>
        <span>
          {disabled 
            ? 'Select at least 2 tickers to optimize' 
            : 'Optimize My Portfolio'
          }
        </span>
      </div>
      
      {/* Animated background gradient */}
      {!disabled && !isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
      )}
    </motion.button>
  );
};

export default OptimizeButton; 
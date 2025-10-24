import React from 'react';

interface LoadingSpinnerProps {
  text?: string;
  subtext?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  text = "Loading...", 
  subtext = "Please wait a moment." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600 font-semibold">{text}</p>
      <p className="mt-1 text-sm text-gray-500">{subtext}</p>
    </div>
  );
};

export default LoadingSpinner;

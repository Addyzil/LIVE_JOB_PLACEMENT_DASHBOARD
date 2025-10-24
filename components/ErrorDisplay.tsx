
import React from 'react';

interface ErrorDisplayProps {
  message: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-md" role="alert">
      <div className="flex">
        <div className="py-1">
          <svg className="h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <p className="font-bold text-red-800">An Error Occurred</p>
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;

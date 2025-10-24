
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Live Job Placement Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          AI-powered job discovery tool for the Placement Department. Find and filter live job openings for students.
        </p>
      </div>
    </header>
  );
};

export default Header;

import React from 'react';
import { Filters } from '../types';
import { exportMarketReportToCsv } from '../utils/csvExporter';
import { DownloadIcon, SearchIcon, ClearIcon } from './icons/Icons';

interface FilterBarProps {
  filters: Filters;
  onFilterChange: (filterName: keyof Filters, value: string) => void;
  onAnalyzeMarket: () => void;
  onClearResults: () => void;
  isLoading: boolean;
  isDataAvailable: boolean;
  hasSearched: boolean;
}

const jobRoles = [
  // BPO / IT (BPO)
  "Customer Support Executive",
  "Technical Support Representative",
  "Telecaller",
  "Chat Process Executive",
  "Data Entry Operator",
  "Process Associate",
  // Banking
  "Bank Teller",
  "Loan Officer",
  "Relationship Manager (Entry-Level)",
  "KYC Analyst",
  // Fintech
  "Operations Analyst (Fintech)",
  "Payment Support Specialist",
  "Fraud Analyst",
  // Logistics
  "Logistics Coordinator",
  "Supply Chain Executive",
  "Warehouse Supervisor",
  "Delivery Associate",
];

const FilterBar: React.FC<FilterBarProps> = ({ 
  filters, 
  onFilterChange, 
  onAnalyzeMarket,
  onClearResults,
  isLoading, 
  isDataAvailable,
  hasSearched,
}) => {

  return (
    <div className="bg-white p-4 rounded-lg shadow-md sticky top-4 z-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
        
        <div>
          <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
          <select
            id="qualification"
            name="qualification"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.qualification}
            onChange={(e) => onFilterChange('qualification', e.target.value)}
            disabled={isLoading}
          >
            <option>BSC</option>
            <option>BCom</option>
            <option>BA</option>
          </select>
        </div>

        <div>
          <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
          <select
            id="sector"
            name="sector"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.sector}
            onChange={(e) => onFilterChange('sector', e.target.value)}
            disabled={isLoading}
          >
            <option>All Sectors</option>
            <option>IT</option>
            <option>Finance</option>
            <option>Retail</option>
            <option>Logistics</option>
          </select>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location Tier</label>
          <select
            id="location"
            name="location"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.location}
            onChange={(e) => onFilterChange('location', e.target.value)}
            disabled={isLoading}
          >
            <option>All Tiers</option>
            <option>Tier 1 (Metros)</option>
            <option>Tier 2</option>
            <option>Tier 3</option>
            <option>Tier 4</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
          <select
            id="jobRole"
            name="jobRole"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={filters.jobRole}
            onChange={(e) => onFilterChange('jobRole', e.target.value)}
            disabled={isLoading}
          >
            <option>All Roles</option>
            {jobRoles.sort().map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onAnalyzeMarket}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            title="Analyze Market"
          >
            <SearchIcon className="h-5 w-5 md:mr-2"/>
            <span className="hidden md:inline">{isLoading ? 'Analyzing...' : 'Analyze'}</span>
          </button>
          <button
            onClick={onClearResults}
            disabled={!hasSearched || isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 text-white font-semibold rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Clear Results"
          >
            <ClearIcon className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Clear</span>
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('downloadCsv'))}
            disabled={!isDataAvailable || isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-semibold rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Download CSV"
          >
            <DownloadIcon className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

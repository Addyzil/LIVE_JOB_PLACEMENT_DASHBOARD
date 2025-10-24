import React, { useState, useCallback, useEffect } from 'react';
import { Filters, MarketReport } from './types';
import { fetchMarketReport } from './services/geminiService';
import { exportMarketReportToCsv } from './utils/csvExporter';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorDisplay from './components/ErrorDisplay';
import MarketReportDisplay from './components/MarketReportDisplay';
import GraphDisplay from './components/GraphDisplay';

type LoadingAction = 'analyze' | null;

const getStoredState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};


const App: React.FC = () => {
  const [filters, setFilters] = useState<Filters>(() => getStoredState('jobDashboard_filters', {
    qualification: 'BSC',
    sector: 'All Sectors',
    location: 'All Tiers',
    jobRole: 'All Roles',
  }));
  const [marketReport, setMarketReport] = useState<MarketReport | null>(() => getStoredState('jobDashboard_marketReport', null));
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(() => getStoredState('jobDashboard_hasSearched', false));

  useEffect(() => {
    window.localStorage.setItem('jobDashboard_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    window.localStorage.setItem('jobDashboard_marketReport', JSON.stringify(marketReport));
  }, [marketReport]);
  
  useEffect(() => {
    window.localStorage.setItem('jobDashboard_hasSearched', JSON.stringify(hasSearched));
  }, [hasSearched]);

  useEffect(() => {
    const handleDownload = () => {
      if (marketReport && marketReport.tierAnalyses.length > 0) {
        exportMarketReportToCsv(marketReport.tierAnalyses);
      }
    };

    window.addEventListener('downloadCsv', handleDownload);

    return () => {
      window.removeEventListener('downloadCsv', handleDownload);
    };
  }, [marketReport]);

  const handleFilterChange = useCallback((filterName: keyof Filters, value: string) => {
    setFilters(prevFilters => {
        const newFilters = { ...prevFilters, [filterName]: value };
        return newFilters;
    });
  }, []);

  const resetStateForSearch = () => {
    setError(null);
    setHasSearched(true);
    setMarketReport(null);
  }

  const handleAnalyzeMarket = useCallback(async () => {
    setLoadingAction('analyze');
    resetStateForSearch();
    
    try {
      const report = await fetchMarketReport(filters);
      setMarketReport(report);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
    } finally {
      setLoadingAction(null);
    }
  }, [filters]);
  
  const handleClearResults = useCallback(() => {
    setMarketReport(null);
    setHasSearched(false);
    setError(null);
    setFilters({
      qualification: 'BSC',
      sector: 'All Sectors',
      location: 'All Tiers',
      jobRole: 'All Roles',
    });
    window.localStorage.removeItem('jobDashboard_marketReport');
    window.localStorage.removeItem('jobDashboard_hasSearched');
    window.localStorage.removeItem('jobDashboard_filters');
  }, []);

  const isLoading = loadingAction !== null;
  const isDataAvailable = (marketReport?.tierAnalyses.length ?? 0) > 0;
  const noResults = hasSearched && !isLoading && !error && !isDataAvailable;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <FilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onAnalyzeMarket={handleAnalyzeMarket}
          onClearResults={handleClearResults}
          isLoading={isLoading}
          isDataAvailable={isDataAvailable}
          hasSearched={hasSearched}
        />
        <div className="mt-8">
          {isLoading ? (
            <LoadingSpinner text="Analyzing Live Job Market..." subtext="AI is gathering real-time data from multiple sources. This might take a moment." />
          ) : error ? (
            <ErrorDisplay message={error} />
          ) : marketReport && isDataAvailable ? (
            <div className="space-y-8">
              <GraphDisplay report={marketReport} />
              <MarketReportDisplay report={marketReport} />
            </div>
          ) : noResults ? (
             <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-700">No Results Found</h2>
                <p className="mt-2 text-gray-500">
                  The AI could not find a significant number of results for the selected filters. Please try a different combination.
                </p>
              </div>
          ) : (
            <div className="text-center py-16 px-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold text-gray-700">Welcome to the Job Dashboard</h2>
                <p className="mt-2 text-gray-500">
                  Use the filters above to generate a strategic analysis of the job market by city tier.
                </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

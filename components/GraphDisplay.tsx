import React, { useMemo } from 'react';
import { MarketReport } from '../types';

interface ChartData {
  label: string;
  value: number;
}

const BarChart: React.FC<{ data: ChartData[], title: string, unit?: string, color: string }> = ({ data, title, unit = '', color }) => {
  const maxValue = useMemo(() => Math.max(...data.map(d => d.value), 0), [data]);

  return (
    <div className="flex-1 min-w-[300px]">
      <h4 className="text-md font-semibold text-gray-700 mb-3">{title}</h4>
      <div className="space-y-2">
        {data.length > 0 ? data.map(item => (
          <div key={item.label} className="flex items-center text-sm">
            <div className="w-1/3 text-gray-600 truncate pr-2 text-right">{item.label}</div>
            <div className="w-2/3">
              <div className="flex items-center">
                <div
                  className={`rounded-r-md ${color}`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white pl-2 py-1">
                     {item.value.toLocaleString()}{unit}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )) : <p className="text-sm text-gray-500">Not enough data to display.</p>}
      </div>
    </div>
  );
};

// Helper to parse estimated opening strings into a single number for charting
const parseOpenings = (openingStr: string): number => {
    // Handles "150+" -> 150
    const plusMatch = openingStr.match(/(\d+)\+/);
    if (plusMatch) return parseInt(plusMatch[1], 10);

    // Handles "50-100" -> 75 (avg)
    const rangeMatch = openingStr.match(/(\d+)\s*-\s*(\d+)/);
    if (rangeMatch) {
        return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
    }

    // Handles "approx. 75" or just "75"
    const numberMatch = openingStr.match(/\d+/);
    if (numberMatch) return parseInt(numberMatch[0], 10);
    
    return 0; // Default if no number found
}


const GraphDisplay: React.FC<{ report: MarketReport | null }> = ({ report }) => {
  const cityDemandData = useMemo<ChartData[]>(() => {
    if (!report) return [];
    const cityCounts = new Map<string, number>();
    report.tierAnalyses.forEach(tier => {
      tier.commonRoles.forEach(role => {
        role.cityOpenings.forEach(city => {
          const openings = parseOpenings(city.estimatedOpenings);
          cityCounts.set(city.cityName, (cityCounts.get(city.cityName) || 0) + openings);
        });
      });
    });
    return Array.from(cityCounts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [report]);

  const salaryData = useMemo<ChartData[]>(() => {
    if (!report) return [];
    const roleSalaries = new Map<string, { total: number, count: number }>();
    report.tierAnalyses.forEach(tier => {
        tier.commonRoles.forEach(role => {
            const avgSalary = (role.salaryRange.min + role.salaryRange.max) / 2;
            const entry = roleSalaries.get(role.roleName) || { total: 0, count: 0 };
            roleSalaries.set(role.roleName, { total: entry.total + avgSalary, count: entry.count + 1 });
        });
    });

    return Array.from(roleSalaries.entries())
      .map(([label, data]) => ({ label, value: Math.round(data.total / data.count) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);
  }, [report]);


  if (!report) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Market Insights at a Glance</h3>
      <div className="flex flex-wrap md:flex-nowrap gap-8">
        <BarChart data={cityDemandData} title="Job Demand by City (by estimated openings)" color="bg-blue-500" />
        <BarChart data={salaryData} title="Average Monthly Salary by Role" unit=" INR" color="bg-green-500" />
      </div>
    </div>
  );
};

export default GraphDisplay;

import React from 'react';
import { MarketReport, CommonRole, CityOpening, SkillSet } from '../types';
import { ExternalLinkIcon } from './icons/Icons';

const TagList: React.FC<{ items: string[], bgColor: string, textColor: string, title?: string }> = ({ items, bgColor, textColor, title }) => (
  <div>
    {title && <h5 className="text-xs font-semibold text-gray-500 mb-1">{title}</h5>}
    <div className="flex flex-wrap gap-2">
      {items.map(item => (
        <span key={item} className={`px-2 py-0.5 ${bgColor} ${textColor} text-xs font-medium rounded-full`}>
          {item}
        </span>
      ))}
    </div>
  </div>
);

const SkillSetDisplay: React.FC<{ skillSet: SkillSet }> = ({ skillSet }) => (
  <div className="space-y-2">
    {skillSet.technicalSkills.length > 0 && 
      <TagList items={skillSet.technicalSkills} bgColor="bg-blue-100" textColor="text-blue-800" title="Technical" />}
    {skillSet.softSkills.length > 0 && 
      <TagList items={skillSet.softSkills} bgColor="bg-green-100" textColor="text-green-800" title="Soft Skills" />}
    {skillSet.languageRequirements.length > 0 && 
      <TagList items={skillSet.languageRequirements} bgColor="bg-indigo-100" textColor="text-indigo-800" title="Languages" />}
  </div>
);


const CityOpeningsList: React.FC<{ items: CityOpening[] }> = ({ items }) => (
  <div className="flex flex-wrap gap-2">
    {items.map(item => (
      <span key={item.cityName} className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
        {item.cityName} ({item.estimatedOpenings})
      </span>
    ))}
  </div>
);


const PlatformLinks: React.FC<{ platforms: CommonRole['platforms'] }> = ({ platforms }) => (
  <div className="flex flex-wrap gap-2">
    {platforms.map(platform => (
       <a 
          href={platform.searchLink} 
          key={platform.platformName}
          target="_blank" 
          rel="noopener noreferrer" 
          className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full hover:bg-gray-300 transition-colors"
        >
          {platform.platformName}
          <ExternalLinkIcon className="h-3 w-3 ml-1.5" />
        </a>
    ))}
  </div>
);

const TierAnalysisTable: React.FC<{ tierAnalysis: MarketReport['tierAnalyses'][0] }> = ({ tierAnalysis }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-4 border-b">
      <h3 className="text-xl font-semibold text-gray-800">{tierAnalysis.tier} Job Market</h3>
      <p className="mt-1 text-sm text-gray-600">{tierAnalysis.summary}</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Role & Salary</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">About</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Required Skills</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Top Companies</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cities & Openings</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Find On</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tierAnalysis.commonRoles.map((role) => (
            <tr key={role.roleName} className="hover:bg-gray-50">
              <td className="px-4 py-4 align-top">
                <div className="text-sm font-semibold text-gray-900">{role.roleName}</div>
                <div className="text-xs text-green-700 font-medium mt-1">
                  {`₹${role.salaryRange.min.toLocaleString()} - ₹${role.salaryRange.max.toLocaleString()}/mo`}
                </div>
              </td>
              <td className="px-4 py-4 align-top">
                <p className="text-sm text-gray-600">{role.roleDescription}</p>
              </td>
              <td className="px-4 py-4 align-top">
                <SkillSetDisplay skillSet={role.skillSet} />
              </td>
              <td className="px-4 py-4 align-top">
                 <TagList items={role.hiringCompanies} bgColor="bg-purple-100" textColor="text-purple-800" />
              </td>
               <td className="px-4 py-4 align-top">
                 <CityOpeningsList items={role.cityOpenings} />
              </td>
              <td className="px-4 py-4 align-top">
                <PlatformLinks platforms={role.platforms} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);


const MarketReportDisplay: React.FC<{ report: MarketReport }> = ({ report }) => {
  const { overallAnalysis, tierAnalyses } = report;

  return (
    <div className="space-y-8">
      {/* Overall Analysis */}
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Market Analysis</h3>
        <p className="text-gray-600 leading-relaxed">{overallAnalysis}</p>
      </div>
      
      {/* Tier-by-Tier Breakdown */}
      {tierAnalyses.map(tierData => (
        <TierAnalysisTable key={tierData.tier} tierAnalysis={tierData} />
      ))}
    </div>
  );
};

export default MarketReportDisplay;
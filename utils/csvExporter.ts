import { TierAnalysis } from '../types';

const escapeCsvCell = (cell: string | string[] | number) => {
  const cellString = Array.isArray(cell) ? cell.join(' | ') : (cell ?? "").toString();
  if (/[",\n]/.test(cellString)) {
    return `"${cellString.replace(/"/g, '""')}"`;
  }
  return cellString;
};

export const exportMarketReportToCsv = (data: TierAnalysis[], filename: string = 'market_tier_report.csv') => {
  if (data.length === 0) {
    console.warn("No market report data to export.");
    return;
  }

  const headers = [
    'Tier',
    'Role',
    'Role Description',
    'Technical Skills',
    'Soft Skills',
    'Language Requirements',
    'Hiring Companies',
    'Top Cities & Openings',
    'Salary Range (INR)',
    'Platform',
    'Live Search Link',
  ];

  const csvRows = [headers.join(',')];

  data.forEach(tier => {
    tier.commonRoles.forEach(role => {
        const salary = `₹${role.salaryRange.min.toLocaleString()} - ₹${role.salaryRange.max.toLocaleString()}`;
        const cities = role.cityOpenings.map(c => `${c.cityName} (${c.estimatedOpenings})`).join(' | ');

        const baseRow = [
            escapeCsvCell(tier.tier),
            escapeCsvCell(role.roleName),
            escapeCsvCell(role.roleDescription),
            escapeCsvCell(role.skillSet.technicalSkills),
            escapeCsvCell(role.skillSet.softSkills),
            escapeCsvCell(role.skillSet.languageRequirements),
            escapeCsvCell(role.hiringCompanies),
            escapeCsvCell(cities),
            escapeCsvCell(salary),
        ];

        if (role.platforms.length > 0) {
            role.platforms.forEach(platform => {
                const row = [
                    ...baseRow,
                    escapeCsvCell(platform.platformName),
                    escapeCsvCell(platform.searchLink),
                ];
                csvRows.push(row.join(','));
            });
        } else {
            // If a role has no platforms, still include it in the export
            const row = [
                ...baseRow,
                '',
                '',
            ];
            csvRows.push(row.join(','));
        }
    });
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};
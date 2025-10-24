export interface CityOpening {
  cityName: string;
  estimatedOpenings: string; // A string to allow ranges like "50-100" or "200+"
}

export interface Filters {
  qualification: string;
  sector: string;
  location: string;
  jobRole: string;
}

export interface PlatformLink {
  platformName: string;
  searchLink: string;
}

export interface SkillSet {
  technicalSkills: string[];
  softSkills: string[];
  languageRequirements: string[];
}

export interface CommonRole {
  roleName:string;
  roleDescription: string;
  skillSet: SkillSet;
  platforms: PlatformLink[];
  hiringCompanies: string[];
  cityOpenings: CityOpening[];
  salaryRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface TierAnalysis {
  tier: string;
  summary: string;
  commonRoles: CommonRole[];
}

export interface MarketReport {
  overallAnalysis: string;
  tierAnalyses: TierAnalysis[];
}
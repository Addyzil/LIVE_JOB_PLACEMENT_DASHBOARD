import { GoogleGenAI, Type } from "@google/genai";
import { Filters, MarketReport, TierAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const tierAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
      tier: { 
        type: Type.STRING,
        description: "The city tier being analyzed, e.g., 'Tier 1 (Metros)'."
      },
      summary: {
        type: Type.STRING,
        description: "A short summary of the job landscape within this specific tier."
      },
      commonRoles: {
        type: Type.ARRAY,
        description: "An array of the most common and distinct entry-level job roles found in this tier based on the filters. If a specific job role was requested, this array should contain only that role.",
        items: {
          type: Type.OBJECT,
          properties: {
            roleName: { type: Type.STRING },
            roleDescription: { 
              type: Type.STRING,
              description: "A concise 1-2 sentence description of the role's responsibilities."
            },
            skillSet: {
              type: Type.OBJECT,
              description: "A structured breakdown of required skills.",
              properties: {
                technicalSkills: {
                  type: Type.ARRAY,
                  description: "List of essential technical skills (e.g., 'MS Excel', 'Tally', 'Typing Speed 40 WPM').",
                  items: { type: Type.STRING }
                },
                softSkills: {
                  type: Type.ARRAY,
                  description: "List of essential soft skills (e.g., 'Active Listening', 'Problem-Solving', 'Teamwork').",
                  items: { type: Type.STRING }
                },
                languageRequirements: {
                  type: Type.ARRAY,
                  description: "List of required languages and proficiency (e.g., 'English - Fluent', 'Hindi - Spoken').",
                  items: { type: Type.STRING }
                }
              },
              required: ["technicalSkills", "softSkills", "languageRequirements"]
            },
            platforms: {
              type: Type.ARRAY,
              description: "An array of 2-4 links to job search platforms for this specific role. The URLs must be valid and pre-filtered.",
              items: {
                type: Type.OBJECT,
                properties: {
                  platformName: { 
                    type: Type.STRING,
                    description: "The name of the job platform, e.g., 'Naukri', 'LinkedIn'."
                  },
                  searchLink: {
                    type: Type.STRING,
                    description: "A direct, pre-filtered, and valid URL to a search results page for this role on the platform."
                  }
                },
                required: ["platformName", "searchLink"]
              }
            },
            hiringCompanies: {
                type: Type.ARRAY,
                description: "An array of the top 5-10 companies hiring for this role in this tier.",
                items: { type: Type.STRING }
            },
            cityOpenings: {
                type: Type.ARRAY,
                description: "An array of the top 3-5 cities within this tier for this job, including an estimate of open positions.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        cityName: { type: Type.STRING },
                        estimatedOpenings: {
                            type: Type.STRING,
                            description: "A string representing the estimated number of live job openings in that city. E.g., '50-100', '150+', 'approx. 75'."
                        }
                    },
                    required: ["cityName", "estimatedOpenings"]
                }
            },
            salaryRange: {
                type: Type.OBJECT,
                description: "Estimated monthly salary range for an entry-level position in INR.",
                properties: {
                    min: { type: Type.NUMBER },
                    max: { type: Type.NUMBER },
                    currency: { type: Type.STRING, description: "Should always be 'INR'" }
                },
                required: ["min", "max", "currency"]
            }
          },
          required: ["roleName", "roleDescription", "skillSet", "platforms", "hiringCompanies", "cityOpenings", "salaryRange"]
        }
      }
    },
    required: ["tier", "summary", "commonRoles"]
};

const fetchSingleTierReport = async (filters: Filters, tier: string): Promise<TierAnalysis> => {
  const { qualification, sector, jobRole } = filters;

  const roleInstruction = jobRole === 'All Roles'
    ? `Identify a comprehensive list of 25-50 of the most common entry-level job roles for a ${qualification} graduate in the ${sector} sector in this tier. The goal is a large, detailed dataset. Crucially, you must focus specifically on roles within these domains: **Business Process Outsourcing (BPO), Banking, FinTech, IT (specifically BPO-related roles), and Logistics**.`
    : `Conduct a focused analysis exclusively for the **"${jobRole}"** position suitable for a ${qualification} graduate. Do not include any other roles.`;

  const systemInstruction = `You are an expert job market analyst for India, tasked with providing a strategic, tier-based analysis of the current, live entry-level job market. Your entire response must be a single, valid JSON object that strictly adheres to the provided schema. Do not output any markdown.`;

  const prompt = `
    **User Filters:**
    - **Qualification:** ${qualification}
    - **Sector Focus:** ${sector}
    - **Location Tier to Analyze:** ${tier}
    - **Specific Job Role:** ${jobRole}

    **Your Instructions:**
    1.  **Analyze Tier:** Generate a detailed analysis for the specified tier: ${tier}.
    2.  **Maximize Job Roles:** ${roleInstruction} Your target is to find a large number of roles, aiming for many role-city combinations if the data exists.
    3.  **Find Quantitative Data:** For each role, you MUST find the top 3-5 cities within this tier where the role is prevalent. For each of these cities, you must provide an **estimated number of current, live job openings**. This is critical. Present it as a string like "50-100" or "150+".
    4.  **Detail Structured Skills:** For each role, provide a structured breakdown of skills into three categories: **technicalSkills**, **softSkills**, and **languageRequirements**. Be specific (e.g., 'English (Fluent, Written & Spoken)'). This is mandatory.
    5.  **Find Companies:** For each role, list the top 5-10 hiring companies.
    6.  **Estimate Salary:** Provide an estimated entry-level monthly salary range in INR for each role.
    7.  **Provide CORRECT Platform Links:** For each role, provide 2-4 direct search links to major Indian job platforms (e.g., Naukri.com, LinkedIn, Indeed.co.in). The URLs **MUST be valid, clickable, and lead directly to a search results page** that is correctly pre-filtered with the role title and location.
    8.  **Summarize:** Write a short summary for this tier.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: tierAnalysisSchema,
      }
    });

    const reportText = response.text.trim();
    const report = JSON.parse(reportText) as TierAnalysis;
    
    if (!report.tier || !Array.isArray(report.commonRoles)) {
      throw new Error("Received malformed data from the AI model for a tier.");
    }
    return report;

  } catch (error) {
    console.error(`Error fetching market report for tier ${tier}:`, error);
    throw new Error(`Failed to generate market report for ${tier}.`);
  }
};

const generateOverallAnalysis = async (tierAnalyses: TierAnalysis[]): Promise<string> => {
    if (tierAnalyses.length === 0) {
        return "No data was available to generate an overall analysis.";
    }
    const summaries = tierAnalyses.map(t => `**${t.tier} Summary:** ${t.summary}`).join('\n\n');
    const prompt = `
        Based on the following tier-specific job market summaries, please provide a concise, one-paragraph overall analysis. Synthesize the key trends, opportunities, and differences across the tiers.

        ${summaries}
    `;
    const systemInstruction = `You are an expert job market analyst for India. Your task is to write a brief, insightful, and overarching summary based on the provided data points.`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction,
            temperature: 0.5,
        }
    });

    return response.text.trim();
};


export const fetchMarketReport = async (filters: Filters): Promise<MarketReport> => {
    const { location } = filters;
        
    let tiersToAnalyze: string[] = [];
    if (location === 'All Tiers') {
        tiersToAnalyze = ['Tier 1 (Metros)', 'Tier 2', 'Tier 3'];
    } else {
        tiersToAnalyze = [location];
    }

    try {
        const tierPromises = tiersToAnalyze.map(tier => fetchSingleTierReport(filters, tier));
        const results = await Promise.allSettled(tierPromises);

        const successfulAnalyses: TierAnalysis[] = [];
        results.forEach(result => {
            if (result.status === 'fulfilled') {
                successfulAnalyses.push(result.value);
            } else {
                console.warn(`Failed to fetch analysis for a tier:`, result.reason);
            }
        });

        if (successfulAnalyses.length === 0) {
            throw new Error("Failed to fetch market data for all selected tiers. The AI model may be overloaded. Please try again later.");
        }
        
        const overallAnalysis = await generateOverallAnalysis(successfulAnalyses);
        
        const finalReport: MarketReport = {
            overallAnalysis,
            tierAnalyses: successfulAnalyses,
        };

        return finalReport;

    } catch (error) {
        console.error("Error in fetchMarketReport orchestrator:", error);
        if (error instanceof Error) {
           throw new Error(error.message || "An unexpected error occurred while generating the market report.");
        }
        throw new Error("An unexpected error occurred while generating the market report. Please check your connection and try again.");
    }
};

import { GoogleGenAI, Type } from "@google/genai";
import { Filters, MarketReport } from '../types';

// Fix: API key must be retrieved from process.env.API_KEY as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const marketReportSchema = {
  type: Type.OBJECT,
  properties: {
    overallAnalysis: {
      type: Type.STRING,
      description: "A brief, one-paragraph summary analyzing the job market for this profile across all specified tiers."
    },
    tierAnalyses: {
      type: Type.ARRAY,
      description: "An array of detailed analyses for each requested city tier (e.g., Tier 1, Tier 2).",
      items: {
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
      }
    }
  },
  required: ["overallAnalysis", "tierAnalyses"]
};


export const fetchMarketReport = async (filters: Filters): Promise<MarketReport> => {
  const { qualification, sector, location, jobRole } = filters;

  const roleInstruction = jobRole === 'All Roles'
    ? `For each tier, identify a comprehensive list of 25-50 of the most common entry-level job roles for a ${qualification} graduate in the ${sector} sector. The goal is a large, detailed dataset. Crucially, you must focus specifically on roles within these domains: **Business Process Outsourcing (BPO), Banking, FinTech, IT (specifically BPO-related roles), and Logistics**.`
    : `For each tier, conduct a focused analysis exclusively for the **"${jobRole}"** position suitable for a ${qualification} graduate. Do not include any other roles.`;


  const prompt = `
    You are an expert job market analyst for India, tasked with providing a strategic, tier-based analysis of the current, live entry-level job market. Your entire response must be a single, valid JSON object that strictly adheres to the provided schema. Do not output any markdown.

    **User Filters:**
    - **Qualification:** ${qualification}
    - **Sector Focus:** ${sector}
    - **Location Tier(s) to Analyze:** ${location}
    - **Specific Job Role:** ${jobRole}

    **Your Instructions:**
    1.  **Analyze by Tier:** Based on the "${location}" filter, generate a detailed analysis for each specified tier (Tier 1, Tier 2, Tier 3, Tier 4). If 'All Tiers' is selected, provide an analysis for Tiers 1, 2, and 3.
    2.  **Maximize Job Roles:** ${roleInstruction} Your target is to find a large number of roles, aiming for over 100 role-city combinations if the data exists.
    3.  **Find Quantitative Data:** For each role, you MUST find the top 3-5 cities within that tier where the role is prevalent. For each of these cities, you must provide an **estimated number of current, live job openings**. This is critical. Present it as a string like "50-100" or "150+".
    4.  **Detail Structured Skills:** For each role, provide a structured breakdown of skills into three categories: **technicalSkills**, **softSkills**, and **languageRequirements**. Be specific (e.g., 'English (Fluent, Written & Spoken)'). This is mandatory.
    5.  **Find Companies:** For each role, list the top 5-10 hiring companies.
    6.  **Estimate Salary:** Provide an estimated entry-level monthly salary range in INR for each role.
    7.  **Provide CORRECT Platform Links:** For each role, provide 2-4 direct search links to major Indian job platforms (e.g., Naukri.com, LinkedIn, Indeed.co.in). The URLs **MUST be valid, clickable, and lead directly to a search results page** that is correctly pre-filtered with the role title and location.
    8.  **Summarize:** Write a short summary for each tier and a brief overall analysis paragraph.
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: marketReportSchema,
      }
    });

    const reportText = response.text.trim();
    const report = JSON.parse(reportText) as MarketReport;
    
    if (!report.overallAnalysis || !Array.isArray(report.tierAnalyses)) {
      throw new Error("Received malformed data from the AI model.");
    }

    return report;

  } catch (error) {
    console.error("Error fetching market report from Gemini API:", error);
    throw new Error("Failed to generate market report. The AI model might be busy or returned an invalid format. Please try again.");
  }
};
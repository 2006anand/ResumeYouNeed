import { GoogleGenAI, Type } from "@google/genai";
import { FileData, MatchResult, ComparisonResult, ResumeProfile } from "../types";

/**
 * Initializes the Google GenAI client.
 * Relies on the API_KEY environment variable.
 */
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Checks if the current user has reached their daily usage limit (5 times per day).
 */
export const checkDailyLimit = (): { allowed: boolean; error?: string } => {
  const email = localStorage.getItem('user_email');
  if (!email) {
    return { allowed: false, error: "Please sign in on the Home page to use this feature." };
  }

  const today = new Date().toISOString().split('T')[0];
  const key = `usage_${email}_${today}`;
  const count = parseInt(localStorage.getItem(key) || '0', 10);

  if (count >= 5) {
    return { allowed: false, error: "You hit your daily limit (5/5). Try again tomorrow!" };
  }

  return { allowed: true };
};

/**
 * Retrieves the current daily usage count for the user.
 */
export const getDailyUsage = (): number => {
  const email = localStorage.getItem('user_email');
  if (!email) return 0;
  
  const today = new Date().toISOString().split('T')[0];
  const key = `usage_${email}_${today}`;
  return parseInt(localStorage.getItem(key) || '0', 10);
};

/**
 * Increments the daily usage count for the current user.
 */
export const incrementDailyLimit = () => {
  const email = localStorage.getItem('user_email');
  if (!email) return;

  const today = new Date().toISOString().split('T')[0];
  const key = `usage_${email}_${today}`;
  const count = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, (count + 1).toString());
};

/**
 * Rewrites a rough job description input into a professional, formatted job description.
 */
export const suggestJobDescription = async (input: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `You are an expert HR assistant. The user has provided a draft, title, or keywords for a job description: "${input}".
  Please generate a professional, concise, but comprehensive job description based on this input.
  Include a brief summary, Key Responsibilities, and Requirements. Keep it under 150 words for quick reading.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating suggestion:", error);
    throw error;
  }
};

/**
 * Provides a short real-time completion suggestion for a job description.
 */
export const getJobDescriptionSuggestion = async (input: string, roles: string[]): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Based on the current job title/keywords: "${input}" and selected roles: ${roles.join(', ')}, suggest a short sentence to complete or improve this job description. Keep it under 10 words.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        thinkingConfig: { thinkingBudget: 0 },
      }
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error fetching real-time suggestion:", error);
    return "";
  }
};

/**
 * Helper to safely parse JSON response.
 */
const safeJsonParse = <T>(text: string, fallback?: T): T => {
  let cleanText = text.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(json)?\s*/, "");
    cleanText = cleanText.replace(/\s*```$/, "");
  }
  try {
    return JSON.parse(cleanText) as T;
  } catch (e) {
    if (fallback !== undefined) return fallback;
    throw new Error("Failed to parse AI response.");
  }
};

/**
 * Main function to match a resume PDF/text against a job description.
 */
export const matchResumeToJobs = async (
  resume: FileData,
  jobDescriptions: string
): Promise<MatchResult[]> => {
  const ai = getAiClient();
  const prompt = `
    Analyze this resume against the job description.
    Provide match percentage, pros, cons, improvements, and interview questions.
    Job Descriptions: ${jobDescriptions}
  `;

  const resumePart = {
    inlineData: {
      mimeType: resume.type,
      data: resume.data,
    },
  };

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        jobTitle: { type: Type.STRING },
        matchPercentage: { type: Type.NUMBER },
        pros: { type: Type.ARRAY, items: { type: Type.STRING } },
        cons: { type: Type.ARRAY, items: { type: Type.STRING } },
        improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
        interviewQuestions: { 
          type: Type.ARRAY, 
          items: { 
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              answer: { type: Type.STRING }
            },
            required: ["question", "answer"]
          },
        },
        reasoning: { type: Type.STRING },
      },
      required: ["jobTitle", "matchPercentage", "pros", "cons", "improvements", "interviewQuestions", "reasoning"],
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [resumePart, { text: prompt }],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return safeJsonParse<MatchResult[]>(response.text || "[]");
  } catch (error) {
    console.error("Error matching jobs:", error);
    throw error;
  }
};

/**
 * Compares two resumes side-by-side.
 */
export const compareResumes = async (
  resumeA: FileData,
  resumeB: FileData,
  context?: string
): Promise<ComparisonResult> => {
  const ai = getAiClient();
  const prompt = `Compare these two resumes. Context/Role: ${context || "General"}`;

  const partA = { inlineData: { mimeType: resumeA.type, data: resumeA.data } };
  const partB = { inlineData: { mimeType: resumeB.type, data: resumeB.data } };

  const schema = {
    type: Type.OBJECT,
    properties: {
      overallWinner: { type: Type.STRING, enum: ["Resume A", "Resume B", "Tie"] },
      summary: { type: Type.STRING },
      categories: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            resumeAScore: { type: Type.NUMBER },
            resumeBScore: { type: Type.NUMBER },
            resumeANotes: { type: Type.STRING },
            resumeBNotes: { type: Type.STRING },
            winner: { type: Type.STRING, enum: ["Resume A", "Resume B", "Tie"] },
          },
          required: ["name", "resumeAScore", "resumeBScore", "resumeANotes", "resumeBNotes", "winner"],
        },
      },
    },
    required: ["overallWinner", "summary", "categories"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { text: "Resume A:" }, partA,
          { text: "Resume B:" }, partB,
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
      },
    });

    return safeJsonParse<ComparisonResult>(response.text || "{}");
  } catch (error) {
    console.error("Error comparing resumes:", error);
    throw error;
  }
};

/**
 * Takes raw profile data and polishes it using AI.
 * EXTREMELY POWERFUL: Generates professional content from minimal "basic" user inputs.
 */
export const polishResume = async (data: ResumeProfile): Promise<ResumeProfile> => {
  const ai = getAiClient();
  
  const prompt = `
    You are a World-Class Resume Architect. 
    Your goal is to transform basic, raw inputs into high-impact, single-page professional resume content.
    
    SPECIAL HANDLING FOR BASIC INPUTS:
    - If Experience [details] is empty but [role] is provided: GENERATE 3-4 professional bullet points using the STAR method (Situation, Task, Action, Result). Focus on metrics like "Improved efficiency by 20%" or "Led team of 5".
    - If Project [description] is empty but [title] is provided: GENERATE a technical description including a likely tech stack and impact.
    - Summary: If the user provides no summary, write a powerful 3-line professional overview based on their roles.
    - Skills: Categorize and expand the skills list to include relevant keywords for ATS optimization.
    
    DO NOT fabricate:
    - Educational institutions or graduation years (use placeholders if missing).
    - Phone numbers or emails.
    - Company names (keep user's company names as is).

    INPUT DATA:
    ${JSON.stringify(data)}
  `;

  const schema = {
    type: Type.OBJECT,
    properties: {
      fullName: { type: Type.STRING },
      email: { type: Type.STRING },
      phone: { type: Type.STRING },
      linkedin: { type: Type.STRING },
      summary: { type: Type.STRING },
      education: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            degree: { type: Type.STRING },
            school: { type: Type.STRING },
            year: { type: Type.STRING },
          },
        },
      },
      skills: { type: Type.STRING },
      experience: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING },
            company: { type: Type.STRING },
            duration: { type: Type.STRING },
            details: { type: Type.STRING },
          },
        },
      },
      projects: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: {
             title: { type: Type.STRING },
             link: { type: Type.STRING },
             technologies: { type: Type.STRING },
             description: { type: Type.STRING },
             contributions: { type: Type.STRING },
           }
        }
      },
      awards: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: {
             title: { type: Type.STRING },
             issuer: { type: Type.STRING },
             date: { type: Type.STRING },
             details: { type: Type.STRING },
           }
        }
      },
      certifications: {
        type: Type.ARRAY,
        items: {
           type: Type.OBJECT,
           properties: {
             name: { type: Type.STRING },
             issuer: { type: Type.STRING },
             year: { type: Type.STRING },
           }
        }
      },
      socialLinks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING },
            url: { type: Type.STRING },
          }
        }
      },
      interests: { type: Type.STRING },
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        thinkingConfig: { thinkingBudget: 0 },
      }
    });

    return safeJsonParse<ResumeProfile>(response.text || "", data);
  } catch (error) {
    console.error("Error polishing resume:", error);
    return data;
  }
};

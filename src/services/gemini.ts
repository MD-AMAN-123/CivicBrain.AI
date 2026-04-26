import { GoogleGenerativeAI } from "@google/generative-ai";

export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

interface ExplainParams {
  topic: string;
  level: LearningLevel;
  language?: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

// Access API Key from environment variables
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Ultra-Robust Fallback that provides CLEAR error messages
 */
async function ultraRobustFetch(prompt: string, systemInstruction: string) {
  // Try these models in order of likelihood to work with various keys
  const models = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];
  const versions = ["v1", "v1beta"];

  let lastError = "";

  for (const model of models) {
    for (const version of versions) {
      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ 
              parts: [{ text: `${systemInstruction}\n\nTopic to explain: ${prompt}` }] 
            }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates[0].content.parts[0].text;
        }

        const errorData = await response.json();
        const msg = errorData.error?.message || "";
        const status = response.status;

        if (status === 401 || status === 403) {
          return "🚨 INVALID API KEY: The Gemini API key in your .env file is either incorrect or restricted. Please generate a new key at aistudio.google.com and update your .env file.";
        }
        
        lastError = msg || `Status ${status}`;
      } catch (e) {
        lastError = "Network Error";
      }
    }
  }
  
  throw new Error(lastError);
}

/**
 * Service to interact with Gemini AI
 */
export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level } = params;

  if (!API_KEY || API_KEY === "" || API_KEY === "API_KEY") {
    return "AI Assistant is in demo mode. Please set VITE_GEMINI_API_KEY in your .env file.";
  }

  const systemInstruction = `You are CivicBrain AI, a specialized election assistant. 
  Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
  Keep your answers concise and tailored to a ${level} audience. Use markdown formatting.`;

  try {
    // Primary SDK Attempt
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: topic }] }],
      systemInstruction: systemInstruction
    });
    const response = await result.response;
    return response.text();
  } catch (error: any) {
    // Check for clear authentication errors in the SDK too
    const errorMsg = error?.message || "";
    if (errorMsg.includes("401") || errorMsg.includes("403") || errorMsg.includes("API key not valid")) {
      return "🚨 INVALID API KEY: Your Gemini API key is not valid. Please check your .env file and ensure the key is correct.";
    }

    // Fallback to ultra-robust fetch
    try {
      return await ultraRobustFetch(topic, systemInstruction);
    } catch (e: any) {
      console.error("Gemini Fatal:", e);
      return `I'm still having trouble connecting. Error: ${e.message || "Unknown Connection Failure"}. Please ensure your API key is active and your internet is stable.`;
    }
  }
};

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  if (!API_KEY || API_KEY === "API_KEY") {
    return [
      {
        question: "What is the minimum age to vote in India?",
        options: ["16", "18", "21", "25"],
        answer: "18"
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    }, { apiVersion: "v1" });

    const result = await model.generateContent(`Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]`);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    return [
      {
        question: "What is the minimum age to vote in India?",
        options: ["16", "18", "21", "25"],
        answer: "18"
      }
    ];
  }
};

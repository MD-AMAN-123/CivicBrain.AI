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
 * Ultra-robust fallback fetch that tries multiple models and versions
 */
async function ultraRobustFetch(prompt: string, systemInstruction: string) {
  // Try these models in order
  const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
  const versions = ["v1", "v1beta"];

  for (const model of models) {
    for (const version of versions) {
      try {
        console.log(`Trying Gemini ${model} via ${version}...`);
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${API_KEY}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${prompt}` }] }]
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.candidates[0].content.parts[0].text;
        }
      } catch (e) {
        console.warn(`Failed with ${model}/${version}`, e);
      }
    }
  }
  throw new Error("All Gemini models and versions failed. Please check your API key.");
}

/**
 * Service to interact with Gemini AI
 */
export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level } = params;

  if (!API_KEY || API_KEY === "API_KEY" || API_KEY.includes("YOUR_GEMINI_API_KEY")) {
    return "AI Assistant is currently in demo mode. Please configure a valid VITE_GEMINI_API_KEY in your .env file to enable live election insights.";
  }

  const systemInstruction = `You are CivicBrain AI, a specialized election assistant. 
  Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
  Keep your answers concise, engaging, and tailored to the following audience level: ${level}.
  Use markdown formatting. If the user asks something completely unrelated to elections, politely redirect them.`;

  try {
    // Try the most modern SDK approach first
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }, { apiVersion: "v1" });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: topic }] }],
      systemInstruction: systemInstruction
    });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.warn("Primary SDK attempt failed, entering ultra-robust fallback mode...");
    try {
      return await ultraRobustFetch(topic, systemInstruction);
    } catch (finalError) {
      console.error("Gemini AI Fatal Error:", finalError);
      return "I'm still having trouble connecting. This is usually due to an invalid API key or a network block. Please verify your key at aistudio.google.com and ensure you are online!";
    }
  }
};

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  if (!API_KEY || API_KEY === "API_KEY") {
    return [
      {
        question: "What is the first step in the election journey? (Demo Mode)",
        options: ["Campaigning", "Voting", "Registration", "Nomination"],
        answer: "Registration"
      }
    ];
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    }, { apiVersion: "v1" });

    const result = await model.generateContent(`Generate a 3-question multiple choice quiz about ${topic} in JSON format. [{question, options, answer}]`);
    const response = await result.response;
    return JSON.parse(response.text());
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [
      {
        question: "What is the minimum age to vote in India?",
        options: ["16", "18", "21", "25"],
        answer: "18"
      }
    ];
  }
};

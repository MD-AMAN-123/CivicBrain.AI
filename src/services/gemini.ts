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
 * Service to interact with Gemini AI
 */
export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level } = params;

  if (!API_KEY) {
    return "AI Assistant is currently in demo mode. Please configure VITE_GEMINI_API_KEY to enable live election insights.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are CivicBrain AI, a specialized election assistant. 
      Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
      Keep your answers concise and tailored to the following audience level: ${level}.
      If the user asks something completely unrelated to elections or civic duties, politely redirect them to election-related topics.`
    });

    const result = await model.generateContent(topic);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "I'm having trouble connecting to my brain right now. Let's try again in a moment!";
  }
};

export const generateQuiz = async (): Promise<QuizQuestion[]> => {
  // For a real app, this would also call Gemini to generate dynamic questions
  return [
    {
      question: "What is the first step in the election journey?",
      options: ["Campaigning", "Voting", "Registration", "Nomination"],
      answer: "Registration"
    }
  ];
};

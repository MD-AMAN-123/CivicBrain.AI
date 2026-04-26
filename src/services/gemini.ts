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

  if (!API_KEY || API_KEY === "API_KEY") {
    return "AI Assistant is currently in demo mode. Please configure a valid VITE_GEMINI_API_KEY in your .env file to enable live election insights.";
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      systemInstruction: `You are CivicBrain AI, a specialized election assistant. 
      Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
      Keep your answers concise, engaging, and tailored to the following audience level: ${level}.
      Use markdown formatting (bolding, lists) to make information readable.
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
      model: "gemini-1.5-flash-latest",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `Generate a 3-question multiple choice quiz about ${topic}. 
    Each question should have exactly 4 options and one correct answer.
    Return the result as a JSON array of objects with the following structure:
    [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"],
        "answer": "string (matching one of the options exactly)"
      }
    ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [
      {
        question: "Could not generate live questions. What is the minimum age to vote in India?",
        options: ["16", "18", "21", "25"],
        answer: "18"
      }
    ];
  }
};

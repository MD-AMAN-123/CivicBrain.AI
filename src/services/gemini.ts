export type LearningLevel = 'beginner' | 'intermediate' | 'advanced';

interface ExplainParams {
  topic: string;
  level: LearningLevel;
  onStream?: (chunk: string) => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level, onStream } = params;
  
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        message: `System: You are CivicBrain AI, an expert on elections. Level: ${level}\nUser: ${topic}` 
      }),
    });

    const data = await response.json();
    
    if (!data.reply) {
      return "⚠️ AI is busy. Try again.";
    }
    
    // Call onStream with the full text just in case components still expect it
    if (onStream) {
      onStream(data.reply);
    }
    
    return data.reply;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = `⚠️ Connection failed. ${error.message}`;
    if (onStream) onStream(msg);
    return msg;
  }
};

// Removed deprecated streaming and fallback functions

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  try {
    const text = await explainConcept({ topic: `Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]. Return ONLY JSON.`, level: 'intermediate' });
    const jsonMatch = text.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  } catch {
    return [{ question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }];
  }
};

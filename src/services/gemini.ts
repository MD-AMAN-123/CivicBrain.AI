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

  // Create an AbortController to handle timeouts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        message: `System: You are CivicBrain AI, an expert on elections. Explain concepts simply. Level: ${level}\nUser: ${topic}`
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try { errorData = JSON.parse(errorText); } catch { errorData = { reply: errorText }; }

      const errMsg = errorData.reply || `⚠️ Server error (${response.status})`;
      if (onStream) onStream(errMsg);
      return errMsg;
    }

    const data = await response.json();

    if (!data.reply) {
      const errMsg = "⚠️ Received empty response from AI.";
      if (onStream) onStream(errMsg);
      return errMsg;
    }

    if (onStream) {
      onStream(data.reply);
    }

    return data.reply;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const error = err instanceof Error ? err : new Error(String(err));
    console.error("Gemini Error:", error);

    const msg = error.name === 'AbortError'
      ? "⚠️ Request timed out. The AI is taking too long to respond."
      : `⚠️ Connection failed. Please check your internet or Vercel logs.`;

    if (onStream) onStream(msg);
    return msg;
  }
};

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  try {
    const text = await explainConcept({ topic: `Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]. Return ONLY JSON.`, level: 'intermediate' });
    const jsonMatch = text.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  } catch {
    return [{ question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }];
  }
};

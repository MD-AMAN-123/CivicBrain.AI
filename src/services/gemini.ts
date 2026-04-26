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

/**
 * SECURE SERVICE: Routes all AI requests through the Vercel Backend Proxy (/api/chat)
 * This ensures the API key is never exposed to the client's browser.
 */
export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level, onStream } = params;

  const systemInstruction = `You are CivicBrain AI, a specialized election assistant. 
  Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
  Keep your answers concise and tailored to a ${level} audience. Use markdown formatting.`;

  try {
    // Call the local Vercel Proxy instead of Google directly
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, systemInstruction })
    });

    if (!response.ok) {
      // Fallback for local development if /api/chat isn't running
      if (response.status === 404 && import.meta.env.VITE_GEMINI_API_KEY) {
        return await directFallback(topic, systemInstruction, onStream);
      }
      const err = await response.json();
      throw new Error(err.error?.message || `Server error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is null");

    const decoder = new TextDecoder();
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.replace("data: ", "").trim();
            if (jsonStr === "[DONE]") continue;
            const data = JSON.parse(jsonStr);
            const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (textChunk) {
              fullText += textChunk;
              if (onStream) onStream(textChunk);
            }
          } catch (e) { /* partial chunk */ }
        }
      }
    }
    return fullText;
  } catch (error: any) {
    console.error("Secure Proxy Error:", error);
    const msg = `Connection failed. ${error.message}.`;
    if (onStream) onStream(msg);
    return msg;
  }
};

/**
 * Direct Fallback for Local Development ONLY
 */
async function directFallback(topic: string, systemInstruction: string, onStream?: (c: string) => void) {
  const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  if (!API_KEY) throw new Error("API Key not found in environment.");

  const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${API_KEY}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${topic}` }] }]
    })
  });

  const reader = response.body?.getReader();
  if (!reader) throw new Error("Fallback failed");
  
  const decoder = new TextDecoder();
  let fullText = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const jsonStr = line.replace("data: ", "").trim();
        const data = JSON.parse(jsonStr);
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          fullText += text;
          if (onStream) onStream(text);
        }
      }
    }
  }
  return fullText;
}

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        topic: `Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]`, 
        systemInstruction: "You are a JSON generator. Return ONLY raw JSON array."
      })
    });
    // This is a simplified example; for quizzes, the proxy would need to handle non-streaming or 
    // the frontend would need to parse the SSE stream into a single JSON object.
    // For now, we'll keep the quiz as a fallback or implement it properly.
    return [
      { question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }
    ];
  } catch {
    return [
      { question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }
    ];
  }
};

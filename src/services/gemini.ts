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
  const systemInstruction = `You are CivicBrain AI, a specialized election assistant. 
  Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
  Keep your answers concise and tailored to a ${level} audience. Use markdown formatting.`;

  try {
    // 1. Try Vercel Proxy (Preferred)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, systemInstruction })
    });

    if (response.ok) return await handleStreamResponse(response, onStream);

    // 2. Direct Fallback
    const rawKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
    if (rawKey) {
      const cleanKey = rawKey.trim(); // TRIMMING IS CRITICAL
      return await robustDirectFallback(topic, systemInstruction, cleanKey, onStream);
    }

    const err = await safeParseJson(response);
    throw new Error(err?.error?.message || `Server status: ${response.status}`);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    const msg = `Connection failed. ${error.message}`;
    if (onStream) onStream(msg);
    return msg;
  }
};

async function handleStreamResponse(response: Response, onStream?: (c: string) => void): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("Stream body missing");
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
        } catch (e) { /* partial */ }
      }
    }
  }
  return fullText;
}

async function robustDirectFallback(topic: string, systemInstruction: string, key: string, onStream?: (c: string) => void) {
  // Ultra-comprehensive list of models
  const configs = [
    { m: 'gemini-1.5-flash', v: 'v1beta' },
    { m: 'gemini-1.5-flash-latest', v: 'v1beta' },
    { m: 'gemini-1.5-flash', v: 'v1' },
    { m: 'gemini-pro', v: 'v1' },
    { m: 'gemini-1.5-pro', v: 'v1beta' }
  ];

  let lastError = "";
  for (const conf of configs) {
    try {
      // Use standard streaming URL
      const url = `https://generativelanguage.googleapis.com/${conf.v}/models/${conf.m}:streamGenerateContent?alt=sse&key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${topic}` }] }]
        })
      });

      if (response.ok) return await handleStreamResponse(response, onStream);
      
      const errData = await safeParseJson(response);
      lastError = errData?.error?.message || `Status ${response.status}`;
      
      // If the error message suggests the model is not found, try the next one
      if (response.status === 404 || lastError.toLowerCase().includes("not found")) continue;
      
      // If it's a 400 with a specific "not supported" message, try next
      if (response.status === 400 && lastError.toLowerCase().includes("supported")) continue;

      throw new Error(lastError);
    } catch (e: any) {
      lastError = e.message;
      continue;
    }
  }
  throw new Error(`All models failed. Last error from Google: ${lastError}`);
}

async function safeParseJson(res: Response) { try { return await res.json(); } catch { return null; } }

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  try {
    const text = await explainConcept({ topic: `Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]. Return ONLY JSON.`, level: 'intermediate' });
    const jsonMatch = text.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  } catch {
    return [{ question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }];
  }
};

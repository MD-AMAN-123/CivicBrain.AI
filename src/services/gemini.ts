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

// Support both VITE_ prefixed and regular env vars for maximum local compatibility
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

/**
 * SECURE & ROBUST SERVICE
 * Routes through Vercel Proxy (/api/chat) in production, 
 * with a high-resiliency direct fallback for local development.
 */
export const explainConcept = async (params: ExplainParams): Promise<string> => {
  const { topic, level, onStream } = params;

  const systemInstruction = `You are CivicBrain AI, a specialized election assistant. 
  Your goal is to provide accurate, unbiased, and easy-to-understand information about elections, voting processes, and democratic systems.
  Keep your answers concise and tailored to a ${level} audience. Use markdown formatting.`;

  try {
    // 1. Attempt to use the Vercel Backend Proxy (Secure)
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, systemInstruction })
    });

    if (response.ok) {
      return await handleStreamResponse(response, onStream);
    }

    // 2. Local Development Fallback (if /api/chat is 404)
    if (response.status === 404 || response.status === 500) {
      console.log("Proxy unavailable or failed, attempting direct robust fallback...");
      return await robustDirectFallback(topic, systemInstruction, onStream);
    }

    const err = await safeParseJson(response);
    throw new Error(err?.error?.message || `Server error: ${response.status}`);

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    const msg = `Connection failed. ${error.message}`;
    if (onStream) onStream(msg);
    return msg;
  }
};

/**
 * Handles SSE Stream responses from either the proxy or direct Gemini API
 */
async function handleStreamResponse(response: Response, onStream?: (c: string) => void): Promise<string> {
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
}

/**
 * High-Resiliency Direct Fallback that cycles through multiple models/versions
 */
async function robustDirectFallback(topic: string, systemInstruction: string, onStream?: (c: string) => void) {
  const key = API_KEY;
  if (!key || key === "" || key === "API_KEY") {
    throw new Error("No API key found. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  const configs = [
    { model: 'gemini-1.5-flash', version: 'v1' },
    { model: 'gemini-1.5-flash', version: 'v1beta' },
    { model: 'gemini-pro', version: 'v1' },
    { model: 'gemini-1.5-pro', version: 'v1beta' }
  ];

  let lastError = "";

  for (const config of configs) {
    try {
      const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:streamGenerateContent?alt=sse&key=${key}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${topic}` }] }]
        })
      });

      if (response.ok) {
        return await handleStreamResponse(response, onStream);
      }

      const errData = await safeParseJson(response);
      lastError = errData?.error?.message || `Status ${response.status}`;
      
      if (response.status === 404 || lastError.includes("not found")) {
        continue; // Try next model in loop
      }
      throw new Error(lastError);
    } catch (e: any) {
      lastError = e.message;
      continue;
    }
  }

  throw new Error(lastError || "All Gemini models failed to respond.");
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export const generateQuiz = async (topic: string = "general elections"): Promise<QuizQuestion[]> => {
  try {
    const text = await explainConcept({ 
      topic: `Generate a 3-question quiz about ${topic} in JSON array format: [{question, options, answer}]. Return ONLY the JSON array.`, 
      level: 'intermediate' 
    });
    // Attempt to extract JSON from the text response
    const jsonMatch = text.match(/\[.*\]/s);
    return JSON.parse(jsonMatch ? jsonMatch[0] : "[]");
  } catch {
    return [
      { question: "What is the minimum age to vote in India?", options: ["16", "18", "21", "25"], answer: "18" }
    ];
  }
};

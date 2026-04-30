import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST requests allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "⚠️ Message is required" });
    }

    // ✅ Load API key from Vercel env
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ ERROR: GEMINI_API_KEY is missing from environment variables");
      return res.status(500).json({
        reply: "⚠️ Server misconfiguration: GEMINI_API_KEY is not set in Vercel settings.",
      });
    }

    // Safely log key presence (first 4 and last 4 chars)
    console.log(`✅ API KEY DETECTED: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // ✅ Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // 🔥 Switch to gemini-1.5-flash for maximum compatibility and speed
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    console.log("✅ Using model: gemini-1.5-flash");

    // ✅ Generate response
    const result = await model.generateContent(message);
    const response = result.response;
    const text = response.text();

    console.log("✅ Gemini response received successfully");

    if (!text) {
      return res.status(200).json({
        reply: "⚠️ AI returned an empty response. Please try again.",
      });
    }

    return res.status(200).json({
      reply: text,
    });

  } catch (error: any) {
    console.error("🔥 FULL GEMINI ERROR:", error);
    
    let errorMessage = "⚠️ AI failed to respond. Please check your internet or retry later.";
    
    if (error.message?.includes("API_KEY_INVALID")) {
      errorMessage = "⚠️ Invalid Gemini API Key. Please update it in Vercel settings.";
    } else if (error.message?.includes("model not found")) {
      errorMessage = "⚠️ Selected Gemini model is not available for this API key.";
    }

    return res.status(500).json({
      reply: errorMessage,
      error: error?.message || "Unknown error",
    });
  }
}
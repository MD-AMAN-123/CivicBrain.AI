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
      console.error("❌ ERROR: GEMINI_API_KEY is missing");
      return res.status(500).json({
        reply: "⚠️ Server misconfiguration (API key missing)",
      });
    }

    console.log("✅ API KEY DETECTED");

    // ✅ Initialize Gemini SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // 🔥 Use most stable model
    const model = genAI.getGenerativeModel({
      model: "gemini-pro",
    });

    console.log("✅ Using model: gemini-pro");

    // ✅ Generate response (simple & reliable format)
    const result = await model.generateContent(message);

    const response = result.response;
    const text = response.text();

    console.log("✅ Gemini response received");

    if (!text) {
      return res.status(200).json({
        reply: "⚠️ AI returned empty response",
      });
    }

    return res.status(200).json({
      reply: text,
    });

  } catch (error: any) {
    console.error("🔥 FULL GEMINI ERROR:", error);

    return res.status(500).json({
      reply: "⚠️ AI failed to respond. Check Vercel logs.",
      error: error?.message || "Unknown error",
    });
  }
}
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Method Not Allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ reply: "⚠️ Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY");
      return res.status(500).json({
        reply: "⚠️ Server misconfigured (API key missing)",
      });
    }

    console.log("✅ API key found");

    const genAI = new GoogleGenerativeAI(apiKey);

    // 🔥 Use stable model (DO NOT change unless needed)
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
    });

    console.log("✅ Using model: gemini-1.5-pro");

    // ✅ FIX: correct request format (THIS WAS YOUR MAIN BUG)
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: message }],
        },
      ],
    });

    const response = await result.response;
    const text = response.text();

    console.log("✅ Gemini responded");

    if (!text) {
      return res.status(200).json({
        reply: "⚠️ AI returned empty response",
      });
    }

    return res.status(200).json({ reply: text });

  } catch (error: any) {
    console.error("🔥 Gemini FULL ERROR:", error);

    return res.status(500).json({
      reply: "⚠️ AI failed. Check Vercel logs.",
      error: error?.message || "Unknown error",
    });
  }
}
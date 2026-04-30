export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Only POST allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ reply: "⚠️ GEMINI_API_KEY is missing in Vercel settings." });
    }

    // Prepare the payload. 
    // IMPORTANT: We use the most standard structure and include 'role' which is required by some models.
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: message }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000,
      }
    };

    // Try the most reliable combination first: v1beta + gemini-1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    console.log(`🚀 Sending request to Gemini v1beta (Model: gemini-1.5-flash)`);
    
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (response.ok) {
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log("✅ Gemini responded successfully!");
        return res.status(200).json({ reply: text });
      }
    }

    // IF PRIMARY FAILS, try the "stable" v1 + gemini-pro combination
    console.warn("⚠️ Primary model failed, trying stable fallback (v1/gemini-pro)...");
    const fallbackUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`;
    
    const fallbackResponse = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const fallbackData = await fallbackResponse.json();

    if (fallbackResponse.ok) {
      const text = fallbackData?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        console.log("✅ Fallback Gemini responded successfully!");
        return res.status(200).json({ reply: text });
      }
    }

    // If both fail, return the EXACT error from Google so we can diagnose it
    const finalError = fallbackData.error?.message || data.error?.message || "Unknown Google API Error";
    console.error("🔥 ALL MODELS FAILED:", finalError);

    return res.status(500).json({
      reply: `⚠️ Gemini Error: ${finalError}`,
      debug: {
        primaryStatus: response.status,
        fallbackStatus: fallbackResponse.status,
        googleMessage: finalError
      }
    });

  } catch (error: any) {
    console.error("🔥 CRITICAL HANDLER ERROR:", error);
    return res.status(500).json({ reply: "⚠️ Server crashed", error: error.message });
  }
}
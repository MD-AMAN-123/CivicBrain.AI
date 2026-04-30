export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message required" });

    // Clean API Key
    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ reply: "⚠️ GEMINI_API_KEY missing in Vercel. Please add it in project settings." });
    }

    // Comprehensive list of model/version combinations
    const attempts = [
      { v: "v1beta", m: "gemini-1.5-flash" },
      { v: "v1", m: "gemini-1.5-flash" },
      { v: "v1beta", m: "gemini-pro" },
      { v: "v1", m: "gemini-pro" },
      { v: "v1beta", m: "gemini-1.5-pro" },
      { v: "v1", m: "gemini-1.0-pro" }
    ];

    let lastErrorMessage = "";

    for (const { v, m } of attempts) {
      try {
        console.log(`🚀 Attempting: ${m} via ${v}`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }],
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
              }
            })
          }
        );

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`✅ SUCCESS with ${m} (${v})`);
          return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        // If not OK, save the message and try next
        lastErrorMessage = data.error?.message || "Unknown error";
        console.warn(`❌ FAILED ${m} (${v}): ${lastErrorMessage}`);

        // If the error is "API key not valid", stop immediately as no model will work
        if (lastErrorMessage.includes("API key not valid")) {
          return res.status(401).json({ reply: "⚠️ Your Gemini API Key is invalid. Please get a new one from AI Studio." });
        }

      } catch (err: any) {
        lastErrorMessage = err.message;
        console.error(`💥 FETCH ERROR for ${m}:`, err);
      }
    }

    // If we reach here, all attempts failed
    return res.status(500).json({
      reply: `⚠️ All Gemini models failed to respond.`,
      error: lastErrorMessage,
      tip: "Please verify that 'Generative Language API' is enabled for your key in the Google AI Studio."
    });

  } catch (error: any) {
    console.error("🔥 CRITICAL HANDLER ERROR:", error);
    return res.status(500).json({ reply: "⚠️ Internal Server Error", error: error.message });
  }
}
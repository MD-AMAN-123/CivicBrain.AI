export default async function handler(req: any, res: any) {
  if (req.method !== "POST") return res.status(405).json({ reply: "Only POST allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message is required" });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ reply: "⚠️ GEMINI_API_KEY is missing." });
    }

    const payload = {
      contents: [{ role: "user", parts: [{ text: message }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
    };

    // Updated for 2026: Ultra-resilient fallback chain
    const attempts = [
      { v: "v1beta", m: "gemini-2.0-flash-exp" },
      { v: "v1beta", m: "gemini-2.0-flash" },
      { v: "v1beta", m: "gemini-1.5-flash" },
      { v: "v1beta", m: "gemini-1.5-flash-8b" },
      { v: "v1", m: "gemini-1.5-flash" },
      { v: "v1beta", m: "gemini-pro" } // Changed v1 to v1beta for better compatibility
    ];

    let lastError = "";

    for (const { v, m } of attempts) {
      try {
        console.log(`🚀 Trying model: ${m} (${v})`);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${v}/models/${m}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        const data = await response.json();

        if (response.ok) {
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            console.log(`✅ Success with ${m}`);
            return res.status(200).json({ reply: text });
          }
        }
        lastError = data.error?.message || "Unknown error";
        console.warn(`❌ Model ${m} failed: ${lastError}`);
      } catch (err: any) {
        lastError = err.message;
      }
    }

    return res.status(500).json({ reply: `⚠️ Gemini Error: ${lastError}` });

  } catch (error: any) {
    return res.status(500).json({ reply: "⚠️ Server error", error: error.message });
  }
}
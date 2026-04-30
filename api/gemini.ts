export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST allowed" });
  }

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "Message required" });

    const apiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!apiKey) {
      return res.status(500).json({ reply: "⚠️ GEMINI_API_KEY missing in Vercel settings." });
    }

    // List of model/version combinations to try in order of stability
    const attempts = [
      { version: "v1", model: "gemini-pro" },
      { version: "v1beta", model: "gemini-pro" },
      { version: "v1", model: "gemini-1.5-flash" },
      { version: "v1beta", model: "gemini-1.5-flash" }
    ];

    let lastError = "";

    for (const attempt of attempts) {
      try {
        console.log(`Trying ${attempt.model} on ${attempt.version}...`);
        
        const response = await fetch(
          `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: message }] }]
            })
          }
        );

        const data = await response.json();

        if (response.ok && data?.candidates?.[0]?.content?.parts?.[0]?.text) {
          console.log(`✅ Success with ${attempt.model} (${attempt.version})`);
          return res.status(200).json({ reply: data.candidates[0].content.parts[0].text });
        }

        lastError = data.error?.message || "Unknown error";
        console.warn(`Failed ${attempt.model} (${attempt.version}): ${lastError}`);
      } catch (err: any) {
        lastError = err.message;
        console.error(`Fetch error for ${attempt.model}:`, err);
      }
    }

    // If all fail
    return res.status(500).json({
      reply: `⚠️ All Gemini models failed. Last error: ${lastError}`,
      debug: "Try checking if your API key has 'Generative Language API' enabled in Google Cloud Console."
    });

  } catch (error: any) {
    return res.status(500).json({ reply: "⚠️ Server error", error: error.message });
  }
}
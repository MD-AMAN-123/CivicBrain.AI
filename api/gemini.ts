export default async function handler(req: any, res: any) {
  // 1. Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ reply: "Only POST requests allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: "⚠️ Message is required" });
    }

    // 2. Load and sanitize API key
    const rawKey = process.env.GEMINI_API_KEY;
    if (!rawKey) {
      console.error("❌ MISSING: GEMINI_API_KEY is not set in Vercel environment.");
      return res.status(500).json({
        reply: "⚠️ Server error: API key missing. Please set GEMINI_API_KEY in Vercel settings.",
      });
    }

    const apiKey = rawKey.trim();
    console.log(`✅ KEY DETECTED (Len: ${apiKey.length}): ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);

    // 3. Manual Fetch to Gemini REST API (v1beta)
    // Using manual fetch bypasses any potential SDK issues in the serverless environment
    console.log("🚀 Calling Gemini REST API (v1beta)...");
    
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("🔥 GEMINI API ERROR:", JSON.stringify(data));
      
      const errorMsg = data.error?.message || "Unknown API Error";
      const statusCode = geminiResponse.status;

      if (errorMsg.includes("API key not valid")) {
        return res.status(401).json({ reply: "⚠️ The API Key provided is invalid. Please get a fresh key from AI Studio." });
      }

      return res.status(statusCode).json({
        reply: `⚠️ AI Error (${statusCode}): ${errorMsg}`,
      });
    }

    // 4. Extract Text
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiText) {
      console.error("⚠️ EMPTY RESPONSE FROM GEMINI:", JSON.stringify(data));
      return res.status(200).json({
        reply: "⚠️ AI returned no content. Please try a different question.",
      });
    }

    console.log("✅ SUCCESS: Gemini responded successfully.");
    return res.status(200).json({ reply: aiText });

  } catch (error: any) {
    console.error("🔥 CRITICAL SERVER ERROR:", error);
    return res.status(500).json({
      reply: "⚠️ Connection failed. Check your Vercel logs or your API Key status.",
      error: error.message,
    });
  }
}
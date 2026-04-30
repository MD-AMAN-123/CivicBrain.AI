export default async function handler(req: any, res: any) {
  try {
    const { message } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ 
        reply: "⚠️ Gemini API Key is missing on the server. Please check your Vercel Environment Variables." 
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ 
        reply: `⚠️ Google API Error: ${data?.error?.message || "Unknown error"}` 
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      const finishReason = data?.candidates?.[0]?.finishReason;
      return res.status(200).json({ 
        reply: finishReason === "SAFETY" 
          ? "⚠️ Response blocked by safety filters." 
          : "⚠️ AI returned an empty response." 
      });
    }

    res.status(200).json({ reply: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      reply: "⚠️ Server error. Please try again.",
    });
  }
}

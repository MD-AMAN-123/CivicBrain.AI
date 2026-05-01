import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// API Route mirroring Vercel's api/gemini.ts
app.post('/api/gemini', async (req, res) => {
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
      { v: "v1beta", m: "gemini-2.5-flash" },
      { v: "v1beta", m: "gemini-flash-latest" },
      { v: "v1beta", m: "gemini-2.0-flash-lite" },
      { v: "v1beta", m: "gemini-2.0-flash" },
      { v: "v1beta", m: "gemini-pro-latest" },
      { v: "v1beta", m: "gemini-2.0-flash-001" }
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
      } catch (err) {
        lastError = err.message;
      }
    }

    return res.status(500).json({ reply: `⚠️ Gemini Error: ${lastError}` });

  } catch (error) {
    return res.status(500).json({ reply: "⚠️ Server error", error: error.message });
  }
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve React index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

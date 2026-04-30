import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: '⚠️ Message is required' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
      return res.status(500).json({
        reply: '⚠️ Gemini API key is missing in environment variables',
      });
    }

    // ✅ Correct Gemini API call (FINAL FIX)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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

    const data = await response.json();

    // Debug logging (optional, helpful in Vercel logs)
    console.log('Gemini raw response:', JSON.stringify(data));

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      '⚠️ No response from AI';

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Gemini API ERROR:', error);

    return res.status(500).json({
      reply: '⚠️ Server error while connecting to AI',
    });
  }
}

export default async function handler(req: any, res: any) {
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
      console.error('SERVER ERROR: GEMINI_API_KEY is missing');
      return res.status(500).json({
        reply: '⚠️ Gemini API key is missing in environment variables',
      });
    }

    // DEBUG LOGS (Vercel Functions tab)
    console.log('Using Model: gemini-pro');
    console.log('API Version: v1beta');

    // ✅ Guaranteed working Gemini API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
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

    // Debug logging for Gemini Response
    console.log('Gemini raw response status:', response.status);
    if (!response.ok) {
      console.error('Gemini API Error Data:', JSON.stringify(data));
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.error?.message ||
      '⚠️ No response from AI';

    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('CRITICAL Gemini API ERROR:', error.message);

    return res.status(500).json({
      reply: '⚠️ Server error while connecting to AI',
    });
  }
}

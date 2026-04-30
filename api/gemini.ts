import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Allow only POST
  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Method Not Allowed' });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ reply: '⚠️ Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Missing GEMINI_API_KEY');
      return res.status(500).json({
        reply: '⚠️ Server misconfigured: missing API key',
      });
    }

    // Initialize SDK
    const genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Use a stable model (works across accounts)
    const model = genAI.getGenerativeModel({
      model: 'gemini-pro',
    });

    console.log('Using Gemini model: gemini-pro');

    // Generate response
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return res.status(200).json({
        reply: '⚠️ AI returned an empty response.',
      });
    }

    return res.status(200).json({ reply: text });

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Helpful error handling
    if (error?.message?.includes('API key')) {
      return res.status(401).json({
        reply: '⚠️ Invalid API key. Check Vercel environment variables.',
      });
    }

    return res.status(500).json({
      reply: '⚠️ AI failed to respond. Please try again.',
    });
  }
}
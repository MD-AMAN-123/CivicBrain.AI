import { GoogleGenerativeAI } from '@google/generative-ai';

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

    // Initialize the SDK
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Use gemini-1.5-flash (most reliable/fastest)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log('Using @google/generative-ai SDK with gemini-1.5-flash');

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return res.status(200).json({ reply: '⚠️ AI returned an empty response.' });
    }

    return res.status(200).json({ reply: text });
  } catch (error: any) {
    console.error('Gemini SDK ERROR:', error.message);
    
    // Handle common errors
    if (error.message.includes('API key not valid')) {
      return res.status(401).json({ reply: '⚠️ Invalid API Key. Please check your Vercel settings.' });
    }
    if (error.message.includes('model not found')) {
      // Fallback to gemini-pro if flash fails
      try {
        console.log('Falling back to gemini-pro...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(req.body.message);
        const response = await result.response;
        return res.status(200).json({ reply: response.text() });
      } catch (fallbackError: any) {
        return res.status(500).json({ reply: `⚠️ Both models failed. Error: ${fallbackError.message}` });
      }
    }

    return res.status(500).json({
      reply: `⚠️ AI Error: ${error.message}`,
    });
  }
}

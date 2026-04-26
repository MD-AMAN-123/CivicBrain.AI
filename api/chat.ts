export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { topic, systemInstruction } = await req.json();
    
    // Support both the secure server-side name and the VITE_ prefixed name
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: { message: 'API Key not configured on Vercel. Please add GEMINI_API_KEY to your Vercel Environment Variables.' } 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Try multiple models and versions until one works
    const modelConfigs = [
      { model: 'gemini-1.5-flash', version: 'v1' },
      { model: 'gemini-1.5-flash', version: 'v1beta' },
      { model: 'gemini-pro', version: 'v1' },
      { model: 'gemini-1.5-pro', version: 'v1beta' }
    ];

    let lastError = null;

    for (const config of modelConfigs) {
      try {
        const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:streamGenerateContent?alt=sse&key=${apiKey}`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${topic}` }] }]
          })
        });

        if (response.ok) {
          return new Response(response.body, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        const errData = await response.json();
        lastError = errData.error?.message || `Status ${response.status}`;
        
        if (response.status === 404 || lastError.includes("not found")) {
          continue;
        }
        
        return new Response(JSON.stringify(errData), { 
          status: response.status,
          headers: { 'Content-Type': 'application/json' }
        });

      } catch (e: any) {
        lastError = e.message;
        continue;
      }
    }

    return new Response(JSON.stringify({ error: { message: lastError || 'All models failed' } }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: { message: error.message } }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

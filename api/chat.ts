export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { topic, systemInstruction } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: { message: 'API Key missing. Please set it in Vercel settings.' } }), { status: 500 });
    }

    // Comprehensive list of models and versions to try
    const configs = [
      { m: 'gemini-1.5-flash', v: 'v1beta' },
      { m: 'gemini-1.5-flash', v: 'v1' },
      { m: 'gemini-pro', v: 'v1' },
      { m: 'gemini-1.5-pro', v: 'v1beta' },
      { m: 'gemini-1.0-pro', v: 'v1' }
    ];

    let lastError = "";

    for (const conf of configs) {
      try {
        const url = `https://generativelanguage.googleapis.com/${conf.v}/models/${conf.m}:streamGenerateContent?alt=sse&key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Question: ${topic}` }] }]
          })
        });

        if (response.ok) {
          return new Response(response.body, {
            headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
          });
        }

        const err = await response.json();
        lastError = err.error?.message || `Status ${response.status}`;

        // If it's a 404 (not found), try the next config
        if (response.status === 404 || lastError.toLowerCase().includes("not found")) continue;

        // If it's a 401/403, the key is likely invalid or leaked
        if (response.status === 401 || response.status === 403) {
          return new Response(JSON.stringify({ error: { message: `INVALID API KEY: ${lastError}` } }), { status: response.status });
        }

      } catch (e: any) {
        lastError = e.message;
        continue;
      }
    }

    return new Response(JSON.stringify({ error: { message: `All models failed. Last error: ${lastError}` } }), { status: 500 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: { message: error.message } }), { status: 500 });
  }
}

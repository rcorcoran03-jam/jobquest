// JobQuest — Cloudflare Pages Function
// Path:  functions/api/claude.js
// Route: /api/claude  (POST)
//
// Deployment:
//   1. Place this file at functions/api/claude.js in the GitHub repo root.
//   2. In Cloudflare Pages → jobs.ryan-corcoran.com → Settings → Environment variables
//      add:  ANTHROPIC_API_KEY = sk-ant-...
//   3. Redeploy. Guests on jobs.ryan-corcoran.com will hit this proxy —
//      no client-side key needed.
//
// Key priority:
//   1. x-user-api-key header  (owner calls with their own key)
//   2. ANTHROPIC_API_KEY env  (guest calls — key lives on the server)

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await context.request.json();

    const apiKey = context.request.headers.get('x-user-api-key')
      || context.env.ANTHROPIC_API_KEY
      || '';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { message: 'API key not configured. Set ANTHROPIC_API_KEY in Cloudflare Pages environment variables.' } }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    const data = await resp.text();

    return new Response(data, {
      status: resp.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: { message: err.message } }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

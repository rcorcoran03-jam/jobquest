// Cloudflare Pages Function — proxies requests to Anthropic API
// File location: functions/api/claude.js → serves at /api/claude

export async function onRequestPost(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-user-api-key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  try {
    const body = await context.request.json();

    const apiKey = context.request.headers.get('x-user-api-key')
      || context.env.ANTHROPIC_API_KEY
      || '';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'No API key. Add it in the Excel sync tab.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-user-api-key',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    }
  });
}

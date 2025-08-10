import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!KIE_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server missing KIE_AI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // ignore
    }

    const prompt: string = (body?.prompt ?? '').toString();
    const model: string = (body?.model || 'veo3_fast').toString();
    const aspectRatio: string = (body?.aspectRatio || '9:16').toString();
    const enableFallback: boolean = Boolean(body?.enableFallback ?? false);

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = { model, aspectRatio, enableFallback, prompt };

    const res = await fetch('https://api.kie.ai/api/v1/veo/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || json?.code !== 200) {
      console.error('KIE VEO generate error:', res.status, json);
      return new Response(JSON.stringify({ error: json?.msg || 'KIE VEO generate failed', details: json }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const taskId = json?.data?.taskId;
    if (!taskId) {
      return new Response(JSON.stringify({ error: 'KIE VEO generate missing taskId' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ taskId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in kie-veo-generate:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

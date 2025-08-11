import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight
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
      // ignore empty body
    }

    const prompt: string = (body?.prompt ?? '').toString();
    const inputImage: string = (body?.inputImage || body?.input_image || body?.image_url || body?.imageUrl || '').toString();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!inputImage) {
      return new Response(JSON.stringify({ error: 'inputImage is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload: any = {
      prompt,
      inputImage,
    };

    console.log('4o Image generate payload:', { hasPrompt: !!prompt, hasInputImage: !!inputImage, inputImage });

    const res = await fetch('https://api.kie.ai/api/v1/gpt4o-image/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok || json?.code !== 200) {
      console.error('KIE 4o image generate error:', res.status, json);
      return new Response(JSON.stringify({ error: json?.msg || 'KIE 4o image generate failed', details: json }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const taskId = json?.data?.taskId;
    if (!taskId) {
      return new Response(JSON.stringify({ error: 'KIE 4o image generate missing taskId' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ taskId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in kie-4o-image-generate:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

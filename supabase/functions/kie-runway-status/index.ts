import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const KIE_API_KEY = Deno.env.get('KIE_AI_API_KEY');

serve(async (req) => {
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

    // Accept taskId via GET query or JSON body
    const url = new URL(req.url);
    let taskId = url.searchParams.get('taskId');

    if (!taskId) {
      try {
        const body = await req.json();
        taskId = body?.taskId?.toString();
      } catch {
        // ignore
      }
    }

    if (!taskId) {
      return new Response(JSON.stringify({ error: 'taskId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch(`https://api.kie.ai/api/v1/runway/record-detail?taskId=${encodeURIComponent(taskId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
      },
    });

    const json = await res.json();
    if (!res.ok || json?.code !== 200) {
      console.error('KIE status error:', res.status, json);
      return new Response(JSON.stringify({ error: json?.msg || 'KIE status failed', details: json }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = json?.data || {};
    const state: string = data?.state || 'pending';
    const videoUrl: string | null = data?.videoInfo?.videoUrl || null;

    return new Response(JSON.stringify({ state, videoUrl, raw: data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Error in kie-runway-status:', e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
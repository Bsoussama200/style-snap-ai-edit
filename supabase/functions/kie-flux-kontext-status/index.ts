import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const KIE_AI_API_KEY = Deno.env.get('KIE_AI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!KIE_AI_API_KEY) {
    console.error('KIE_AI_API_KEY is not set');
    return new Response(
      JSON.stringify({ error: 'KIE_AI_API_KEY is not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { taskId } = await req.json();

    if (!taskId) {
      return new Response(
        JSON.stringify({ error: 'Task ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Checking Kie AI Flux Kontext status for task:', taskId);

    const response = await fetch(`https://api.kie.ai/api/v1/flux/kontext/record-info?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
      },
    });

    const responseData = await response.json();
    console.log('Kie AI Flux Kontext status response:', responseData);

    if (!response.ok) {
      throw new Error(`Kie AI API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    if (responseData.code !== 200) {
      throw new Error(`Kie AI API error: ${responseData.msg || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify(responseData.data),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in kie-flux-kontext-status function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
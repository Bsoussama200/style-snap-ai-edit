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
    const { prompt, inputImage } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!inputImage) {
      return new Response(
        JSON.stringify({ error: 'Input image is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating image with Kie AI Flux Kontext:', { prompt, inputImage });

    const response = await fetch('https://api.kie.ai/api/v1/flux/kontext/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KIE_AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        aspectRatio: "9:16",
        outputFormat: "jpeg",
        promptUpsampling: false,
        model: "flux-kontext-max",
        safetyTolerance: 2,
        prompt: prompt,
        inputImage: inputImage
      }),
    });

    const responseData = await response.json();
    console.log('Kie AI Flux Kontext response:', responseData);

    if (!response.ok) {
      throw new Error(`Kie AI API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }

    if (responseData.code !== 200) {
      throw new Error(`Kie AI API error: ${responseData.msg || 'Unknown error'}`);
    }

    return new Response(
      JSON.stringify({ taskId: responseData.data.taskId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in kie-flux-kontext-generate function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
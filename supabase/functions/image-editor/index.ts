
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Parse form data from the request
    const formData = await req.formData();
    const image = formData.get('image') as File;
    const prompt = formData.get('prompt') as string;

    if (!image || !prompt) {
      return new Response(
        JSON.stringify({ error: 'Image and prompt are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Processing image edit request with prompt:', prompt);

    // Create FormData for OpenAI API call
    const openaiFormData = new FormData();
    openaiFormData.append('image', image);
    openaiFormData.append('prompt', prompt);
    openaiFormData.append('model', 'dall-e-2'); // Using dall-e-2 as it's more stable
    openaiFormData.append('n', '1');
    openaiFormData.append('size', '1024x1024');

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error:', errorData);
      throw new Error(errorData.error?.message || 'Failed to generate image');
    }

    const data = await response.json();
    console.log('OpenAI API response received successfully');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in image-editor function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

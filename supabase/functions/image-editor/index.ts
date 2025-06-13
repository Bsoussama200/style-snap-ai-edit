
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.52.7";

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

    // Initialize OpenAI client
    const client = new OpenAI({
      apiKey: openaiApiKey,
    });

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

    // Use the correct OpenAI images.edit method for JavaScript SDK
    const response = await client.images.edit({
      image: image,
      prompt: prompt,
      model: "dall-e-2", // Note: gpt-image-1 may not be available in JS SDK, using dall-e-2
      n: 1,
      size: "1024x1024",
    });

    console.log('OpenAI API response received successfully');

    if (response.data && response.data.length > 0) {
      // Return the image data in the expected format
      return new Response(JSON.stringify({ 
        data: response.data.map(item => ({
          url: item.url,
          b64_json: item.b64_json
        }))
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('No image data received from OpenAI');
    }

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

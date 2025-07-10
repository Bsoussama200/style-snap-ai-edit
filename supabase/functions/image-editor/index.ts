
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
    // Parse form data from the request
    const formData = await req.formData();
    const images = formData.getAll('image') as File[];
    const prompt = formData.get('prompt') as string;
    const apiKey = formData.get('apiKey') as string;

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one image is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing ${images.length} images with prompt:`, prompt);

    // Create FormData for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('model', 'gpt-image-1');
    openaiFormData.append('prompt', prompt);
    
    // Add all images to the form data
    for (let i = 0; i < images.length; i++) {
      openaiFormData.append('image[]', images[i]);
      console.log(`Added image ${i + 1}: ${images[i].name || 'unnamed'} (${images[i].size} bytes)`);
    }

    console.log('Sending request to OpenAI /images/edits endpoint...');

    // Call OpenAI's /images/edits endpoint using the provided API key
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (data && data.data && data.data.length > 0) {
      // Return the response in the same format as before for frontend compatibility
      return new Response(JSON.stringify({ 
        data: data.data.map(item => ({ 
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

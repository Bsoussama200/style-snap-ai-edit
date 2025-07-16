
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

    // Convert images to base64 for the new API format
    const imageContents = [];
    for (let i = 0; i < images.length; i++) {
      const imageBytes = await images[i].arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
      const mimeType = images[i].type || 'image/png';
      
      imageContents.push({
        type: "input_image",
        image_url: `data:${mimeType};base64,${base64Image}`
      });
      
      console.log(`Converted image ${i + 1}: ${images[i].name || 'unnamed'} (${images[i].size} bytes)`);
    }

    // Prepare the request body for the new gpt-image-1 format
    const requestBody = {
      model: "gpt-image-1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            ...imageContents
          ]
        }
      ],
      tools: [{ type: "image_generation", input_fidelity: "high" }],
      n: 1,
      size: "1024x1024"
    };

    console.log('Sending request to OpenAI /images/generations endpoint with high fidelity...');

    // Call OpenAI's /images/generations endpoint using the new format
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
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

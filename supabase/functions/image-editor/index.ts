
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

    // For multiple images with gpt-image-1, we need to use the /chat/completions endpoint
    if (images.length > 1) {
      const imageContents = [];
      for (let i = 0; i < images.length; i++) {
        const imageBytes = await images[i].arrayBuffer();
        const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
        const mimeType = images[i].type || 'image/png';
        
        imageContents.push({
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        });
        
        console.log(`Converted image ${i + 1}: ${images[i].name || 'unnamed'} (${images[i].size} bytes)`);
      }

      // Use chat completions endpoint for multiple images
      const requestBody = {
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...imageContents
            ]
          }
        ],
        max_tokens: 1000
      };

      console.log('Sending request to OpenAI /chat/completions endpoint for multiple images...');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      console.log('OpenAI chat response received successfully');

      // Return a text response for multi-image processing
      return new Response(JSON.stringify({ 
        content: data.choices[0].message.content
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // For single image, use the traditional /images/generations endpoint
      const imageBytes = await images[0].arrayBuffer();
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBytes)));
      
      console.log(`Converted single image: ${images[0].name || 'unnamed'} (${images[0].size} bytes)`);

      // Prepare the request body for single image generation
      const requestBody = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        response_format: "b64_json"
      };

      console.log('Sending request to OpenAI /images/generations endpoint...');

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

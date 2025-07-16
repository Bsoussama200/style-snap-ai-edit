
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

    // Convert all images to base64
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

    // First, analyze the image and get styling instructions using vision model
    const analysisPrompt = `Analyze the product in the provided image(s) and then generate a new styled image based on this request: "${prompt}". 

Please provide detailed instructions for generating a new image that transforms the background and styling while keeping the exact product unchanged. Focus on lighting, environment, and atmosphere changes only.`;

    const analysisRequestBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: analysisPrompt },
            ...imageContents
          ]
        }
      ],
      max_tokens: 500
    };

    console.log('Analyzing image with GPT-4o vision...');
    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(analysisRequestBody),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('OpenAI Analysis API error:', analysisResponse.status, errorText);
      throw new Error(`OpenAI Analysis API error: ${analysisResponse.status} - ${errorText}`);
    }

    const analysisData = await analysisResponse.json();
    const detailedPrompt = analysisData.choices[0].message.content;
    console.log('Analysis complete, generating image...');

    // Now generate the image using DALL-E 3 with the detailed prompt
    const imageGenerationBody = {
      model: "dall-e-3",
      prompt: detailedPrompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json"
    };

    console.log('Generating image with DALL-E 3...');
    const imageResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageGenerationBody),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('OpenAI Image Generation API error:', imageResponse.status, errorText);
      throw new Error(`OpenAI Image Generation API error: ${imageResponse.status} - ${errorText}`);
    }

    const imageData = await imageResponse.json();
    console.log('Image generation completed successfully');

    return new Response(JSON.stringify({ 
      data: imageData.data
    }), {
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

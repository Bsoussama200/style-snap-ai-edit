
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

    // Initialize OpenAI client (like Python's client = OpenAI())
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

    // Create file upload (like Python's create_file function)
    const fileUploadResponse = await client.files.create({
      file: image,
      purpose: "vision",
    });

    console.log('File uploaded with ID:', fileUploadResponse.id);

    // Call client.responses.create (matching Python pattern)
    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            {
              type: "input_image",
              file_id: fileUploadResponse.id,
            }
          ],
        }
      ],
      tools: [{ type: "image_generation" }],
    });

    console.log('OpenAI API response received successfully');

    // Extract image generation calls (like Python code)
    const imageGenerationCalls = response.output.filter(
      (output: any) => output.type === "image_generation_call"
    );

    const imageData = imageGenerationCalls.map((output: any) => output.result);

    if (imageData && imageData.length > 0) {
      // Return the base64 image data
      return new Response(JSON.stringify({ 
        data: [{ 
          b64_json: imageData[0] 
        }] 
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

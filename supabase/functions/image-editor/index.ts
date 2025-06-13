
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

    // Initialize OpenAI client (matching Python's client = OpenAI())
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

    // Create file upload (equivalent to Python's create_file function)
    const fileUploadResponse = await client.files.create({
      file: image,
      purpose: "vision",
    });

    console.log('File uploaded with ID:', fileUploadResponse.id);

    // Use chat completions with vision (equivalent to client.responses.create in Python)
    const response = await client.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o as it supports vision and tools
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.type};base64,${await convertFileToBase64(image)}`
              }
            }
          ],
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generate_image",
            description: "Generate an image based on the description",
            parameters: {
              type: "object",
              properties: {
                description: {
                  type: "string",
                  description: "Description of the image to generate"
                }
              },
              required: ["description"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    console.log('OpenAI chat completion response received');

    // Check if the model wants to call the image generation function
    const toolCalls = response.choices[0]?.message?.tool_calls;
    
    if (toolCalls && toolCalls.length > 0) {
      const imageGenCall = toolCalls.find(call => call.function.name === "generate_image");
      
      if (imageGenCall) {
        // Extract the description from the function call
        const functionArgs = JSON.parse(imageGenCall.function.arguments);
        const imageDescription = functionArgs.description || prompt;
        
        console.log('Generating image with description:', imageDescription);
        
        // Generate the image using DALL-E
        const imageResponse = await client.images.generate({
          model: "dall-e-3",
          prompt: imageDescription,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          response_format: "b64_json"
        });

        if (imageResponse.data && imageResponse.data.length > 0) {
          // Return the base64 image data (matching Python's image_data structure)
          return new Response(JSON.stringify({ 
            data: [{ 
              b64_json: imageResponse.data[0].b64_json 
            }] 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // If no tool call was made, return the text response
    const textResponse = response.choices[0]?.message?.content || "No response generated";
    return new Response(JSON.stringify({ 
      content: textResponse 
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

// Helper function to convert File to base64
async function convertFileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (!openAIApiKey) {
    console.error('OpenAI API key not configured');
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    console.log('Generate video prompts function called');
    const body = await req.json();
    const { productProfile, analysis, marketingAngles, targetAudiences } = body;

    if (!productProfile) {
      console.error('Product profile is missing');
      return new Response(
        JSON.stringify({ error: 'Product profile is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Generating video prompts for:', productProfile.productName);

    const systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a compelling story in sequence (like a mini ad campaign). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos - all communication should be through speech and visuals only.

Video 1: "The Hook" — A fast, visually striking attention-grabber that makes the viewer want to keep watching. Tease the problem without showing the product yet. Set referenceImage to false.

Video 2: "The Problem" — Show someone experiencing frustration or difficulty due to the ABSENCE of this product. Highlight the pain point that the product solves. Set referenceImage to false.

Video 3: "The Discovery" — Show someone discovering, trying, or using the product for the first time and having a positive reaction (the "aha moment"). Set referenceImage to true (product prominently featured). IMPORTANT: Use the reference image only to understand the product's appearance, but generate the scene described in the prompt, not the scene from the reference photo.

Video 4: "The Transformation" — Show how the product improves their life. Demonstrate ongoing benefits and a better lifestyle with the product. Set referenceImage to true (product shown in use). IMPORTANT: Use the reference image only to understand the product's appearance, but generate the scene described in the prompt, not the scene from the reference photo.

Video 5: "Product Showcase + VO" — Show ONLY the product (no person on screen) with dynamic camera movement around/toward the product. Use a voice-over narrator who speaks a concise, compelling line in a perfect American English accent that highlights the product's key benefit. Set referenceImage to true. IMPORTANT: Use the reference image only to understand the product's appearance, but generate the scene described in the prompt, not the scene from the reference photo.

Return your response strictly as a JSON array with exactly 5 objects, NO markdown, NO code fences, each following this exact structure:
{
  "sceneDurationSeconds": 8,
  "referenceImage": boolean,
  "person": {
    "name": "string (realistic first name or 'Narrator' for video 5)",
    "description": "string (for video 5, indicate voice-over narrator only; no on-screen person)",
    "actions": ["action1", "action2"],
    "line": "string (spoken dialogue; perfect American English accent)",
    "tone": "string (speaking tone that matches the scene emotion)",
    "speaker": true
  },
  "place": {
    "description": "string (detailed setting that supports the narrative; for video 5 describe a product-only scene/stage)"
  },
  "additionalInstructions": {
    "cameraMovement": "string (camera technique that enhances the story)",
    "lighting": "string (lighting that matches the mood)",
    "backgroundMusic": "string (music style that supports the emotion)"
  }
}

Make the sequence emotionally compelling:
- Video 1: Punchy hook, dynamic motion/edits, tease the pain point, referenceImage: false
- Video 2: Frustrated/concerned tone, darker lighting, problems-focused camera work, referenceImage: false
- Video 3: Curious/excited tone, brighter lighting, discovery-focused camera movement, referenceImage: true
- Video 4: Confident/happy tone, warm lighting, celebration-focused cinematography, referenceImage: true
- Video 5: Clear narrator delivery (perfect American English accent), product-only visuals with dynamic camera movement (360° rotation, dolly in/out, or dramatic angles), studio/hero-lighting, referenceImage: true

Ensure each spoken line advances the narrative and feels natural for that stage of the customer journey.`;

    const userPrompt = `Product: ${productProfile.productName}
Category: ${productProfile.category || 'Unknown'}
Features: ${productProfile.features?.join(', ') || 'None specified'}
Materials: ${productProfile.materials?.join(', ') || 'None specified'}
Colors: ${productProfile.colors?.join(', ') || 'None specified'}
Emotional Appeal: ${productProfile.emotionalAppeal?.join(', ') || 'None specified'}
Trend Fit: ${productProfile.trendFit || 'Not specified'}

Marketing Angles: ${marketingAngles?.join(', ') || 'None specified'}
Target Audiences: ${targetAudiences?.join(', ') || 'None specified'}

Analysis: ${analysis || 'No additional analysis provided'}

Create 5 distinct video prompts that showcase this product effectively for marketing purposes. Also ensure all spoken dialogue uses a perfect American English accent.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content from OpenAI:', generatedContent);

    // Parse the JSON response
    let videoPrompts;
    try {
      videoPrompts = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = generatedContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        videoPrompts = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error('Invalid JSON response from OpenAI');
      }
    }

    // Validate that we have exactly 5 prompts
    if (!Array.isArray(videoPrompts) || videoPrompts.length !== 5) {
      console.error('Invalid number of prompts:', videoPrompts?.length);
      throw new Error('Expected exactly 5 video prompts');
    }

    // Validate structure of each prompt
    for (let i = 0; i < videoPrompts.length; i++) {
      const prompt = videoPrompts[i];
      if (!prompt.person || !prompt.place || !prompt.additionalInstructions) {
        console.error(`Invalid prompt structure at index ${i}:`, prompt);
        throw new Error(`Invalid prompt structure at index ${i}`);
      }
    }

    console.log('Successfully generated and validated 5 video prompts');

    return new Response(
      JSON.stringify({ videoPrompts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-video-prompts function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
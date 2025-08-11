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

Generate exactly 3 video prompts that tell a compelling story in sequence - like a mini ad campaign:

**Video 1: "The Problem"** - Show someone experiencing frustration or difficulty due to the ABSENCE of this product. This should highlight the pain point that the product solves. Set referenceImage to false as the product is not shown.

**Video 2: "The Discovery"** - Show someone discovering, trying, or using the product for the first time and having a positive reaction. Capture the "aha moment" and initial satisfaction. Set referenceImage to true as the product should be prominently featured.

**Video 3: "The Transformation"** - Show how the product has improved their life. This should demonstrate the ongoing benefits and the person's new, better lifestyle with the product. Set referenceImage to true as the product should be shown in use.

Return your response as a JSON array with exactly 3 objects, each following this exact structure:
{
  "sceneDurationSeconds": 8,
  "referenceImage": boolean (true if product is shown in video, false if not),
  "person": {
    "name": "string (realistic first name)",
    "description": "string (detailed physical appearance and clothing)",
    "actions": ["action1", "action2"],
    "line": "string (spoken dialogue that fits the sequence narrative)",
    "tone": "string (speaking tone that matches the scene emotion)",
    "speaker": true
  },
  "place": {
    "description": "string (detailed setting description that supports the narrative)"
  },
  "additionalInstructions": {
    "cameraMovement": "string (camera technique that enhances the story)",
    "lighting": "string (lighting that matches the mood)",
    "backgroundMusic": "string (music style that supports the emotion)"
  }
}

Make the sequence emotionally compelling:
- Video 1: Frustrated/concerned tone, darker lighting, problems-focused camera work, referenceImage: false
- Video 2: Curious/excited tone, brighter lighting, discovery-focused camera movement, referenceImage: true
- Video 3: Confident/happy tone, warm lighting, celebration-focused cinematography, referenceImage: true

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

Create 3 distinct video prompts that showcase this product effectively for marketing purposes.`;

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

    // Validate that we have exactly 3 prompts
    if (!Array.isArray(videoPrompts) || videoPrompts.length !== 3) {
      console.error('Invalid number of prompts:', videoPrompts?.length);
      throw new Error('Expected exactly 3 video prompts');
    }

    // Validate structure of each prompt
    for (let i = 0; i < videoPrompts.length; i++) {
      const prompt = videoPrompts[i];
      if (!prompt.person || !prompt.place || !prompt.additionalInstructions) {
        console.error(`Invalid prompt structure at index ${i}:`, prompt);
        throw new Error(`Invalid prompt structure at index ${i}`);
      }
    }

    console.log('Successfully generated and validated 3 video prompts');

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
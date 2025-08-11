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
    return new Response(
      JSON.stringify({ error: 'OpenAI API key not configured' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const { productProfile, analysis, marketingAngles, targetAudiences } = await req.json();

    if (!productProfile) {
      return new Response(
        JSON.stringify({ error: 'Product profile is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for product marketing. 

Generate exactly 3 unique video prompts for the given product. Each prompt should target different marketing angles and appeal to different aspects of the product.

Return your response as a JSON array with exactly 3 objects, each following this exact structure:
{
  "sceneDurationSeconds": 8,
  "person": {
    "name": "string (realistic first name)",
    "description": "string (detailed physical appearance and clothing)",
    "actions": ["action1", "action2"],
    "line": "string (spoken dialogue related to product)",
    "tone": "string (speaking tone)",
    "speaker": true
  },
  "place": {
    "description": "string (detailed setting description)"
  },
  "additionalInstructions": {
    "cameraMovement": "string (camera technique)",
    "lighting": "string (lighting setup)",
    "backgroundMusic": "string (music style)"
  }
}

Make each prompt unique by varying:
- Different personas (age, style, profession)
- Different settings (home, office, outdoor, studio)
- Different marketing angles (lifestyle, professional, emotional)
- Different camera techniques and lighting

Ensure the spoken lines are natural, engaging, and directly relate to the product's benefits.`;

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

    console.log('Generating video prompts for product:', productProfile.productName);

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

    console.log('Generated content:', generatedContent);

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
      throw new Error('Expected exactly 3 video prompts');
    }

    // Validate structure of each prompt
    for (const prompt of videoPrompts) {
      if (!prompt.person || !prompt.place || !prompt.additionalInstructions) {
        throw new Error('Invalid prompt structure');
      }
    }

    console.log('Successfully generated 3 video prompts');

    return new Response(
      JSON.stringify({ videoPrompts }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in generate-video-prompts function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
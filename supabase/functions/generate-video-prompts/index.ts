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
    const { productProfile, analysis, marketingAngles, targetAudiences, videoStyle } = body;
    
    console.log('Video style received:', videoStyle);

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

    let systemPrompt = '';
    
    if (videoStyle === 'aspiration-cinematic') {
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a cinematic, aspirational story in sequence (like a mini brand film). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos — all communication should be through speech and visuals only.

The story must focus on evoking emotions, building brand lifestyle appeal, and creating a strong desire for the product, without explicitly focusing on a problem.

Video 1: "The Spark" — An atmospheric, visually rich opener. Show the moment of inspiration or an intriguing scenario where the viewer is drawn into the lifestyle or feeling associated with the product. No product shown yet. Set referenceImage to false.

Video 2: "The Journey Begins" — Show characters in motion, moving toward a goal, dream, or experience. Subtly hint at the product's world (color palette, props, setting) without revealing it. Dialogue should build curiosity. Set referenceImage to false.

Video 3: "The Encounter" — The first time the product is seen, but not yet explained. Make it feel like a natural part of this aspirational lifestyle. Set referenceImage to true. CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification — create an entirely new scene as described in your prompt. MUST include startingScene describing the initial scene/setting for product placement.

Video 4: "Living the Dream" — Show characters fully immersed in their elevated lifestyle with the product seamlessly integrated. Focus on emotions, confidence, and aspirational visuals. Set referenceImage to true. CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification — create an entirely new scene as described in your prompt. MUST include startingScene.

Video 5: "The Brand Statement" — End with ONLY the product (no people) in a cinematic showcase scene. Use dynamic camera work and a short, poetic voice-over line that conveys the essence of the brand. Set referenceImage to true. CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification — create an entirely new scene as described in your prompt. MUST include startingScene.`;
    } else if (videoStyle === 'street-interview') {
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a story in sequence in the style of casual, fast-paced street interviews (like viral YouTube or TikTok clips). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos — all communication should be through speech and visuals only.

The product must NOT be shown in Videos 1–4, and will only appear in Video 5.

Video 1: "First Question" — Focus on the INTERVIEWER (with microphone or camera) walking up to a random person in an urban or busy outdoor location and asking them an intriguing, lifestyle-related question that hooks the viewer (e.g., "What's one thing you wish you had right now to make your day better?"). The interviewer should be the main speaking person in this video. Set referenceImage to false.

Video 2: "More Voices" — Focus on the INTERVIEWEES (different people) giving varied, relatable, or funny answers to the interviewer's questions. Quick cuts between different interviewees responding. The interviewees should be the main speaking persons in this video. Set referenceImage to false.

Video 3: "The Curious Build-Up" — Focus on the INTERVIEWER asking follow-up questions as interviewees start giving answers that hint toward the product's category or benefit without naming it directly. Show the interviewer getting more curious and asking probing questions. The interviewer should be the main speaking person in this video. Set referenceImage to false.

Video 4: "The Big Hint" — Focus on an INTERVIEWEE giving an answer that heavily foreshadows the product's key feature, creating anticipation. Show this person's enthusiastic response while the interviewer reacts in the background. The interviewee should be the main speaking person in this video. Set referenceImage to false.

Video 5: "The Reveal" — Show ONLY the product, on its own, in a crisp, dynamic product showcase scene. Use a short, punchy voice-over line from the INTERVIEWER that connects all the previous answers to the product's benefit (e.g., "Looks like we found your answer."). Set referenceImage to false. Create an entirely new scene as described in your prompt. MUST include startingScene field describing the initial scene/setting for product placement.`;
    } else {
      // Default to problem-solution style
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a compelling story in sequence (like a mini ad campaign). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos - all communication should be through speech and visuals only.

Video 1: "The Hook" — A fast, visually striking attention-grabber that makes the viewer want to keep watching. Tease the problem without showing the product yet. Set referenceImage to false.

Video 2: "The Problem" — Show someone experiencing frustration or difficulty due to the ABSENCE of this product. Highlight the pain point that the product solves. Set referenceImage to false.

Video 3: "The Discovery" — Show someone discovering, trying, or using the product for the first time and having a positive reaction (the "aha moment"). Set referenceImage to true (product prominently featured). CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification - create an entirely new scene as described in your prompt. MUST include "startingScene" field describing the initial scene/setting for product placement.

Video 4: "The Transformation" — Show how the product improves their life. Demonstrate ongoing benefits and a better lifestyle with the product. Set referenceImage to true (product shown in use). CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification - create an entirely new scene as described in your prompt. MUST include "startingScene" field describing the initial scene/setting for product placement.

Video 5: "Product Showcase + VO" — Show ONLY the product (no person on screen) with dynamic camera movement around/toward the product. Use a voice-over narrator who speaks a concise, compelling line in a perfect American English accent that highlights the product's key benefit. Set referenceImage to true. CRITICAL: DO NOT recreate the reference photo's scene, background, or setting. The reference image is ONLY for product identification - create an entirely new scene as described in your prompt. MUST include "startingScene" field describing the initial scene/setting for product placement.`;
    }

    systemPrompt += `

Return your response strictly as a JSON array with exactly 5 objects, NO markdown, NO code fences, each following this exact structure:
{
  "sceneDurationSeconds": 8,
  "referenceImage": boolean,
  "startingScene": "string (ONLY include if referenceImage is true - describe the scene/setting where the product should be placed to generate the reference image from the uploaded photo)",
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

For videos where referenceImage is true, you MUST include a "startingScene" field that describes the scene/setting where the product should be placed. This will be used to generate a reference image by placing the uploaded product into this described scene before video generation begins.

MANDATORY REQUIREMENTS - FOLLOW THE SPECIFIC STYLE REQUIREMENTS:

For problem-solution style:
- Videos 1 & 2: referenceImage: false, NO startingScene field
- Videos 3, 4 & 5: referenceImage: true, MUST include startingScene field with detailed scene description

For aspiration-cinematic style:
- Videos 1 & 2: referenceImage: false, NO startingScene field
- Videos 3, 4 & 5: referenceImage: true, MUST include startingScene field with detailed scene description

For street-interview style:
- Videos 1, 2, 3 & 4: referenceImage: false, NO startingScene field (product not shown)
- Video 5 ONLY: referenceImage: true, MUST include startingScene field for product showcase

Make the sequence emotionally compelling based on the selected style.

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

    // Enforce style-specific referenceImage rules to prevent model drift
    try {
      if (videoStyle === 'street-interview') {
        // Videos 1-4: no product, no startingScene
        for (let i = 0; i < 4; i++) {
          if (videoPrompts[i]) {
            videoPrompts[i].referenceImage = false;
            if (typeof videoPrompts[i].startingScene !== 'undefined') {
              delete (videoPrompts[i] as any).startingScene;
            }
          }
        }
        // Video 5: product-only with startingScene
        if (videoPrompts[4]) {
          videoPrompts[4].referenceImage = true;
          const defaultScene = `A crisp, cinematic product-only showcase set: seamless background, soft rim lighting, gentle 360° turntable feel. The product "${productProfile?.productName || 'the product'}" sits centered on a pedestal. Camera performs slow dolly-in and rotating hero angles.`;
          if (!videoPrompts[4].startingScene || typeof videoPrompts[4].startingScene !== 'string' || !videoPrompts[4].startingScene.trim()) {
            (videoPrompts[4] as any).startingScene = defaultScene;
          }
        }
      }
    } catch (safetyError) {
      console.warn('Post-processing enforcement failed:', safetyError);
    }

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
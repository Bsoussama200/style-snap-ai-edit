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
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { product, marketing, videoStyle } = body;

    console.log('Generating video prompts for:', { 
      productName: product?.name, 
      category: product?.category, 
      style: videoStyle 
    });

    let systemPrompt: string;

    if (videoStyle === 'aspiration-cinematic') {
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a compelling, aspirational story in a cinematic style. IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos — all communication should be through speech and visuals only.

Video 1: "Dream State" — Open with an aspirational mood-setting scene (elegant environments, lifestyle moments). Tease the elevated lifestyle without showing the product yet. Set referenceImage to false.

Video 2: "Aspiration Building" — Continue building the aspirational world, showing characters living their best life or pursuing goals, but still missing something to complete their vision. Set referenceImage to false.

Video 3: "The Encounter" — The first time the product is seen, but not yet explained. Make it feel like a natural part of this aspirational lifestyle. Set referenceImage to true. MUST include startingScene describing the initial scene/setting for product placement.

Video 4: "Living the Dream" — Show characters fully immersed in their elevated lifestyle with the product seamlessly integrated. Focus on emotions, confidence, and aspirational visuals. Set referenceImage to true. MUST include startingScene.

Video 5: "The Brand Statement" — End with ONLY the product (no people) in a cinematic showcase scene. Use dynamic camera work and longer, more engaging voice-over lines that convey the essence of the brand (avoid too much silence). Set referenceImage to true. MUST include startingScene.`;
    } else if (videoStyle === 'street-interview') {
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a story in sequence in the style of casual, fast-paced street interviews (like viral YouTube or TikTok clips). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos — all communication should be through speech and visuals only.

The product must NOT be shown in Videos 1–4, and will only appear in Video 5.

Video 1: "First Question" — Focus on the INTERVIEWER (with microphone or camera) walking up to a random person in an urban or busy outdoor location and asking them an intriguing, lifestyle-related question that hooks the viewer (e.g., "What's one thing you wish you had right now to make your day better?"). The interviewer should be the main speaking person in this video. Set referenceImage to false.

Video 2: "More Voices" — Focus on the INTERVIEWEES (different people) giving varied, relatable, or funny answers to the interviewer's questions. Quick cuts between different interviewees responding. The interviewees should be the main speaking persons in this video. Set referenceImage to false.

Video 3: "The Curious Build-Up" — Focus on the INTERVIEWER asking follow-up questions as interviewees start giving answers that hint toward the product's category or benefit without naming it directly. Show the interviewer getting more curious and asking probing questions. The interviewer should be the main speaking person in this video. Set referenceImage to false.

Video 4: "The Big Hint" — Focus on an INTERVIEWEE giving an answer that heavily foreshadows the product's key feature, creating anticipation. Show this person's enthusiastic response while the interviewer reacts in the background. The interviewee should be the main speaking person in this video. Set referenceImage to false.

Video 5: "The Reveal" — Show ONLY the product, on its own, in a crisp, dynamic product showcase scene. Use engaging, longer voice-over lines from the INTERVIEWER that connect all the previous answers to the product's benefit and avoid too much silence (e.g., "Looks like we found your answer. This is exactly what everyone's been looking for."). Set referenceImage to true. MUST include startingScene field describing the initial scene/setting for product placement.`;
    } else {
      // Default to problem-solution style
      systemPrompt = `You are a professional video marketing specialist creating VEO3 video prompts for a creative ad sequence.

Generate exactly 5 video prompts that tell a compelling story in sequence (like a mini ad campaign). IMPORTANT: All spoken dialogue must be delivered in a perfect American English accent. CRITICAL: Do not include any captions, text overlays, or written text in the videos - all communication should be through speech and visuals only.

Video 1: "The Hook" — A fast, visually striking attention-grabber that makes the viewer want to keep watching. Tease the problem without showing the product yet. Set referenceImage to false.

Video 2: "The Problem" — Show someone experiencing frustration or difficulty due to the ABSENCE of this product. Highlight the pain point that the product solves. Set referenceImage to false.

Video 3: "The Discovery" — Show someone discovering, trying, or using the product for the first time and having a positive reaction (the "aha moment"). Set referenceImage to true (product prominently featured). MUST include "startingScene" field describing the initial scene/setting for product placement.

Video 4: "The Transformation" — Show how the product improves their life. Demonstrate ongoing benefits and a better lifestyle with the product. Set referenceImage to true (product shown in use). MUST include "startingScene" field describing the initial scene/setting for product placement.

Video 5: "Product Showcase + VO" — Show ONLY the product (no person on screen) with dynamic camera movement around/toward the product. Use a voice-over narrator who speaks longer, more engaging lines in a perfect American English accent that highlight the product's key benefit and avoid too much silence. Set referenceImage to true. MUST include "startingScene" field describing the initial scene/setting for product placement.`;
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

CRITICAL RULES:
1. For videos with referenceImage: false, do NOT include startingScene field
2. For videos with referenceImage: true, ALWAYS include startingScene field
3. For street-interview style, only Video 5 should have referenceImage: true
4. All video prompts should create engaging, dynamic content with appropriate voice-over length
5. Avoid overly short dialogue that results in too much silence
6. Make sure voice-over lines are substantial enough to fill the 8-second scenes`;

    const userPrompt = `Product Details:
Name: ${product?.name || 'Unknown Product'}
Category: ${product?.category || 'General'}
Description: ${product?.description || 'No description provided'}
Key Features: ${product?.keyFeatures?.join(', ') || 'None specified'}
Benefits: ${product?.benefits?.join(', ') || 'None specified'}
Target Audiences: ${product?.targetAudiences?.join(', ') || 'General audience'}

Marketing Details:
${marketing?.tone ? `Tone: ${marketing.tone}` : ''}
${marketing?.style ? `Style: ${marketing.style}` : ''}
${marketing?.targetAudience ? `Target Audience: ${marketing.targetAudience}` : ''}
${marketing?.keyMessage ? `Key Message: ${marketing.keyMessage}` : ''}
${marketing?.callToAction ? `Call to Action: ${marketing.callToAction}` : ''}

Create 5 video prompts following the ${videoStyle || 'problem-solution'} format described above.`;

    console.log('Calling OpenAI with system prompt length:', systemPrompt.length);
    console.log('User prompt preview:', userPrompt.substring(0, 200) + '...');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openAIResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received');

    if (!openAIData.choices?.[0]?.message?.content) {
      console.error('Invalid OpenAI response structure');
      return new Response(
        JSON.stringify({ error: 'Invalid response from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = openAIData.choices[0].message.content.trim();
    console.log('OpenAI content preview:', content.substring(0, 200) + '...');

    // Parse and validate the JSON response
    let videoPrompts;
    try {
      videoPrompts = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI JSON response:', parseError);
      console.error('Raw content:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse video prompts from OpenAI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure
    if (!Array.isArray(videoPrompts) || videoPrompts.length !== 5) {
      console.error('Invalid video prompts structure - not array of 5 items');
      return new Response(
        JSON.stringify({ error: 'Invalid video prompts structure' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Post-process to enforce style-specific rules and prevent model drift
    videoPrompts.forEach((prompt, index) => {
      console.log(`Processing video ${index + 1}:`, {
        referenceImage: prompt.referenceImage,
        hasStartingScene: !!prompt.startingScene,
        style: videoStyle
      });

      // For street-interview style, only Video 5 should have referenceImage: true
      if (videoStyle === 'street-interview') {
        if (index < 4) {
          prompt.referenceImage = false;
          delete prompt.startingScene; // Remove if accidentally added
        } else if (index === 4) {
          prompt.referenceImage = true;
          if (!prompt.startingScene) {
            prompt.startingScene = `Professional product showcase environment with elegant lighting setup`;
          }
        }
      }

      // For all styles: enforce startingScene rules
      if (prompt.referenceImage && !prompt.startingScene) {
        prompt.startingScene = `Cinematic product placement scene with professional lighting`;
      } else if (!prompt.referenceImage && prompt.startingScene) {
        delete prompt.startingScene;
      }
    });

    console.log('Video prompts generated successfully');
    return new Response(
      JSON.stringify({ videoPrompts }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-video-prompts function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
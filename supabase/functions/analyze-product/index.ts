import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: 'Server missing OPENAI_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: 'Server missing Supabase configuration' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formData = await req.formData();
    const imageUrl = (formData.get('image_url') as string | null) || null;
    const productName = (formData.get('productName') as string | null) || null;
    const mode = (formData.get('mode') as string | null) || 'analysis';
    const optionsContext = (formData.get('options_context') as string | null) || null;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'image_url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'motion') {
      // Build system prompt based on whether we have options context
      const systemPrompt = optionsContext 
        ? `You are an AI video prompt generator. Based on the provided image and specific user requirements, create a concise, production-ready prompt for animating this still image into a 5-second portrait 9:16 video. The user has specified particular camera movements and visual effects they want. Incorporate their requirements naturally into a cohesive motion prompt. Return JSON strictly as {"prompt": string} (<= 220 chars). No extra text.`
        : `You craft short, production-ready prompts to animate a still image into a simple 5-second portrait 9:16 video with tasteful camera motion (e.g., slow dolly-in, parallax, slight rack focus) and subtle effects (e.g., soft glow, vignette). Return JSON strictly as {"prompt": string} (<= 220 chars). No extra text.`;

      const userPrompt = optionsContext 
        ? `User requirements: ${optionsContext}\n\nGenerate a motion prompt for 5 sec, 720x1280, 9:16 that incorporates these specific requirements.`
        : 'Generate a short motion/effects prompt for 5 sec, 720x1280, 9:16.';

      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userPrompt },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        temperature: 0.4
      } as const;

      const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
      });

      if (!aiRes.ok) {
        const txt = await aiRes.text();
        console.error('OpenAI motion prompt error', aiRes.status, txt);
        return new Response(JSON.stringify({ error: 'Failed to generate motion prompt' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const aiData = await aiRes.json();
      const content: string = aiData.choices?.[0]?.message?.content || '{}';
      let prompt = '';
      try {
        prompt = JSON.parse(content).prompt || '';
      } catch {
        prompt = content.slice(0, 220);
      }

      return new Response(JSON.stringify({ prompt }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!productName || !productName.trim()) {
      return new Response(JSON.stringify({ error: 'Product name is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Read categories from DB
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name');

    if (catError) {
      console.error('Error fetching categories:', catError);
      return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a product analyst AI. Analyze the product image and the provided product name.\nReturn a concise analysis covering: key visual features, materials, primary use case, target audience, and notable selling points.\nFrom the provided categories, select the single best matching category ID. Output strict JSON only (no markdown, no code fences) with keys:\n{\n  "analysis": string,\n  "suggested_category_id": string,\n  "confidence": number // 0-1\n}\nMake sure suggested_category_id is one of the provided IDs.`;

    const categoriesSummary = (categories || [])
      .map((c: any) => `- ${c.id} | ${c.name}${c.description ? `: ${c.description}` : ''}`)
      .join('\n');
    const categoriesJson = JSON.stringify((categories || []).map((c: any) => ({ id: c.id, name: c.name, description: c.description })));

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Product name: ${productName}\n\nAvailable categories (ID | Name: Description):\n${categoriesSummary}\n\nAvailable categories JSON (id,name,description):\n${categoriesJson}\n\nReturn JSON only.` },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.2
    } as const;

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error('OpenAI analyze error', aiRes.status, txt);
      return new Response(JSON.stringify({ error: 'Failed to analyze product' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiRes.json();
    const rawContent: string = aiData.choices?.[0]?.message?.content || '';

    // Sanitize potential code fences and extract JSON
    let content = rawContent.trim();
    const fenceMatch = content.match(/```[a-zA-Z]*\n([\s\S]*?)```/);
    if (fenceMatch) {
      content = fenceMatch[1].trim();
    }
    if (content.startsWith('json')) {
      content = content.slice(4).trim();
    }
    // If still contains surrounding text, try to isolate first {...}
    if (!(content.startsWith('{') && content.endsWith('}'))) {
      const first = content.indexOf('{');
      const last = content.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        content = content.slice(first, last + 1).trim();
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse JSON from AI, content:', rawContent);
      parsed = {};
    }

    // Build safe response
    const safeAnalysis = typeof parsed.analysis === 'string' && parsed.analysis.trim().length > 0
      ? parsed.analysis.trim()
      : 'Analysis unavailable.';

    let suggestedId: string | null = typeof parsed.suggested_category_id === 'string' ? parsed.suggested_category_id : null;
    // Ensure it exists; otherwise leave null
    if (!suggestedId || !(categories || []).some((c: any) => c.id === suggestedId)) {
      suggestedId = (categories || [])[0]?.id || null;
    }

    const confidence = typeof parsed.confidence === 'number' ? parsed.confidence : null;

    const suggested = (categories || []).find((c: any) => c.id === suggestedId) || null;

    return new Response(
      JSON.stringify({
        analysis: safeAnalysis,
        suggestedCategoryId: suggestedId,
        suggestedCategoryName: suggested?.name || null,
        confidence,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-product function:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

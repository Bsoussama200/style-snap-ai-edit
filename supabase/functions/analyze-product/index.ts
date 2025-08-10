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

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'image_url is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (mode === 'motion') {
      const body = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You craft short, production-ready prompts to animate a still image into a simple 5-second portrait 9:16 video with tasteful camera motion (e.g., slow dolly-in, parallax, slight rack focus) and subtle effects (e.g., soft glow, vignette). Return JSON strictly as {"prompt": string} (<= 220 chars). No extra text.' },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Generate a short motion/effects prompt for 5 sec, 720x1280, 9:16.' },
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

    const systemPrompt = `You are a product analyst AI. Analyze the product image and the provided product name.
Return a concise analysis covering: key visual features, materials, primary use case, target audience, and notable selling points.
From the provided categories, select the single best matching category ID. Output strict JSON only with keys:
{
  "analysis": string,
  "suggested_category_id": string,
  "confidence": number // 0-1
}
Make sure suggested_category_id is one of the provided IDs.`;

    const categoriesSummary = (categories || [])
      .map((c: any) => `- ${c.id} | ${c.name}${c.description ? `: ${c.description}` : ''}`)
      .join('\n');

    const body = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: `Product name: ${productName}\n\nAvailable categories (ID | Name: Description):\n${categoriesSummary}\n\nReturn JSON only.` },
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
    const content: string = aiData.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.warn('Failed to parse JSON from AI, content:', content);
      // Fallback
      parsed = {
        analysis: content?.slice(0, 800) || 'No analysis available',
        suggested_category_id: categories?.[0]?.id || null,
        confidence: 0.5,
      };
    }

    const suggested = (categories || []).find((c: any) => c.id === parsed.suggested_category_id) || null;

    return new Response(
      JSON.stringify({
        analysis: parsed.analysis,
        suggestedCategoryId: parsed.suggested_category_id,
        suggestedCategoryName: suggested?.name || null,
        confidence: parsed.confidence ?? null,
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

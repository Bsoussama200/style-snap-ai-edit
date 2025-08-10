import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('Server missing OPENAI_API_KEY')
    }

    const form = await req.formData()
    const image = form.get('image') as File | null
    const duration = Number(form.get('durationSeconds') || 5)
    const width = Number(form.get('width') || 720)
    const height = Number(form.get('height') || 1280)

    if (!image) {
      return new Response(JSON.stringify({ error: 'Image is required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Server missing Supabase configuration')
    }

    // Upload the image to public storage to obtain a URL compatible with Replicate
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const path = `tmp/${crypto.randomUUID()}.${(image.type?.split('/')[1]) || 'png'}`

    const uploadRes = await supabase.storage.from('style-images').upload(path, image, {
      contentType: image.type || 'image/png',
      upsert: true,
    })

    if (uploadRes.error) {
      console.error('Storage upload error:', uploadRes.error)
      return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const { data: pub } = supabase.storage.from('style-images').getPublicUrl(path)
    const imageUrl = pub.publicUrl

    // Step 1: Create a concise motion/effects prompt based on the generated image
    const promptBody = {
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You craft short, production-ready prompts to animate a still image into a simple 5-second portrait 9:16 video with tasteful camera motion (e.g., slow dolly-in, parallax, slight rack focus) and subtle effects (e.g., soft glow, vignette). Return JSON: {"prompt": string} with a single concise prompt (max 220 chars). No extra text.' },
        { role: 'user', content: [
          { type: 'text', text: 'Generate a short motion/effects prompt for 5 sec, 720x1280, 9:16.' },
          { type: 'image_url', image_url: { url: imageUrl } }
        ] }
      ],
      temperature: 0.4
    } as const

    const promptRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(promptBody)
    })

    if (!promptRes.ok) {
      const t = await promptRes.text()
      console.error('Prompt generation error:', t)
      throw new Error('Failed to generate motion prompt')
    }

    const promptJson = await promptRes.json()
    const content: string = promptJson.choices?.[0]?.message?.content || '{}'
    let motion = ''
    try {
      motion = JSON.parse(content).prompt || ''
    } catch {
      motion = content.slice(0, 220)
    }

    if (!REPLICATE_API_KEY) {
      return new Response(JSON.stringify({
        error: 'Server missing REPLICATE_API_KEY',
        motionPrompt: motion,
        imageUrl,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const replicate = new Replicate({ auth: REPLICATE_API_KEY })

    // Attempt using Stable Video Diffusion (img2vid-xt) model
    // Note: Models and params may evolve; we log responses for debugging.
    const model = 'stability-ai/stable-video-diffusion-img2vid-xt'

    const fps = 24
    const numFrames = Math.min(Math.max(Math.round(duration * fps), 24), 160) // cap frames

    const input: Record<string, unknown> = {
      image: imageUrl,
      fps,
      num_frames: numFrames,
      width,
      height,
      prompt: motion,
      guidance_scale: 1.2,
      motion_bucket_id: 127,
      seed: 42
    }

    console.log('Replicate request:', { model, input })

    const output = await replicate.run(model, { input })

    console.log('Replicate output:', output)

    // Replicate outputs typically return an array or a URL. Normalize.
    const videoUrl = Array.isArray(output) ? (output[0] as string) : (output as string)

    return new Response(JSON.stringify({
      video_url: videoUrl,
      motion_prompt: motion,
      image_url: imageUrl,
      width,
      height,
      duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error in image-to-video function:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

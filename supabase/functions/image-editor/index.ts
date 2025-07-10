
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Create Supabase client with service role key for database operations
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Parse form data from the request
    const formData = await req.formData();
    const images = formData.getAll('image') as File[];
    const prompt = formData.get('prompt') as string;
    const apiKey = formData.get('apiKey') as string;
    const userId = formData.get('userId') as string;

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'At least one image is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check user's token balance
    const { data: tokenData, error: tokenError } = await supabase
      .from('user_tokens')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (tokenError || !tokenData || tokenData.balance < 1) {
      return new Response(
        JSON.stringify({ error: 'Insufficient token balance' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Processing ${images.length} images with prompt:`, prompt);

    // Create FormData for OpenAI API
    const openaiFormData = new FormData();
    openaiFormData.append('model', 'gpt-image-1');
    openaiFormData.append('prompt', prompt);
    
    // Add all images to the form data
    for (let i = 0; i < images.length; i++) {
      openaiFormData.append('image[]', images[i]);
      console.log(`Added image ${i + 1}: ${images[i].name || 'unnamed'} (${images[i].size} bytes)`);
    }

    console.log('Sending request to OpenAI /images/edits endpoint...');

    // Call OpenAI's /images/edits endpoint using the provided API key
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: openaiFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');

    if (data && data.data && data.data.length > 0) {
      // Deduct token from user's balance
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          transaction_type: 'consumption',
          amount: -1, // Negative for consumption
          description: 'AI image generation',
        });

      if (transactionError) {
        console.error('Error creating token transaction:', transactionError);
        // Continue anyway, don't fail the image generation
      }

      // Record the image generation
      const { error: generationError } = await supabase
        .from('image_generations')
        .insert({
          user_id: userId,
          tokens_consumed: 1,
          style_type: 'custom', // You could extract this from the prompt
          prompt: prompt,
          // image_url would be set here if you store the image
        });

      if (generationError) {
        console.error('Error recording image generation:', generationError);
        // Continue anyway, don't fail the image generation
      }

      // Return the response in the same format as before for frontend compatibility
      return new Response(JSON.stringify({ 
        data: data.data.map(item => ({ 
          b64_json: item.b64_json 
        }))
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

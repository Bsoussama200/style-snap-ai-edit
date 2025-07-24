import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, sessionId } = await req.json();
    
    const LEMONSQUEEZY_API_KEY = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJhMDViMjhjNjcyOTE1OWFkYzAyNDQzZDg1MTE2NTBkZjNiOGYzYTI0MzBmOTgzOGI2OTcxOGZmZDc1NTkwMzcxNGE4ZDJjZjhmYmNkZTM5OCIsImlhdCI6MTc1MzM0NjExNy43NTk0MjIsIm5iZiI6MTc1MzM0NjExNy43NTk0MjUsImV4cCI6MjA2ODg3ODkxNy43MTkyNSwic3ViIjoiNTI2MDQ2NyIsInNjb3BlcyI6W119.QxFUE5Hrwi_Hf7GWSeyTUiLeTbclA-1H5DNZCAU3xJa-WoVjH37ZPfVv6uXJ48zi5LnhtEXpBurmHjtO1tQhjxF59oT6NZEFJOVAKvIw_VNM-ccP-GcBJMkGEqibanD2maMGOuGbV7vC7MQRTBUy3acvJOEVKz0uH1SZBAbiW1I8hqg585M0ZoN5RM9hRYdsPSWrY2LduFgNPzT81eI0d-MbYs_rolgsVrzPkjSMxIUJnjl801eRBzhLjg3zqHXwXgmF6DDTADoDahesxpFLy0CiUmPGVV_ruAGxwGr1GFX_isiYcFLAbZnDzwe9T5GEpzj5He1SmVhqlEi1jKyvg4F41wn_HKvpRKwFmcm1vcOE-FYm2zSxFjs4yalb3KTxUFkOrukwbTm_RjUjlQiEnHTKiM9cR3x2cxvcY1JZAme3gGfVe4fQoFeCtXhXCxrvguXTnr5Johol8R6jG4iNankfCEWog463vzKVu14BTyA4YtAURG806GPeAzprIdJN";
    const STORE_ID = "205080";
    const VARIANT_ID = "916330";

    if (action === 'create-checkout') {
      // Create checkout session
      const checkoutData = {
        data: {
          type: "checkouts",
          attributes: {
            product_options: {
              redirect_url: `${req.headers.get("origin")}/?payment=success`,
            },
            checkout_options: {
              embed: false,
              media: false,
              logo: true,
            },
            checkout_data: {
              variant_quantities: [
                {
                  variant_id: parseInt(VARIANT_ID),
                  quantity: 1,
                }
              ],
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: VARIANT_ID,
              },
            },
          },
        },
      };

      const checkoutResponse = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LEMONSQUEEZY_API_KEY}`,
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
        },
        body: JSON.stringify(checkoutData),
      });

      if (!checkoutResponse.ok) {
        const errorText = await checkoutResponse.text();
        console.error("LemonSqueezy API Error:", errorText);
        throw new Error(`Failed to create checkout: ${checkoutResponse.status}`);
      }

      const checkout = await checkoutResponse.json();
      console.log("Checkout created:", checkout);

      return new Response(
        JSON.stringify({ 
          checkout_url: checkout.data.attributes.url,
          session_id: checkout.data.id 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    if (action === 'verify-payment' && sessionId) {
      // Verify payment status
      const orderResponse = await fetch(`https://api.lemonsqueezy.com/v1/orders?filter[order_number]=${sessionId}`, {
        headers: {
          "Authorization": `Bearer ${LEMONSQUEEZY_API_KEY}`,
          "Accept": "application/vnd.api+json",
        },
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to verify payment");
      }

      const orderData = await orderResponse.json();
      const isPaid = orderData.data && orderData.data.length > 0 && 
                    orderData.data[0].attributes.status === 'paid';

      return new Response(
        JSON.stringify({ is_paid: isPaid }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    throw new Error("Invalid action");

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

-- Insert all existing styles from categories.ts into the database

-- Products category styles
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Studio White',
  'Clean professional background',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only change the background to a professional studio setup with clean white background, even lighting, soft shadows, center-framed. The product must remain exactly identical.',
  '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png'
FROM public.categories c 
WHERE c.name = 'Products';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Natural Environment',
  'Product in natural setting',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only place the identical product in a natural environment that complements it (outdoor nature, urban space, workplace, sports arena, indoor space, or contextual setting), natural lighting, realistic and authentic atmosphere, professionally shot. The product must remain exactly identical.',
  '/lovable-uploads/e0bcb7bf-4ce5-44cb-8c66-ebbd40fbfb0e.png'
FROM public.categories c 
WHERE c.name = 'Products';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Dark Moody',
  'Dramatic cinematic lighting',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only transform the background and lighting to a dramatic photo with darker background, subtle shadows, and cinematic atmosphere. Keep the full product clearly visible with good detail while maintaining a sophisticated aesthetic. The product must remain exactly identical.',
  '/lovable-uploads/bc2620ab-04d8-447a-b004-96d10f242bb3.png'
FROM public.categories c 
WHERE c.name = 'Products';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Vibrant Ad Style',
  'High-contrast commercial look',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only change the background and lighting to make the product pop with a colorful, high-contrast commercial look. Use bright lighting, dramatic shadows, glowing reflections. Like an ad banner. The product must remain exactly identical.',
  '/lovable-uploads/5a434678-e8ff-400f-8d13-968962695509.png'
FROM public.categories c 
WHERE c.name = 'Products';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Minimalist Flat Lay',
  'Top-down aesthetic composition',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only place the identical product in a top-down flat lay on a solid neutral color surface (light beige or gray), clean layout, minimalist, aesthetic composition. The product must remain exactly identical.',
  '/lovable-uploads/b6f1f958-b012-4f41-ae3a-0eda0fddf98a.png'
FROM public.categories c 
WHERE c.name = 'Products';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Premium Showroom',
  'High-end elegant surroundings',
  'KEEP THE EXACT PRODUCT UNCHANGED - do not modify, alter, or change the product in any way. Only render the identical product in a high-end showroom with premium materials, soft natural light, elegant surroundings. For large products too. The product must remain exactly identical.',
  '/lovable-uploads/95e2ef73-1a3d-4e27-b5d5-e76a67891f3c.png'
FROM public.categories c 
WHERE c.name = 'Products';

-- Restaurant category styles (additional ones from categories.ts)
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Rustic Table',
  'Warm wooden table setting',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a rustic wooden table with warm lighting, natural textures, cozy restaurant atmosphere. The food must remain exactly identical.',
  '/lovable-uploads/50ae9be2-c8e8-496a-84a7-8f1b246b3fe6.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Fine Dining',
  'Elegant restaurant presentation',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to an elegant fine dining setting with pristine white tablecloth, sophisticated plating, soft ambient lighting. The food must remain exactly identical.',
  '/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Street Food Vibes',
  'Authentic street market feel',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a vibrant street food market setting with authentic atmosphere, casual presentation, dynamic lighting. The food must remain exactly identical.',
  '/lovable-uploads/a4948c83-3ad5-4331-9815-fb7bdfbb1716.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Coffee Shop Aesthetic',
  'Cozy cafe environment',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a cozy coffee shop setting with warm lighting, wooden surfaces, casual atmosphere. The food must remain exactly identical.',
  '/lovable-uploads/9b309e49-4fa8-41df-b872-274cb1f95c03.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Outdoor Dining',
  'Fresh air restaurant setting',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to an outdoor dining setting with natural daylight, fresh atmosphere, patio or garden setting. The food must remain exactly identical.',
  '/lovable-uploads/e9c62d91-1b83-404a-892b-a87f3af9a227.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Minimalist Clean',
  'Clean modern presentation',
  'KEEP THE EXACT FOOD UNCHANGED - do not modify, alter, or change the food in any way. Only change the background to a minimalist clean setting with neutral colors, modern presentation, professional food photography style. The food must remain exactly identical.',
  '/lovable-uploads/0a7a7cb6-c5fa-459e-8feb-9cf831fee713.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

-- Gyms category styles (original ones from categories.ts)
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Modern Fitness Center',
  'State-of-the-art equipment',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a modern fitness center with high-tech equipment, clean lines, bright lighting, professional gym atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Outdoor Training',
  'Fresh air fitness environment',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an outdoor training environment with natural lighting, park or beach setting, fresh air atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'CrossFit Box',
  'Industrial training space',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a CrossFit box with industrial feel, functional equipment, raw atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Yoga Studio',
  'Peaceful meditation space',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a peaceful yoga studio with soft lighting, natural elements, zen atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1506629905877-68e5842ee1a1?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Home Gym Setup',
  'Personal workout space',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a home gym setup with personal touch, organized equipment, motivational atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1558611012-1e5c5b6e9aad?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Boxing Gym',
  'Intense training environment',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a boxing gym with heavy bags, intense lighting, gritty atmosphere. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300'
FROM public.categories c 
WHERE c.name = 'Gyms';

-- Decoration category styles
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Modern Living Room',
  'Contemporary home setting',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a modern living room with contemporary furniture, clean lines, natural light. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Rustic Bedroom',
  'Cozy bedroom atmosphere',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a rustic bedroom with warm textures, cozy atmosphere, soft lighting. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Minimalist Kitchen',
  'Clean kitchen design',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a minimalist kitchen with clean surfaces, modern appliances, bright lighting. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1556909114-4e3afa3d9ee3?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Garden Patio',
  'Outdoor living space',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a garden patio with outdoor furniture, plants, natural lighting. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Modern Office',
  'Professional workspace',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a modern office space with professional atmosphere, organized workspace, good lighting. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Luxury Bathroom',
  'Spa-like bathroom setting',
  'KEEP THE EXACT ITEM UNCHANGED - do not modify, alter, or change the item in any way. Only change the background to a luxury bathroom with spa-like atmosphere, premium materials, elegant lighting. The item must remain exactly identical.',
  'https://images.unsplash.com/photo-1584622781564-1d987ac7c017?w=300'
FROM public.categories c 
WHERE c.name = 'Decoration';

-- Automotive category styles
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Luxury Showroom',
  'Premium dealership setting',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a luxury car showroom with polished floors, professional lighting, premium atmosphere. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Urban Street',
  'City street environment',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to an urban street setting with city backdrop, dynamic lighting, modern atmosphere. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Scenic Highway',
  'Beautiful landscape backdrop',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a scenic highway with beautiful landscape, natural lighting, open road feel. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1544829099-b9a0c5303bff?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Professional Garage',
  'Clean garage environment',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a professional garage with clean environment, organized tools, workshop atmosphere. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Race Track',
  'Racing circuit setting',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a race track with circuit atmosphere, dynamic setting, motorsport feel. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Vintage Workshop',
  'Classic car garage',
  'KEEP THE EXACT VEHICLE UNCHANGED - do not modify, alter, or change the vehicle in any way. Only change the background to a vintage workshop with classic atmosphere, retro tools, nostalgic feel. The vehicle must remain exactly identical.',
  'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300'
FROM public.categories c 
WHERE c.name = 'Automotive';

-- Events category styles
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Wedding Venue',
  'Elegant wedding setting',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an elegant wedding venue with romantic atmosphere, beautiful decorations, soft lighting. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Corporate Event',
  'Professional conference setting',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a corporate event with professional atmosphere, modern venue, business setting. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Birthday Celebration',
  'Festive party atmosphere',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a birthday party with festive decorations, celebration atmosphere, colorful setting. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Outdoor Festival',
  'Open-air event setting',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to an outdoor festival with open-air atmosphere, stage setting, crowd energy. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Gala Dinner',
  'Formal dinner event',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a gala dinner with formal atmosphere, elegant table setting, sophisticated lighting. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Concert Hall',
  'Music performance setting',
  'KEEP THE EXACT SUBJECT UNCHANGED - do not modify, alter, or change the subject in any way. Only change the background to a concert hall with stage lighting, performance atmosphere, music venue feel. The subject must remain exactly identical.',
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=300'
FROM public.categories c 
WHERE c.name = 'Events';

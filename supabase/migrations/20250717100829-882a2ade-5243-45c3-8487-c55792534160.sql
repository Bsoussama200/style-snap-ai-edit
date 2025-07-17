
-- Insert styles for the Gyms category
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Busy Gym Atmosphere',
  'Transform your gym into a bustling fitness environment with people actively working out',
  'Transform this gym into a vibrant, busy fitness center with multiple people actively working out. Add athletes using various equipment like treadmills, weight machines, free weights, and functional training areas. Include diverse people of different ages and fitness levels exercising together. Enhance the lighting with bright, energetic LED lighting that creates a motivational atmosphere. Add sweat effects and dynamic action poses to show intensity. Include mirrors reflecting the activity and modern gym equipment. Make the space look professionally maintained and inspiring.',
  '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Premium Fitness Studio',
  'Upgrade your gym with premium lighting and high-end fitness equipment atmosphere',
  'Transform this gym into a premium fitness studio with sophisticated lighting design. Add warm, professional LED strip lighting along the walls and ceiling that creates depth and ambiance. Include people using high-end fitness equipment in a luxurious setting. Add polished floors with subtle reflections, modern architectural elements, and plants for a wellness-focused environment. Include fit, motivated people working out with perfect form. Use dramatic lighting that highlights the muscle definition and creates an aspirational, high-end fitness club atmosphere.',
  '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png'
FROM public.categories c 
WHERE c.name = 'Gyms';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Functional Training Zone',
  'Create an active functional training area with people doing dynamic workouts',
  'Transform this space into a dynamic functional training zone with people performing high-intensity workouts. Add athletes doing kettlebell swings, battle ropes, box jumps, and suspension training. Include dramatic side lighting and spotlights that create strong shadows and highlight the muscular definition of the athletes. Add sweat particles in the air, chalk dust, and motion blur effects to show intense movement. Include modern functional training equipment like rigs, plyo boxes, and rubber flooring. Make the atmosphere energetic and hardcore with industrial-style lighting.',
  '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png'
FROM public.categories c 
WHERE c.name = 'Gyms';

-- Insert styles for the Restaurants category
INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Bustling Restaurant Atmosphere',
  'Transform your restaurant into a lively dining destination with customers enjoying their meals',
  'Transform this restaurant into a vibrant, bustling dining establishment with customers seated at tables enjoying their meals. Add diverse diners of different ages engaged in conversation, laughing, and savoring food. Include waitstaff moving between tables providing excellent service. Enhance the ambiance with warm, inviting lighting - soft pendant lights over tables, ambient wall sconces, and candles creating a cozy atmosphere. Add the glow of conversation and the energy of a successful restaurant. Include wine glasses, beautiful food presentations, and the overall feeling of a popular, thriving restaurant.',
  '/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Romantic Fine Dining',
  'Create an elegant fine dining atmosphere with intimate lighting and sophisticated ambiance',
  'Transform this restaurant into an elegant fine dining establishment with romantic, intimate lighting. Add soft, warm lighting from chandeliers, table candles, and accent lighting that creates a luxurious ambiance. Include well-dressed couples and small groups enjoying gourmet meals in an upscale setting. Add elements like white tablecloths, elegant place settings, wine service, and sophisticated decor. Include subtle background lighting that highlights architectural features and creates depth. Make the atmosphere refined, intimate, and perfect for special occasions with golden hour lighting effects.',
  '/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

INSERT INTO public.styles (category_id, name, description, prompt, placeholder) 
SELECT 
  c.id,
  'Trendy Cafe Vibe',
  'Create a modern, trendy cafe atmosphere with young professionals and great lighting',
  'Transform this space into a trendy, modern cafe with young professionals working on laptops, friends chatting over coffee, and a vibrant social atmosphere. Add warm, industrial-style lighting with exposed Edison bulbs, track lighting, and large windows providing natural light. Include people of various ages enjoying artisanal coffee, pastries, and light meals. Add modern furniture, plants, brick walls, and contemporary decor elements. Create a hip, Instagram-worthy atmosphere with perfect lighting for both work and socializing. Include coffee steam, laptop screens glowing, and the buzz of a popular neighborhood cafe.',
  '/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png'
FROM public.categories c 
WHERE c.name = 'Restaurants';

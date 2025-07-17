
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  icon_name TEXT DEFAULT 'Package',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create styles table
CREATE TABLE public.styles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  placeholder TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making these public for admin access
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.styles ENABLE ROW LEVEL SECURITY;

-- Create policies that allow public read access (for the main app)
CREATE POLICY "Anyone can view categories" 
  ON public.categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can view styles" 
  ON public.styles 
  FOR SELECT 
  USING (true);

-- For now, allow anyone to manage categories and styles
-- In production, you'd want to restrict this to admin users only
CREATE POLICY "Anyone can insert categories" 
  ON public.categories 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update categories" 
  ON public.categories 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete categories" 
  ON public.categories 
  FOR DELETE 
  USING (true);

CREATE POLICY "Anyone can insert styles" 
  ON public.styles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update styles" 
  ON public.styles 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete styles" 
  ON public.styles 
  FOR DELETE 
  USING (true);

-- Insert the existing categories data
INSERT INTO public.categories (name, description, image_url, icon_name) VALUES
('Products', 'Transform your product photos with professional styling and backgrounds', '/lovable-uploads/50ae9be2-c8e8-496a-84a7-8f1b246b3fe6.png', 'Package'),
('Restaurants', 'Enhance your food photography with appetizing presentations and settings', '/lovable-uploads/55b005ec-5cd1-46e9-97e3-c6e87b3e0245.png', 'UtensilsCrossed'),
('Gyms', 'Create dynamic fitness content with motivational backgrounds and energy', '/lovable-uploads/264fc9d5-4f5e-45f0-af14-28b55062a246.png', 'Dumbbell'),
('Decoration', 'Showcase interior design and decor in beautiful, styled environments', '/lovable-uploads/9b309e49-4fa8-41df-b872-274cb1f95c03.png', 'Home'),
('Automotive', 'Present vehicles in stunning locations and professional settings', '/lovable-uploads/bc2620ab-04d8-447a-b004-96d10f242bb3.png', 'Car'),
('Events', 'Capture special moments with perfect backgrounds and atmosphere', '/lovable-uploads/a4948c83-3ad5-4331-9815-fb7bdfbb1716.png', 'Calendar');

-- Create prompts table for managing app-wide prompt snippets
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Open policies (consistent with categories/styles in this project)
CREATE POLICY "Anyone can view prompts"
ON public.prompts
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert prompts"
ON public.prompts
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update prompts"
ON public.prompts
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete prompts"
ON public.prompts
FOR DELETE
USING (true);

-- Seed a default focus suffix used for video generation
INSERT INTO public.prompts (key, label, content, description)
VALUES (
  'video_focus_suffix',
  'Video focus suffix',
  'Focus: Keep attention and camera movement centered on the main product or primary subject. Avoid background distractions. Smooth, subtle motion that highlights the product.',
  'Appends to video prompts to ensure product-focused motion'
)
ON CONFLICT (key) DO NOTHING;
-- Create prompts table for managing app-wide prompt templates
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  key TEXT NOT NULL UNIQUE,
  label TEXT,
  content TEXT NOT NULL,
  type TEXT,
  description TEXT
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Open policies (aligned with existing categories/styles setup)
CREATE POLICY IF NOT EXISTS "Anyone can view prompts"
ON public.prompts
FOR SELECT
USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can insert prompts"
ON public.prompts
FOR INSERT
WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Anyone can update prompts"
ON public.prompts
FOR UPDATE
USING (true);

CREATE POLICY IF NOT EXISTS "Anyone can delete prompts"
ON public.prompts
FOR DELETE
USING (true);

-- Helpful index for quick lookup by key
CREATE INDEX IF NOT EXISTS idx_prompts_key ON public.prompts (key);

-- Seed default video focus suffix used when generating motion
INSERT INTO public.prompts (key, label, content, type, description)
VALUES (
  'video_focus_suffix',
  'Video Focus Suffix',
  'Focus: Keep attention and camera movement centered on the main product or primary subject. Avoid background distractions. Smooth, subtle motion that highlights the product.',
  'video',
  'Appends to video prompts to prioritize the main subject'
)
ON CONFLICT (key) DO NOTHING;
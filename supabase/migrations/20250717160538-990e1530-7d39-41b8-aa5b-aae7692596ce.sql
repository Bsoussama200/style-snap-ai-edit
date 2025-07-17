
-- Create a storage bucket for style images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('style-images', 'style-images', true);

-- Create storage policies to allow public access
CREATE POLICY "Anyone can view style images" ON storage.objects
FOR SELECT USING (bucket_id = 'style-images');

CREATE POLICY "Anyone can upload style images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'style-images');

CREATE POLICY "Anyone can update style images" ON storage.objects
FOR UPDATE USING (bucket_id = 'style-images');

CREATE POLICY "Anyone can delete style images" ON storage.objects
FOR DELETE USING (bucket_id = 'style-images');

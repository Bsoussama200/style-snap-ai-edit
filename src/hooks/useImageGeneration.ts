
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { styleOptions } from '@/constants/styleOptions';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');

  const generateStyledImage = async (
    selectedImages: File[],
    selectedStyle: string,
    customPrompt: string
  ) => {
    if (selectedImages.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please upload at least one image.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedStyle && !customPrompt.trim()) {
      toast({
        title: "Missing requirements",
        description: "Please select a style or enter a custom prompt.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedStyleOption = styleOptions.find(style => style.id === selectedStyle);
      const finalPrompt = customPrompt.trim() || selectedStyleOption?.prompt || '';

      console.log('Processing images:', selectedImages.length);
      console.log('Using prompt:', finalPrompt);

      const formData = new FormData();
      
      selectedImages.forEach((image, index) => {
        formData.append('image', image);
        console.log(`Added image ${index + 1}:`, image.name);
      });
      
      formData.append('prompt', finalPrompt);

      console.log('Sending request to backend...');

      const { data, error } = await supabase.functions.invoke('image-editor', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

      console.log('Backend response:', data);

      if (data && data.data && data.data[0] && data.data[0].b64_json) {
        const base64Data = data.data[0].b64_json;
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        const imageUrl = URL.createObjectURL(blob);
        
        setGeneratedImage(imageUrl);
        toast({
          title: "Success!",
          description: `Your styled image has been generated using ${selectedImages.length} reference image${selectedImages.length > 1 ? 's' : ''}.`,
        });
      } else if (data && data.content) {
        toast({
          title: "Response received",
          description: data.content,
        });
      } else {
        throw new Error('No image data received from backend');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate styled image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generatedImage,
    setGeneratedImage,
    generateStyledImage
  };
};

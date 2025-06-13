
import React, { useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import ImageUpload from './snapstyle/ImageUpload';
import StyleSelection from './snapstyle/StyleSelection';
import CustomPrompt from './snapstyle/CustomPrompt';
import ResultDisplay from './snapstyle/ResultDisplay';
import { useImageGeneration } from '@/hooks/useImageGeneration';

const SnapStyleAI = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isGenerating, generatedImage, setGeneratedImage, generateStyledImage } = useImageGeneration();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload JPG, JPEG, or PNG images.",
        variant: "destructive"
      });
      return;
    }

    setSelectedImages(validFiles);
    
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setGeneratedImage('');
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const handleGenerate = () => {
    generateStyledImage(selectedImages, selectedStyle, customPrompt);
  };

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `snapstyle-ai-${selectedStyle || 'custom'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetApp = () => {
    setSelectedImages([]);
    setPreviewUrls([]);
    setSelectedStyle('');
    setCustomPrompt('');
    setGeneratedImage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text">
          SnapStyle AI
        </h1>
        <p className="text-muted-foreground text-lg">
          Transform your product photos with AI-powered professional styles
        </p>
      </div>

      {/* Upload Section */}
      <ImageUpload
        previewUrls={previewUrls}
        onImageUpload={handleImageUpload}
        fileInputRef={fileInputRef}
      />

      {/* Style Selection */}
      {previewUrls.length > 0 && (
        <>
          <StyleSelection
            selectedStyle={selectedStyle}
            onStyleSelect={handleStyleSelect}
          />

          {/* Custom Prompt Section */}
          <CustomPrompt
            customPrompt={customPrompt}
            onCustomPromptChange={setCustomPrompt}
          />
        </>
      )}

      {/* Generate Button */}
      {previewUrls.length > 0 && (
        <div className="text-center">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            size="lg"
            className="px-8 py-4 text-lg font-semibold"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Creating your styled image...
              </>
            ) : (
              'Generate Styled Image'
            )}
          </Button>
        </div>
      )}

      {/* Result Section */}
      {generatedImage && (
        <ResultDisplay
          generatedImage={generatedImage}
          originalImage={previewUrls[0]}
          onDownload={downloadImage}
          onReset={resetApp}
        />
      )}
    </div>
  );
};

export default SnapStyleAI;

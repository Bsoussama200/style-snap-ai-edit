import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, ArrowLeft, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useStyles } from '@/hooks/useStyles';
import { X } from 'lucide-react';

interface StyleSelectorProps {
  categoryId: string;
  onBack: () => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ categoryId, onBack }) => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [openaiApiKey, setOpenaiApiKey] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use database queries instead of hardcoded data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: styles, isLoading: stylesLoading } = useStyles(categoryId);

  const category = categories?.find(cat => cat.id === categoryId);

  // Show loading state while data is being fetched
  if (categoriesLoading || stylesLoading) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading category and styles...</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Category not found</p>
          <Button onClick={onBack} variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Categories
          </Button>
        </div>
      </div>
    );
  }

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

  const generateStyledImage = async () => {
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

    if (!openaiApiKey.trim()) {
      toast({
        title: "Missing API Key",
        description: "Please enter your OpenAI API key to generate images.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedStyleOption = styles?.find(style => style.id === selectedStyle);
      const finalPrompt = customPrompt.trim() || selectedStyleOption?.prompt || '';

      const formData = new FormData();
      
      selectedImages.forEach((image) => {
        formData.append('image', image);
      });
      
      formData.append('prompt', finalPrompt);
      formData.append('apiKey', openaiApiKey);

      const { data, error } = await supabase.functions.invoke('image-editor', {
        body: formData,
      });

      if (error) {
        throw new Error(error.message);
      }

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

  const downloadImage = () => {
    if (generatedImage) {
      const link = document.createElement('a');
      link.href = generatedImage;
      link.download = `taswira-ai-${category.id}-${selectedStyle || 'custom'}-${Date.now()}.png`;
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
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Button>
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">
            {category.name} Styles
          </h1>
          <p className="text-muted-foreground">
            {category.description}
          </p>
        </div>
        <div className="w-32"></div> {/* Spacer for center alignment */}
      </div>

      {/* API Key Section */}
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">OpenAI API Key</h2>
            </div>
            <Input
              type="password"
              placeholder="Enter your OpenAI API key"
              value={openaiApiKey}
              onChange={(e) => setOpenaiApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-sm text-muted-foreground">
              Your API key is required for image generation and is only used for this session.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Your Images</h2>
            
            {previewUrls.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to upload your images
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports JPG, JPEG, PNG (multiple files allowed)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {previewUrls.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ))}
                </div>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  size="lg"
                >
                  Change Images
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      {previewUrls.length > 0 && styles && styles.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Choose Your Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {styles.map((style) => (
              <Card
                key={style.id}
                className={`glass-card cursor-pointer hover-lift transition-all ${
                  selectedStyle === style.id 
                    ? 'ring-2 ring-primary bg-primary/10' 
                    : 'hover:bg-card/70'
                }`}
                onClick={() => handleStyleSelect(style.id)}
              >
                <CardContent className="p-4 space-y-3">
                  <AspectRatio ratio={1} className="w-full rounded-lg overflow-hidden border border-border">
                    <img 
                      src={style.placeholder || '/placeholder.svg'} 
                      alt={`${style.name} example`}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                  <div className="text-center space-y-2">
                    <h3 className="font-semibold">{style.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {style.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Custom Prompt Section */}
      {previewUrls.length > 0 && (
        <Card className="glass-card max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Custom Prompt (Optional)</h2>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full h-12 resize-none text-foreground"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generate Button */}
      {previewUrls.length > 0 && (
        <div className="text-center">
          <Button
            onClick={generateStyledImage}
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
        <Card className="glass-card max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-center">
              Your Styled Image
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Original</p>
                <img 
                  src={previewUrls[0]} 
                  alt="Original" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Styled</p>
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setIsImageModalOpen(true)}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={downloadImage} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
              <Button onClick={resetApp} variant="outline" className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none">
          <DialogClose className="absolute right-4 top-4 z-50 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-background/80 backdrop-blur-sm">
            <X className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <div className="relative">
            <img 
              src={generatedImage} 
              alt="Generated Image Full Size" 
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StyleSelector;

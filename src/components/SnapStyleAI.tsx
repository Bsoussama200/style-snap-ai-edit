import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, Camera, Home, Moon, Zap, Grid3X3, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
  sampleImage: string;
}

const styleOptions: StyleOption[] = [
  {
    id: 'studio',
    name: 'Studio White',
    description: 'Clean professional background',
    icon: <Camera className="w-6 h-6" />,
    prompt: "Keep the exact product but make it a professional shoot with a clean white background, even lighting, soft shadows, center-framed.",
    sampleImage: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?w=300&h=200&fit=crop"
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Shot',
    description: 'Natural home environment',
    icon: <Home className="w-6 h-6" />,
    prompt: "Place the exact product in a realistic home environment (indoor), natural lighting, cozy and modern furniture or background, professionally shot.",
    sampleImage: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=300&h=200&fit=crop"
  },
  {
    id: 'moody',
    name: 'Dark Moody',
    description: 'Dramatic cinematic lighting',
    icon: <Moon className="w-6 h-6" />,
    prompt: "Transform the product into a dramatic photo with low light, deep shadows, contrast, and cinematic lighting. Background dark and smooth.",
    sampleImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=300&h=200&fit=crop"
  },
  {
    id: 'vibrant',
    name: 'Vibrant Ad Style',
    description: 'High-contrast commercial look',
    icon: <Zap className="w-6 h-6" />,
    prompt: "Make the product pop with a colorful, high-contrast commercial look. Use bright lighting, dramatic shadows, glowing reflections. Like an ad banner.",
    sampleImage: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=300&h=200&fit=crop"
  },
  {
    id: 'flatlay',
    name: 'Minimalist Flat Lay',
    description: 'Top-down aesthetic composition',
    icon: <Grid3X3 className="w-6 h-6" />,
    prompt: "Place the product in a top-down flat lay on a solid neutral color surface (light beige or gray), clean layout, minimalist, aesthetic composition.",
    sampleImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop"
  },
  {
    id: 'premium',
    name: 'Premium Showroom',
    description: 'High-end elegant surroundings',
    icon: <Crown className="w-6 h-6" />,
    prompt: "Render the product in a high-end showroom with premium materials, sleek furniture, soft natural light, elegant surroundings. For large products too.",
    sampleImage: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=300&h=200&fit=crop"
  }
];

const SnapStyleAI = () => {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    // Create preview URLs for all images
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
    setGeneratedImage(''); // Clear previous result
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

    setIsGenerating(true);
    
    try {
      // Use the selected style prompt or custom prompt
      const selectedStyleOption = styleOptions.find(style => style.id === selectedStyle);
      const finalPrompt = customPrompt.trim() || selectedStyleOption?.prompt || '';

      console.log('Processing images:', selectedImages.length);
      console.log('Using prompt:', finalPrompt);

      // Create FormData and append all images
      const formData = new FormData();
      
      // Add all images with the same field name that the backend expects
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
        // Convert base64 to blob URL for display
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
        // Handle text response case
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
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Product Images</h2>
            
            {previewUrls.length === 0 ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to upload your product images
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
                  variant="outline"
                  className="w-full"
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
      {previewUrls.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Choose Your Style
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {styleOptions.map((style) => (
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
                  <img 
                    src={style.sampleImage} 
                    alt={`${style.name} example`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <div className="text-center space-y-2">
                    <div className="text-primary">
                      {style.icon}
                    </div>
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
            <h2 className="text-xl font-semibold mb-4">Custom Prompt (Optional)</h2>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Enter your custom styling instructions here... (leave empty to use selected style)"
              className="w-full h-24 p-3 border rounded-lg resize-none"
            />
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
                  className="w-full h-48 object-cover rounded-lg"
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
    </div>
  );
};

export default SnapStyleAI;

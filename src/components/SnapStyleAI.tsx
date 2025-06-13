
import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, Camera, Home, Moon, Zap, Grid3X3, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface StyleOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  prompt: string;
}

const styleOptions: StyleOption[] = [
  {
    id: 'studio',
    name: 'Studio White',
    description: 'Clean professional background',
    icon: <Camera className="w-6 h-6" />,
    prompt: "Keep the exact product but make it a professional shoot with a clean white background, even lighting, soft shadows, center-framed."
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle Shot',
    description: 'Natural home environment',
    icon: <Home className="w-6 h-6" />,
    prompt: "Place the exact product in a realistic home environment (indoor), natural lighting, cozy and modern furniture or background, professionally shot."
  },
  {
    id: 'moody',
    name: 'Dark Moody',
    description: 'Dramatic cinematic lighting',
    icon: <Moon className="w-6 h-6" />,
    prompt: "Transform the product into a dramatic photo with low light, deep shadows, contrast, and cinematic lighting. Background dark and smooth."
  },
  {
    id: 'vibrant',
    name: 'Vibrant Ad Style',
    description: 'High-contrast commercial look',
    icon: <Zap className="w-6 h-6" />,
    prompt: "Make the product pop with a colorful, high-contrast commercial look. Use bright lighting, dramatic shadows, glowing reflections. Like an ad banner."
  },
  {
    id: 'flatlay',
    name: 'Minimalist Flat Lay',
    description: 'Top-down aesthetic composition',
    icon: <Grid3X3 className="w-6 h-6" />,
    prompt: "Place the product in a top-down flat lay on a solid neutral color surface (light beige or gray), clean layout, minimalist, aesthetic composition."
  },
  {
    id: 'premium',
    name: 'Premium Showroom',
    description: 'High-end elegant surroundings',
    icon: <Crown className="w-6 h-6" />,
    prompt: "Render the product in a high-end showroom with premium materials, sleek furniture, soft natural light, elegant surroundings. For large products too."
  }
];

const SnapStyleAI = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedImage(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setGeneratedImage(''); // Clear previous result
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG, JPEG, or PNG image.",
          variant: "destructive"
        });
      }
    }
  };

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
  };

  const generateStyledImage = async () => {
    if (!selectedImage || !selectedStyle || !apiKey) {
      toast({
        title: "Missing requirements",
        description: "Please upload an image, select a style, and enter your API key.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const selectedStyleOption = styleOptions.find(style => style.id === selectedStyle);
      if (!selectedStyleOption) {
        throw new Error('Selected style not found');
      }

      // Create FormData for the API request
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', selectedStyleOption.prompt);
      formData.append('model', 'gpt-image-1');
      formData.append('n', '1');
      formData.append('size', '1024x1024');
      formData.append('response_format', 'b64_json');

      console.log('Sending image edit request...');

      const response = await fetch('https://api.openai.com/v1/images/edits', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate image');
      }

      const data = await response.json();
      
      if (data.data && data.data[0] && data.data[0].b64_json) {
        const base64Image = `data:image/png;base64,${data.data[0].b64_json}`;
        setGeneratedImage(base64Image);
        toast({
          title: "Success!",
          description: "Your styled image has been generated.",
        });
      } else {
        throw new Error('No image data received');
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
      link.download = `snapstyle-ai-${selectedStyle}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setPreviewUrl('');
    setSelectedStyle('');
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

      {/* API Key Input */}
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-4">
          <label className="block text-sm font-medium mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full p-3 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Your API key is only used locally and never stored.
          </p>
        </CardContent>
      </Card>

      {/* Upload Section */}
      <Card className="glass-card max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Product Image</h2>
            
            {!previewUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Click to upload your product image
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports JPG, JPEG, PNG
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  Change Image
                </Button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Style Selection */}
      {previewUrl && (
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
                <CardContent className="p-4 text-center space-y-3">
                  <div className="text-primary">
                    {style.icon}
                  </div>
                  <h3 className="font-semibold">{style.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {style.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Generate Button */}
      {previewUrl && selectedStyle && (
        <div className="text-center">
          <Button
            onClick={generateStyledImage}
            disabled={isGenerating || !apiKey}
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
                  src={previewUrl} 
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

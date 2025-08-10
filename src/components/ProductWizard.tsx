import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useStyles } from '@/hooks/useStyles';
import { Upload, RefreshCw, Download, Play, ArrowLeft } from 'lucide-react';

interface AnalysisResult {
  analysis: string;
  suggestedCategoryId: string | null;
  suggestedCategoryName?: string | null;
  confidence?: number | null;
}

type Mode = 'photo' | 'photovideo';

type Step =
  | 'upload'
  | 'category'
  | 'mode'
  | 'style'
  | 'generating'
  | 'confirm'
  | 'video_generating'
  | 'video_ready';

const ProductWizard: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [productName, setProductName] = useState('');
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [categoryId, setCategoryId] = useState<string>('');
  const [mode, setMode] = useState<Mode>('photo');
  const [selectedStyle, setSelectedStyle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const stylesQuery = useStyles(categoryId);

  const selectedCategory = useMemo(() => categories?.find(c => c.id === categoryId) || null, [categories, categoryId]);
  const styles = stylesQuery.data || [];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    setUploadedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const startAnalysis = async () => {
    if (!uploadedImage) {
      toast({ title: 'Upload required', description: 'Please upload an image first.', variant: 'destructive' });
      return;
    }
    if (!productName.trim()) {
      toast({ title: 'Product name required', description: 'Please enter a product name.', variant: 'destructive' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const form = new FormData();
      form.append('image', uploadedImage);
      form.append('productName', productName.trim());
      const { data, error } = await supabase.functions.invoke('analyze-product', { body: form });
      if (error) throw new Error(error.message);
      const result = data as AnalysisResult;
      setAnalysis(result);
      if (result.suggestedCategoryId) setCategoryId(result.suggestedCategoryId);
      setStep('category');
    } catch (err) {
      console.error(err);
      toast({ title: 'Analysis failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
      setStep('upload');
    }
    setIsAnalyzing(false);
  };

  const proceedAfterCategory = () => {
    if (!categoryId) {
      toast({ title: 'Select category', description: 'Please confirm a category.', variant: 'destructive' });
      return;
    }
    setStep('mode');
  };

  const proceedAfterMode = () => {
    setStep('style');
  };

  const generateImage = async () => {
    if (!uploadedImage) return;
    if (!selectedStyle && !customPrompt.trim()) {
      toast({ title: 'Select style or prompt', description: 'Choose a style or add a custom prompt.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);
    setStep('generating');
    try {
      const selectedStyleOption = styles.find(s => s.id === selectedStyle);
      const basePrompt = customPrompt.trim() || selectedStyleOption?.prompt || '';
      const prompt = mode === 'photovideo' ? `${basePrompt}\nVertical 9:16 composition, portrait 720x1280 framing.` : basePrompt;

      const form = new FormData();
      form.append('image', uploadedImage);
      form.append('prompt', prompt);

      const { data, error } = await supabase.functions.invoke('image-editor', { body: form });
      if (error) throw new Error(error.message);

      if (data && data.data && data.data[0] && data.data[0].b64_json) {
        const base64 = data.data[0].b64_json as string;
        const byteChars = atob(base64);
        const byteNumbers = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNumbers)], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        setGeneratedImage(url);
        setStep('confirm');
      } else {
        throw new Error('No image data from server');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Generation failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
      setStep('style');
    } finally {
      setIsGenerating(false);
    }
  };

  const confirmAndMaybeCreateVideo = async () => {
    if (mode === 'photo') {
      toast({ title: 'Image confirmed', description: 'You can download your image below.' });
      setStep('confirm');
      return;
    }

    if (!generatedImage) return;
    setStep('video_generating');

    try {
      const blob = await fetch(generatedImage).then(r => r.blob());
      const file = new File([blob], 'generated.png', { type: 'image/png' });
      const form = new FormData();
      form.append('image', file);
      form.append('durationSeconds', '5');
      form.append('width', '720');
      form.append('height', '1280');

      const { data, error } = await supabase.functions.invoke('image-to-video', { body: form });
      if (error) throw new Error(error.message);

      if (data?.video_url) {
        setVideoUrl(data.video_url);
        toast({ title: 'Video ready', description: 'Preview your animated video.' });
        setStep('video_ready');
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Video generation failed');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Video failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
      setStep('confirm');
    }
  };

  const downloadBlobUrl = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen p-4 space-y-8">
      <div className="flex items-center justify-between">
        <div />
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-bold gradient-text">Create Product Visuals</h1>
          <p className="text-muted-foreground">Upload, analyze, select style, generate image, and optionally animate.</p>
        </div>
        <div className="w-32" />
      </div>

      {step === 'upload' && (
        <Card className="glass-card max-w-2xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Upload Product Image</h2>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="mx-auto w-48 h-48 object-cover rounded-lg" />
              ) : (
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              )}
              <p className="text-muted-foreground">Click to upload your image</p>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Product name</label>
              <Textarea value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full h-12 resize-none text-foreground" />
            </div>
            <Button onClick={startAnalysis} className="w-full" disabled={!uploadedImage || !productName.trim() || isAnalyzing}>
              {isAnalyzing ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Analyzing...</>) : 'Analyze Product'}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'category' && analysis && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Review Analysis & Confirm Category</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{analysis.analysis}</p>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Suggested category</label>
              <select
                className="w-full rounded-md border border-border bg-background p-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories?.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('upload')} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button onClick={proceedAfterCategory} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'mode' && (
        <Card className="glass-card max-w-xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Choose Output</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant={mode === 'photo' ? 'default' : 'outline'} onClick={() => setMode('photo')}>Photo</Button>
              <Button variant={mode === 'photovideo' ? 'default' : 'outline'} onClick={() => setMode('photovideo')}>Photo / Video</Button>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('category')} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button onClick={proceedAfterMode} className="flex-1">Continue</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'style' && (
        <Card className="glass-card max-w-4xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Pick a Style</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {styles.map((style) => (
                <Card key={style.id} className={`glass-card cursor-pointer ${selectedStyle === style.id ? 'ring-2 ring-primary bg-primary/10' : ''}`} onClick={() => setSelectedStyle(style.id)}>
                  <CardContent className="p-4 space-y-2">
                    <img src={style.placeholder || '/placeholder.svg'} alt={`${style.name} example`} className="w-full h-32 object-cover rounded-md" />
                    <div>
                      <h3 className="font-semibold">{style.name}</h3>
                      <p className="text-sm text-muted-foreground">{style.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Custom prompt (optional)</label>
              <Textarea value={customPrompt} onChange={(e) => setCustomPrompt(e.target.value)} className="w-full h-12 resize-none text-foreground" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('mode')} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button onClick={generateImage} disabled={isGenerating} className="flex-1">
                {isGenerating ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Generating...</>) : 'Generate Image'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && generatedImage && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Review and Confirm</h2>
            <img src={generatedImage} alt="Generated" className="w-full rounded-lg" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={() => setStep('style')} variant="outline" className="flex-1"><RefreshCw className="w-4 h-4 mr-2" />Regenerate</Button>
              <Button onClick={() => downloadBlobUrl(generatedImage, `product-image-${Date.now()}.png`)} className="flex-1"><Download className="w-4 h-4 mr-2" />Download Image</Button>
              {mode === 'photovideo' && (
                <Button onClick={confirmAndMaybeCreateVideo} className="flex-1"><Play className="w-4 h-4 mr-2" />Confirm & Create Video</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'video_generating' && (
        <div className="max-w-xl mx-auto text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Creating your 5s 720p video...</p>
        </div>
      )}

      {step === 'video_ready' && videoUrl && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Your Video</h2>
            <video controls className="w-full rounded-lg" src={videoUrl} />
            <div className="flex gap-3">
              <Button onClick={() => window.open(videoUrl, '_blank')} className="flex-1"><Download className="w-4 h-4 mr-2" />Download Video</Button>
              <Button variant="outline" onClick={() => setStep('confirm')} className="flex-1">Back to Image</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductWizard;

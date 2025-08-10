import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useStyles } from '@/hooks/useStyles';
import { Upload, RefreshCw, Download, Play, ArrowLeft } from 'lucide-react';
import { usePrompt } from '@/hooks/usePrompts';

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
  | 'video_options'
  | 'video_prompt'
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
  const [sourceImageUrl, setSourceImageUrl] = useState<string>('');
  const [finalImageUrl, setFinalImageUrl] = useState<string>('');
  const [videoPrompt, setVideoPrompt] = useState<string>('');
  const [isFetchingMotion, setIsFetchingMotion] = useState<boolean>(false);

  // Video options data and selections
  const CAMERA_MOVEMENTS = [
    { name: 'Pan', description: 'Move the view horizontally (left or right).' },
    { name: 'Tilt', description: 'Move the view vertically (up or down).' },
    { name: 'Zoom In', description: 'Gradually move closer to the subject.' },
    { name: 'Zoom Out', description: 'Gradually move further away from the subject.' },
    { name: 'Dolly In', description: 'Simulate moving the camera physically forward, changing perspective.' },
    { name: 'Dolly Out', description: 'Simulate moving the camera physically backward, changing perspective.' },
    { name: 'Truck', description: 'Move the entire camera sideways.' },
    { name: 'Pedestal', description: 'Move the camera vertically up or down without tilting.' },
    { name: 'Push-In', description: 'Slow, steady movement toward the subject for drama.' },
    { name: 'Pull-Back', description: 'Slowly moving away from the subject to reveal more.' },
    { name: 'Parallax Shift', description: 'Slight horizontal movement creating depth between foreground and background.' },
    { name: 'Arc Move', description: 'Curved movement around the subject for subtle dynamism.' },
  ] as const;

  const NATURAL_VISUAL_EFFECTS = [
    { name: 'Focus Shift', description: 'Gradually blur one part of the image while bringing another into focus.' },
    { name: 'Depth of Field Blur', description: 'Keep the subject sharp and background slightly blurred.' },
    { name: 'Light Flicker', description: 'Subtle change in brightness as if light is passing through trees or clouds.' },
    { name: 'Lens Flare', description: 'Gentle sun or lamp glare moving with camera shift.' },
    { name: 'Shadow Movement', description: 'Shadows moving across the subject as if from passing objects or sunlight.' },
    { name: 'Natural Vibration', description: 'Small hand-held style shake for realism.' },
    { name: 'Bokeh Glow', description: 'Soft light spots in the blurred background.' },
    { name: 'Vignette Fade', description: 'Subtle darkening of image corners to draw focus to center.' },
    { name: 'Dust Particles', description: 'Tiny particles drifting naturally in the air.' },
    { name: 'Light Leak', description: 'Warm faded color streaks like from old film cameras.' },
  ] as const;

  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedEffects, setSelectedEffects] = useState<string[]>([]);
  const [productInUse, setProductInUse] = useState<boolean>(false);
  const [motionSuggestion, setMotionSuggestion] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories } = useCategories();
  const stylesQuery = useStyles(categoryId);
  const { data: focusSuffixPrompt } = usePrompt('video_focus_suffix');

  const selectedCategory = useMemo(() => categories?.find(c => c.id === categoryId) || null, [categories, categoryId]);
  const styles = stylesQuery.data || [];

  const uploadToStorage = async (file: File, prefix: string) => {
    const ext = (file.name.split('.').pop() || (file.type.split('/')[1])) || 'png';
    const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('style-images').upload(path, file, {
      contentType: file.type || 'image/png',
      upsert: true,
    });
    if (error) throw new Error(error.message);
    const { data: pub } = supabase.storage.from('style-images').getPublicUrl(path);
    return pub.publicUrl;
  };

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
    // Reset any previous video state when a new image is uploaded
    setVideoUrl('');
    setFinalImageUrl('');
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
      // Upload source image to storage and get a public URL
      const url = await uploadToStorage(uploadedImage, 'inputs');
      setSourceImageUrl(url);

      const form = new FormData();
      form.append('image_url', url);
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

    // Reset video-related state for a fresh generation
    setVideoUrl('');
    setFinalImageUrl('');
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

    setIsFetchingMotion(true);
    try {
      // Upload generated image to storage to get a stable public URL
      const blob = await fetch(generatedImage).then(r => r.blob());
      const file = new File([blob], 'generated.png', { type: 'image/png' });
      const finalUrl = await uploadToStorage(file, 'outputs');
      setFinalImageUrl(finalUrl);

      // Ask AI for motion/effects prompt based on the final image
      const motionForm = new FormData();
      motionForm.append('mode', 'motion');
      motionForm.append('image_url', finalUrl);
      const motionRes = await supabase.functions.invoke('analyze-product', { body: motionForm });
      if (motionRes.error) throw new Error(motionRes.error.message);
      const motion = (motionRes.data?.prompt as string) || '';
      setMotionSuggestion(motion.trim());

      // Go to options first; prompt will be generated from chosen options
      setVideoPrompt('');
      setStep('video_options');
    } catch (err) {
      console.error(err);
      toast({ title: 'Prompt generation failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
      setStep('confirm');
    } finally {
      setIsFetchingMotion(false);
    }
  };
  
  const generatePromptFromOptions = () => {
    const parts: string[] = [];
    if (motionSuggestion) parts.push(motionSuggestion.trim());
    if (selectedCamera) parts.push(`Camera movement: ${selectedCamera}.`);
    if (selectedEffects.length) parts.push(`Visual effects: ${selectedEffects.join(', ')}.`);
    if (productInUse) parts.push('Show the product in use naturally (hands or person), while keeping the product as the primary focus.');
    const composed = parts.join('\n').trim();
    setVideoPrompt(composed);
    setStep('video_prompt');
  };

  const generateVideoFromPrompt = async () => {
    if (!finalImageUrl) {
      toast({ title: 'Missing image', description: 'Please confirm the generated image first.', variant: 'destructive' });
      return;
    }

    setStep('video_generating');
    try {
      const focus = (focusSuffixPrompt?.content || 'Focus: Keep attention and camera movement centered on the main product or primary subject. Avoid background distractions. Smooth, subtle motion that highlights the product.');
      const optionParts: string[] = [];
      if (selectedCamera) optionParts.push(`Camera movement: ${selectedCamera}.`);
      if (selectedEffects.length) optionParts.push(`Visual effects: ${selectedEffects.join(', ')}.`);
      if (productInUse) optionParts.push('Show the product in use naturally (hands or person), while keeping the product as the primary focus.');
      const optionsText = optionParts.join(' ');
      const base = (videoPrompt || '').trim();
      const combinedPrompt = [base, optionsText].filter(Boolean).join('\n').trim();
      const promptToSend = `${combinedPrompt}\n${focus}`.trim();
      const start = await supabase.functions.invoke('kie-runway-generate', {
        body: {
          prompt: promptToSend,
          image_url: finalImageUrl,
          quality: '720p',
          duration: 5,
          aspectRatio: '9:16',
        },
      });
      if (start.error) throw new Error(start.error.message);
      const taskId = start.data?.taskId as string | undefined;
      if (!taskId) throw new Error('No taskId returned from KIE');

      setStep('video_generating');

      // Poll status until success
      let attempts = 0;
      const maxAttempts = 90; // up to ~3 minutes
      while (attempts < maxAttempts) {
        attempts++;
        const statusRes = await supabase.functions.invoke('kie-runway-status', { body: { taskId } });
        if (statusRes.error) throw new Error(statusRes.error.message);
        const state = (statusRes.data?.state as string) || 'pending';
        const outUrl = (statusRes.data?.videoUrl as string | undefined) || undefined;
        if (state === 'success' && outUrl) {
          setVideoUrl(outUrl);
          toast({ title: 'Video ready', description: 'Preview your animated video.' });
          setStep('video_ready');
          return;
        }
        if (state === 'fail' || state === 'error') {
          throw new Error('Video generation failed');
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      throw new Error('Video generation timed out');
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

      {step === 'generating' && (
        <div className="max-w-xl mx-auto text-center p-8">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Generating your image...</p>
        </div>
      )}

      {step === 'confirm' && generatedImage && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Review and Confirm</h2>
            <img src={generatedImage} alt="Generated product image" className="w-full rounded-lg" />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button variant="outline" onClick={() => setStep('upload')} className="flex-1"><ArrowLeft className="w-4 h-4 mr-2" />Back to Upload</Button>
              <Button onClick={() => setStep('style')} variant="outline" className="flex-1"><RefreshCw className="w-4 h-4 mr-2" />Regenerate</Button>
              <Button onClick={() => downloadBlobUrl(generatedImage, `product-image-${Date.now()}.png`)} className="flex-1"><Download className="w-4 h-4 mr-2" />Download Image</Button>
              {mode === 'photovideo' && !videoUrl && (
                <Button onClick={confirmAndMaybeCreateVideo} disabled={isFetchingMotion} className="flex-1">
                  {isFetchingMotion ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Preparing prompt...</>) : (<><Play className="w-4 h-4 mr-2" />Validate & Generate Video</>)}
                </Button>
              )}
              {mode === 'photovideo' && videoUrl && (
                <Button onClick={() => window.open(videoUrl, '_blank')} className="flex-1"><Download className="w-4 h-4 mr-2" />Download Video</Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'video_options' && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Video Options</h2>

            <div className="space-y-3">
              <h3 className="font-medium">Camera movement</h3>
              <div className="grid gap-2">
                {CAMERA_MOVEMENTS.map((m) => (
                  <label key={m.name} className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${selectedCamera === m.name ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                    <input
                      type="radio"
                      name="camera"
                      className="mt-1"
                      checked={selectedCamera === m.name}
                      onChange={() => setSelectedCamera(m.name)}
                    />
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-sm text-muted-foreground">{m.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium">Natural visual effects</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {NATURAL_VISUAL_EFFECTS.map((e) => {
                  const checked = selectedEffects.includes(e.name);
                  return (
                    <label key={e.name} className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer ${checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        onChange={() =>
                          setSelectedEffects((prev) =>
                            prev.includes(e.name) ? prev.filter((x) => x !== e.name) : [...prev, e.name]
                          )
                        }
                      />
                      <div>
                        <div className="font-medium">{e.name}</div>
                        <div className="text-sm text-muted-foreground">{e.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="productInUse"
                type="checkbox"
                checked={productInUse}
                onChange={(e) => setProductInUse(e.target.checked)}
              />
              <label htmlFor="productInUse" className="text-sm">Show the product in use (hands/person interacting)</label>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('confirm')} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button className="flex-1" onClick={generatePromptFromOptions}>Generate Video Prompt</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'video_prompt' && (
        <Card className="glass-card max-w-3xl mx-auto">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">Review Video Prompt</h2>
            <p className="text-sm text-muted-foreground">Edit the motion/effects prompt for a 5s 720x1280 video.</p>
            <Textarea value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} className="w-full min-h-[120px] text-foreground" />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('video_options')} className="gap-2"><ArrowLeft className="w-4 h-4" />Back</Button>
              <Button onClick={generateVideoFromPrompt} className="flex-1"><Play className="w-4 h-4 mr-2" />Generate Video</Button>
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

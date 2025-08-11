import React, { useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useStyles } from '@/hooks/useStyles';
import { Upload, RefreshCw, Download, Play, ArrowLeft, Video, MessageSquare, Sparkles, CheckCircle, XCircle } from 'lucide-react';
import { usePrompt } from '@/hooks/usePrompts';

interface VideoPrompt {
  sceneDurationSeconds: number;
  person: {
    name: string;
    description: string;
    actions: string[];
    line: string;
    tone: string;
    speaker: boolean;
  };
  place: {
    description: string;
  };
  additionalInstructions: {
    cameraMovement: string;
    lighting: string;
    backgroundMusic: string;
  };
}

interface AnalysisResult {
  analysis: string;
  suggestedCategoryId: string | null;
  suggestedCategoryName?: string | null;
  confidence?: number | null;
  productProfile?: {
    productName: string;
    category: string | null;
    materials: string[];
    colors: string[];
    features: string[];
    emotionalAppeal: string[];
    trendFit: string | null;
  };
  marketingAngles?: string[];
  targetAudiences?: string[];
  videoPrompts?: VideoPrompt[];
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
  const [videoProvider, setVideoProvider] = useState<'runway' | 'veo3'>('runway');
  const [isGeneratingVideoPrompts, setIsGeneratingVideoPrompts] = useState<boolean>(false);
  const [isGeneratingVideos, setIsGeneratingVideos] = useState<boolean>(false);
  const [generatedVideos, setGeneratedVideos] = useState<Array<{id: string, url: string | null, status: string}>>([]);
  const [videoTaskIds, setVideoTaskIds] = useState<string[]>([]);

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
      
      // Generate video prompts after analysis
      await generateVideoPrompts(result);
      
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

      // Go to options first; ensure image URL is ready
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
  
  const generatePromptFromOptions = async () => {
    try {
      setIsFetchingMotion(true);
      
      if (!finalImageUrl) {
        throw new Error('Image not ready. Please go back and confirm the image.');
      }

      // Build context from selected options to inform the AI
      const parts: string[] = [];
      if (selectedCamera) parts.push(`Camera movement: ${selectedCamera}`);
      if (selectedEffects.length) parts.push(`Visual effects: ${selectedEffects.join(', ')}`);
      if (productInUse) parts.push('Show the product in use naturally (hands or person), while keeping the product as the primary focus');
      
      const optionsContext = parts.length > 0 ? parts.join('. ') + '.' : '';
      
      // Generate AI prompt with options context
      const motionForm = new FormData();
      motionForm.append('mode', 'motion');
      motionForm.append('image_url', finalImageUrl);
      if (optionsContext) {
        motionForm.append('options_context', optionsContext);
      }
      
      const motionRes = await supabase.functions.invoke('analyze-product', { body: motionForm });
      if (motionRes.error) throw new Error(motionRes.error.message);
      
      const aiGeneratedPrompt = (motionRes.data?.prompt as string) || '';
      setVideoPrompt(aiGeneratedPrompt.trim());
      setStep('video_prompt');
    } catch (err) {
      console.error(err);
      toast({ title: 'Prompt generation failed', description: err instanceof Error ? err.message : 'Try again.', variant: 'destructive' });
    } finally {
      setIsFetchingMotion(false);
    }
  };

  const generateVideoPrompts = async (analysisResult: AnalysisResult) => {
    if (!analysisResult.productProfile) return;
    
    setIsGeneratingVideoPrompts(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-video-prompts', {
        body: {
          productProfile: analysisResult.productProfile,
          analysis: analysisResult.analysis,
          marketingAngles: analysisResult.marketingAngles,
          targetAudiences: analysisResult.targetAudiences,
        },
      });
      
      if (error) throw new Error(error.message);
      
      const videoPrompts = data?.videoPrompts as VideoPrompt[];
      if (videoPrompts && Array.isArray(videoPrompts)) {
        setAnalysis(prev => prev ? { ...prev, videoPrompts } : prev);
      }
    } catch (err) {
      console.error('Failed to generate video prompts:', err);
      // Don't show error toast as this is supplementary feature
    } finally {
      setIsGeneratingVideoPrompts(false);
    }
  };

  const generateAllVideos = async () => {
    if (!analysis?.videoPrompts?.length) {
      toast({ title: 'No prompts available', description: 'Please generate video prompts first.', variant: 'destructive' });
      return;
    }

    setIsGeneratingVideos(true);
    const taskIds: string[] = [];
    const videoStates: Array<{id: string, url: string | null, status: string}> = [];

    try {
      // Start all video generations simultaneously
      for (let i = 0; i < analysis.videoPrompts.length; i++) {
        const prompt = analysis.videoPrompts[i];
        
        // Convert the structured prompt to a text description for VEO3
        const textPrompt = `${prompt.person.description} ${prompt.person.actions.join(', ')}. Setting: ${prompt.place.description}. The person says: "${prompt.person.line}" in a ${prompt.person.tone} tone. Camera: ${prompt.additionalInstructions.cameraMovement}. Lighting: ${prompt.additionalInstructions.lighting}. Duration: ${prompt.sceneDurationSeconds} seconds.`;
        
        console.log(`Starting video generation ${i + 1} with prompt:`, textPrompt);
        
        const startRes = await supabase.functions.invoke('kie-veo-generate', {
          body: {
            prompt: textPrompt,
            model: 'veo3_fast',
            aspectRatio: '9:16',
            enableFallback: false,
          },
        });
        
        if (startRes.error) {
          throw new Error(`Video ${i + 1} generation failed: ${startRes.error.message}`);
        }
        
        const taskId = startRes.data?.taskId as string;
        if (!taskId) {
          throw new Error(`No taskId returned for video ${i + 1}`);
        }
        
        taskIds.push(taskId);
        videoStates.push({
          id: taskId,
          url: null,
          status: 'pending'
        });
      }
      
      setVideoTaskIds(taskIds);
      setGeneratedVideos(videoStates);
      
      // Monitor all videos
      await monitorVideoGeneration(taskIds);
      
    } catch (err) {
      console.error('Video generation failed:', err);
      toast({ 
        title: 'Video generation failed', 
        description: err instanceof Error ? err.message : 'Please try again.', 
        variant: 'destructive' 
      });
    } finally {
      setIsGeneratingVideos(false);
    }
  };

  const monitorVideoGeneration = async (taskIds: string[]) => {
    const maxAttempts = 90; // ~3 minutes total
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      let allCompleted = true;
      
      // Check status of all videos
      for (let i = 0; i < taskIds.length; i++) {
        const taskId = taskIds[i];
        
        try {
          const statusRes = await supabase.functions.invoke('kie-veo-status', { 
            body: { taskId } 
          });
          
          if (statusRes.error) {
            console.error(`Status check failed for video ${i + 1}:`, statusRes.error);
            continue;
          }
          
          const state = statusRes.data?.state as string;
          const videoUrl = statusRes.data?.videoUrl as string;
          
          // Update video state
          setGeneratedVideos(prev => 
            prev.map(video => 
              video.id === taskId 
                ? { 
                    ...video, 
                    status: state, 
                    url: state === 'success' ? videoUrl : null 
                  }
                : video
            )
          );
          
          if (state === 'pending' || state === 'processing') {
            allCompleted = false;
          } else if (state === 'fail' || state === 'error') {
            toast({
              title: `Video ${i + 1} failed`,
              description: 'This video generation encountered an error.',
              variant: 'destructive'
            });
          } else if (state === 'success' && videoUrl) {
            console.log(`Video ${i + 1} completed successfully`);
          }
          
        } catch (err) {
          console.error(`Error checking status for video ${i + 1}:`, err);
          allCompleted = false;
        }
      }
      
      if (allCompleted) {
        const successCount = generatedVideos.filter(v => v.status === 'success').length;
        toast({
          title: 'Video generation complete!',
          description: `${successCount} out of 3 videos generated successfully.`
        });
        break;
      }
      
      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    if (attempts >= maxAttempts) {
      toast({
        title: 'Generation timeout',
        description: 'Some videos may still be processing. Check back later.',
        variant: 'destructive'
      });
    }
  };

  const generateVideoFromPrompt = async () => {
    if (!finalImageUrl && videoProvider === 'runway') {
      toast({ title: 'Missing image', description: 'Please confirm the generated image first.', variant: 'destructive' });
      return;
    }

    setStep('video_generating');
    try {
      const focus = (focusSuffixPrompt?.content || 'Focus: Keep attention and camera movement centered on the main product or primary subject. Avoid background distractions. Smooth, subtle motion that highlights the product.');

      const base = (videoPrompt || '').trim();
      const promptToSend = `${base}\n${focus}`.trim();

      if (videoProvider === 'veo3') {
        const start = await supabase.functions.invoke('kie-veo-generate', {
          body: {
            prompt: promptToSend,
            model: 'veo3_fast',
            aspectRatio: '9:16',
            enableFallback: false,
          },
        });
        if (start.error) throw new Error(start.error.message);
        const taskId = start.data?.taskId as string | undefined;
        if (!taskId) throw new Error('No taskId returned from KIE VEO');

        let attempts = 0;
        const maxAttempts = 90;
        while (attempts < maxAttempts) {
          attempts++;
          const statusRes = await supabase.functions.invoke('kie-veo-status', { body: { taskId } });
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
      } else {
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
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent grid place-items-center">
              <Video className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">Product Content Generator</span>
          </div>
          <nav className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="hidden sm:inline-flex">Motion Generator</Button>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">AI Chat</Button>
            <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">admin ?</a>
          </nav>
        </header>

        <div className="text-center space-y-3">
          <span className="inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
            <Sparkles className="h-3 w-3" /> AI-Powered Video Creation
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
            Turn Your Simple Product Photos into
            <span className="block gradient-text">Viral Video Content</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Upload a product image and our AI will analyze it, craft a compelling prompt, and generate a professional video in minutes.
          </p>
        </div>

      {step === 'upload' && (
        <Card className="glass-card max-w-3xl mx-auto">
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
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Product Intelligence
            </h2>
            <p className="text-muted-foreground">AI-powered analysis and strategic insights</p>
          </div>

          {/* Modern Product Profile Card */}
          <Card className="glass-card backdrop-blur-lg bg-gradient-to-br from-background/90 to-background/60 border-primary/20 overflow-hidden">
            <CardContent className="p-0">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 border-b border-primary/10">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-lg">
                    <Sparkles className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      Product Intelligence
                    </h3>
                    <p className="text-base text-muted-foreground font-medium">AI-powered comprehensive analysis</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Core Info Grid - Same Line, Bigger Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 grid place-items-center">
                      <span className="text-primary font-bold text-lg">📦</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Product</p>
                      <p className="font-bold text-sm truncate">{analysis.productProfile?.productName || productName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                    <div className="h-10 w-10 rounded-lg bg-primary/20 grid place-items-center">
                      <span className="text-primary font-bold text-lg">🏷️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Category</p>
                      <p className="font-bold text-sm truncate">{analysis.productProfile?.category || '—'}</p>
                    </div>
                  </div>

                  {analysis.productProfile?.trendFit ? (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 grid place-items-center">
                        <span className="text-primary font-bold text-lg">🔥</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Trend</p>
                        <p className="font-bold text-sm truncate">{analysis.productProfile.trendFit}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-secondary/5 to-muted/5 border border-secondary/10 opacity-50">
                      <div className="h-10 w-10 rounded-lg bg-secondary/20 grid place-items-center">
                        <span className="text-muted-foreground font-bold text-lg">✨</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Trend</p>
                        <p className="font-bold text-sm text-muted-foreground">Not detected</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Attributes Section */}
                <div className="space-y-4">
                  {/* Features */}
                  {analysis.productProfile?.features?.length ? (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded bg-primary/20 grid place-items-center">
                          <span className="text-xs">⚙️</span>
                        </div>
                        <span className="font-medium text-sm">Features</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.productProfile.features.slice(0, 6).map((f, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors">
                            {f}
                          </span>
                        ))}
                        {analysis.productProfile.features.length > 6 && (
                          <span className="px-3 py-1.5 rounded-full bg-muted/20 text-muted-foreground text-xs font-medium">
                            +{analysis.productProfile.features.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Appeal */}
                  {analysis.productProfile?.emotionalAppeal?.length ? (
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-6 w-6 rounded bg-primary/20 grid place-items-center">
                          <span className="text-xs">💝</span>
                        </div>
                        <span className="font-medium text-sm">Appeal</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.productProfile.emotionalAppeal.slice(0, 4).map((e, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors">
                            {e}
                          </span>
                        ))}
                        {analysis.productProfile.emotionalAppeal.length > 4 && (
                          <span className="px-3 py-1.5 rounded-full bg-muted/20 text-muted-foreground text-xs font-medium">
                            +{analysis.productProfile.emotionalAppeal.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Target Audiences Compact */}
                {analysis.targetAudiences?.length ? (
                  <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-6 w-6 rounded bg-primary/20 grid place-items-center">
                        <span className="text-xs">🎯</span>
                      </div>
                      <span className="font-medium text-sm">Target Audiences</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.targetAudiences.map((audience, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors">
                          {audience}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}


                {/* Video Prompts Section */}
                {analysis.videoPrompts?.length ? (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shadow-md">
                        <Video className="h-4 w-4 text-white" />
                      </div>
                      <h3 className="text-lg font-bold">Video Prompts</h3>
                      <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">
                        AI Generated
                      </span>
                    </div>
                    <div className="grid gap-4">
                      {analysis.videoPrompts.map((prompt, index) => (
                        <div key={index} className="p-4 rounded-lg bg-background/50 border border-primary/10 space-y-3">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-semibold text-primary">Prompt {index + 1}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              {prompt.sceneDurationSeconds}s
                            </span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Person:</p>
                              <p className="text-xs mb-1">{prompt.person.name} - {prompt.person.description}</p>
                              <p className="text-xs italic">"{prompt.person.line}" ({prompt.person.tone})</p>
                              <p className="text-xs text-muted-foreground mt-1">Actions: {prompt.person.actions.join(', ')}</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground mb-1">Setting:</p>
                              <p className="text-xs mb-2">{prompt.place.description}</p>
                              <p className="font-medium text-muted-foreground mb-1">Technical:</p>
                              <p className="text-xs">Camera: {prompt.additionalInstructions.cameraMovement}</p>
                              <p className="text-xs">Lighting: {prompt.additionalInstructions.lighting}</p>
                              <p className="text-xs">Music: {prompt.additionalInstructions.backgroundMusic}</p>
                            </div>
                          </div>
                        </div>
                       ))}
                     </div>
                     
                     {/* Video Generation Button and Status */}
                     <div className="mt-6 pt-4 border-t border-primary/10">
                       {!isGeneratingVideos && generatedVideos.length === 0 && (
                         <Button 
                           onClick={generateAllVideos}
                           className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 gap-2"
                           size="lg"
                         >
                           <Video className="w-5 h-5" />
                           Generate 3 Videos with VEO3
                         </Button>
                       )}
                       
                       {isGeneratingVideos && (
                         <div className="space-y-4">
                           <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-background/50 border border-primary/20">
                             <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                             <span className="text-sm font-medium">Generating videos...</span>
                           </div>
                           
                           <div className="grid gap-3">
                             {generatedVideos.map((video, index) => (
                               <div key={video.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-primary/10">
                                 <span className="text-sm font-medium">Video {index + 1}</span>
                                 <div className="flex items-center gap-2">
                                   {video.status === 'pending' || video.status === 'processing' ? (
                                     <>
                                       <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                                       <span className="text-xs text-muted-foreground">{video.status}</span>
                                     </>
                                   ) : video.status === 'success' ? (
                                     <>
                                       <CheckCircle className="h-4 w-4 text-green-500" />
                                       <span className="text-xs text-green-600">Complete</span>
                                     </>
                                   ) : video.status === 'fail' || video.status === 'error' ? (
                                     <>
                                       <XCircle className="h-4 w-4 text-red-500" />
                                       <span className="text-xs text-red-600">Failed</span>
                                     </>
                                   ) : (
                                     <span className="text-xs text-muted-foreground">Waiting</span>
                                   )}
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                       
                       {!isGeneratingVideos && generatedVideos.length > 0 && (
                         <div className="space-y-4">
                           <div className="flex items-center justify-between">
                             <h4 className="text-sm font-semibold">Generated Videos</h4>
                             <Button 
                               onClick={generateAllVideos}
                               variant="outline"
                               size="sm"
                               className="gap-2"
                             >
                               <RefreshCw className="w-4 h-4" />
                               Regenerate
                             </Button>
                           </div>
                           
                           <div className="grid md:grid-cols-3 gap-4">
                             {generatedVideos.map((video, index) => (
                               <div key={video.id} className="p-4 rounded-lg bg-background/50 border border-primary/10">
                                 <div className="flex items-center justify-between mb-3">
                                   <span className="text-sm font-medium">Video {index + 1}</span>
                                   <span className={`text-xs px-2 py-1 rounded-full ${
                                     video.status === 'success' ? 'bg-green-100 text-green-700' :
                                     video.status === 'fail' || video.status === 'error' ? 'bg-red-100 text-red-700' :
                                     'bg-yellow-100 text-yellow-700'
                                   }`}>
                                     {video.status}
                                   </span>
                                 </div>
                                 
                                 {video.url && video.status === 'success' && (
                                   <div className="relative w-full mx-auto" style={{ aspectRatio: '9/16', maxWidth: '200px' }}>
                                     <video 
                                       src={video.url} 
                                       controls 
                                       className="w-full h-full rounded-lg object-cover"
                                       style={{ aspectRatio: '9/16' }}
                                     >
                                       Your browser does not support the video tag.
                                     </video>
                                   </div>
                                 )}
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                     </div>
                   </div>
                 ) : isGeneratingVideoPrompts ? (
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/10 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-sm font-medium">Generating video prompts...</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Creating VEO3 prompts based on your product analysis</p>
                  </div>
                ) : null}

                {/* CHOOSE CATEGORY - Prominent Section */}
                <div className="border-2 border-primary/30 rounded-xl p-6 bg-gradient-to-r from-primary/5 to-accent/5 shadow-lg">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shadow-md">
                        <span className="text-white font-bold text-lg">📂</span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground">Choose Category</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Select the best matching category for your product</p>
                  </div>
                  
                  <div className="space-y-4">
                    <select
                      className="w-full bg-background border-2 border-primary/20 rounded-lg p-4 font-semibold text-base focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                    >
                      <option value="" className="text-muted-foreground">🔍 Select a category...</option>
                      {categories?.map(c => (
                        <option key={c.id} value={c.id} className="font-medium">{c.name}</option>
                      ))}
                    </select>
                    
                    {typeof analysis.confidence === 'number' && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-primary/10">
                        <span className="text-sm font-medium text-muted-foreground">AI Confidence</span>
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-24 bg-secondary/30 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                              style={{ width: `${analysis.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-primary">{(analysis.confidence * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Summary */}
          <Card className="glass-card backdrop-blur-lg bg-gradient-to-br from-background/80 to-background/40 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Product Summary</h3>
                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary font-medium">Editable</span>
              </div>
              <Textarea
                value={analysis.analysis}
                onChange={(e) => setAnalysis(prev => prev ? { ...prev, analysis: e.target.value } : prev)}
                className="w-full min-h-[100px] bg-background/50 backdrop-blur-sm border-primary/20 focus:border-primary/40 resize-none"
                placeholder="AI-generated product analysis..."
              />
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center pt-4">
            <Button variant="outline" onClick={() => setStep('upload')} className="gap-2 px-6">
              <ArrowLeft className="w-4 h-4" />Back to Upload
            </Button>
            <Button onClick={proceedAfterCategory} className="gap-2 px-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
              Continue to Style Selection
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>
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
                  {isFetchingMotion ? (<><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Preparing...</>) : (<>Select Video Options</>)}
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
            <div className="space-y-2">
              <h3 className="font-medium">Generator</h3>
              <div className="flex gap-2">
                <Button
                  variant={videoProvider === 'runway' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVideoProvider('runway')}
                >
                  Runway
                </Button>
                <Button
                  variant={videoProvider === 'veo3' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVideoProvider('veo3')}
                >
                  VEO 3
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Runway animates your uploaded image. VEO 3 creates video from the prompt.</p>
            </div>
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
            <div className="space-y-2">
              <h3 className="font-medium">Generator</h3>
              <div className="flex gap-2">
                <Button
                  variant={videoProvider === 'runway' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVideoProvider('runway')}
                >
                  Runway
                </Button>
                <Button
                  variant={videoProvider === 'veo3' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setVideoProvider('veo3')}
                >
                  VEO 3
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Choose which provider to use for this video.</p>
            </div>
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

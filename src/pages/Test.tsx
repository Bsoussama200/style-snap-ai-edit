import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const randomId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const Test: React.FC = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const pollingRef = useRef<number | null>(null);

  const addLog = (msg: string) => setLogs((l) => [new Date().toLocaleTimeString() + ": " + msg, ...l]);

  useEffect(() => {
    document.title = "4o Image Test | KIE Image Generation";
    const meta = document.querySelector('meta[name="description"]') || document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'Test KIE 4o Image generation: upload an image and enter a prompt to generate a scene.');
    document.head.appendChild(meta);

    const canonical = document.querySelector('link[rel="canonical"]') || document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', window.location.origin + '/test');
    document.head.appendChild(canonical);

    return () => {
      if (pollingRef.current) window.clearInterval(pollingRef.current);
    };
  }, []);

  const handleUploadAndGenerate = async () => {
    try {
      if (!file) {
        toast({ title: "No file selected", description: "Please choose an image to upload." });
        return;
      }
      if (!prompt.trim()) {
        toast({ title: "Enter a prompt", description: "Describe the scene you want to generate." });
        return;
      }

      setUploading(true);
      setImageUrl(null);
      setTaskId(null);
      setStatus('uploading');
      addLog('Uploading image to storage...');

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpeg';
      const path = `inputs/${randomId()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('style-images').upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('style-images').getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Failed to resolve public URL');

      addLog('Starting KIE 4o Image generation...');
      setUploading(false);
      setGenerating(true);
      setStatus('starting');

      const gen = await supabase.functions.invoke('kie-4o-image-generate', {
        body: { prompt, inputImage: publicUrl },
      });
      if (gen.error) throw new Error(gen.error.message || 'Failed to invoke generate');

      const tid = (gen.data as any)?.taskId as string | undefined;
      if (!tid) throw new Error('No taskId from generate');
      setTaskId(tid);
      addLog(`Task created: ${tid}`);

      // Poll status
      setStatus('pending');
      let attempts = 0;
      const max = 300; // ~10 minutes
      pollingRef.current = window.setInterval(async () => {
        attempts++;
        try {
          const st = await supabase.functions.invoke('kie-4o-image-status', { body: { taskId: tid } });
          if (st.error) throw st.error;
          const d: any = st.data;
          const imageUrl = d?.response?.resultUrls?.[0];
          addLog(`status: successFlag=${d?.successFlag} msg=${d?.errorMessage || ''} imageUrl=${imageUrl || 'none'}`);
          if (d?.successFlag === 1 && imageUrl) {
            setGenerating(false);
            setStatus('success');
            setImageUrl(imageUrl as string);
            addLog('Image ready!');
            if (pollingRef.current) window.clearInterval(pollingRef.current);
          } else if (d?.successFlag === -1) {
            setGenerating(false);
            setStatus('error');
            addLog(`Image generation failed: ${d?.errorMessage || 'unknown error'}`);
            if (pollingRef.current) window.clearInterval(pollingRef.current);
          } else if (attempts >= max) {
            setGenerating(false);
            setStatus('timeout');
            addLog('Timed out waiting for image.');
            if (pollingRef.current) window.clearInterval(pollingRef.current);
          }
        } catch (e: any) {
          setGenerating(false);
          setStatus('error');
          addLog('Polling error: ' + (e?.message || 'unknown'));
          if (pollingRef.current) window.clearInterval(pollingRef.current);
        }
      }, 2000);
    } catch (e: any) {
      setUploading(false);
      setGenerating(false);
      setStatus('error');
      addLog('Error: ' + (e?.message || 'unknown'));
      toast({ title: 'Generation failed', description: e?.message || 'Unknown error' });
    }
  };

  const canSubmit = useMemo(() => !!file && !!prompt.trim() && !uploading && !generating, [file, prompt, uploading, generating]);

  return (
    <div>
      <header className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold">KIE 4o Image Generation Test</h1>
        <p className="mt-1 text-sm opacity-80">Upload an input image and enter a scene prompt to generate a new image via KIE 4o Image API.</p>
      </header>
      <main className="container mx-auto px-4 pb-12">
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Test Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="image">Input Image</Label>
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea id="prompt" placeholder="Describe the scene to generate..." value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={5} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleUploadAndGenerate} disabled={!canSubmit}>
                  {uploading ? 'Uploading...' : generating ? 'Generating...' : 'Generate Image'}
                </Button>
                {taskId && <span className="text-sm opacity-80">Task: {taskId}</span>}
                <span className="text-sm opacity-80">Status: {status}</span>
              </div>

              {imageUrl && (
                <div className="mt-4">
                  <Label>Result</Label>
                  <img src={imageUrl} alt="KIE 4o image generated result" loading="lazy" className="mt-2 max-w-full h-auto rounded" />
                </div>
              )}

              <div className="mt-4">
                <Label>Logs</Label>
                <div className="mt-2 max-h-64 overflow-auto rounded border p-2 text-xs space-y-1">
                  {logs.length === 0 ? <div className="opacity-60">No logs yet</div> : logs.map((l, i) => (<div key={i}>{l}</div>))}
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Test;

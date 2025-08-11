import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrls } = await req.json();
    
    if (!videoUrls || !Array.isArray(videoUrls) || videoUrls.length === 0) {
      return new Response(
        JSON.stringify({ error: 'videoUrls array is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Concatenating ${videoUrls.length} videos using FFmpeg`);

    // Use FFmpeg to concatenate videos
    const tempDir = await Deno.makeTempDir();
    const fileListPath = `${tempDir}/filelist.txt`;
    const outputPath = `${tempDir}/concatenated.mp4`;

    try {
      // Download all video files
      const videoFiles: string[] = [];
      for (let i = 0; i < videoUrls.length; i++) {
        const videoPath = `${tempDir}/video_${i}.mp4`;
        
        console.log(`Downloading video ${i + 1}/${videoUrls.length}`);
        const response = await fetch(videoUrls[i]);
        if (!response.ok) {
          throw new Error(`Failed to download video ${i + 1}: ${response.statusText}`);
        }
        
        const videoData = await response.arrayBuffer();
        await Deno.writeFile(videoPath, new Uint8Array(videoData));
        videoFiles.push(videoPath);
      }

      // Create file list for FFmpeg concat
      const fileListContent = videoFiles.map(file => `file '${file}'`).join('\n');
      await Deno.writeTextFile(fileListPath, fileListContent);

      console.log('Running FFmpeg concatenation...');
      
      // Run FFmpeg to concatenate videos
      const ffmpegProcess = new Deno.Command("ffmpeg", {
        args: [
          "-f", "concat",
          "-safe", "0",
          "-i", fileListPath,
          "-c", "copy",
          "-y", // Overwrite output file
          outputPath
        ],
        stdout: "piped",
        stderr: "piped"
      });

      const { code, stdout, stderr } = await ffmpegProcess.output();
      
      if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr);
        console.error('FFmpeg error:', errorText);
        throw new Error(`FFmpeg failed with code ${code}: ${errorText}`);
      }

      console.log('FFmpeg concatenation completed successfully');

      // Read the concatenated video file
      const concatenatedVideo = await Deno.readFile(outputPath);
      
      // Convert to base64 for response
      const base64Video = btoa(String.fromCharCode(...concatenatedVideo));
      
      // Clean up temp files
      await Deno.remove(tempDir, { recursive: true });

      return new Response(
        JSON.stringify({ 
          videoData: base64Video,
          mimeType: 'video/mp4',
          message: `Successfully concatenated ${videoUrls.length} videos`,
          totalDuration: videoUrls.length * 8
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (ffmpegError) {
      // Clean up temp files on error
      try {
        await Deno.remove(tempDir, { recursive: true });
      } catch {}
      
      console.error('FFmpeg concatenation failed:', ffmpegError);
      
      // Fallback to playlist approach if FFmpeg fails
      const videoPlaylist = videoUrls.map((url, index) => url);
      
      return new Response(
        JSON.stringify({ 
          playlist: videoPlaylist,
          message: `FFmpeg unavailable, returning sequential playlist for ${videoUrls.length} videos`,
          fallback: true
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

  } catch (error) {
    console.error('Error in concatenate-videos function:', error);
    
    // Fallback: return a simple response
    return new Response(
      JSON.stringify({ 
        error: 'Video concatenation temporarily unavailable',
        videoUrl: null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
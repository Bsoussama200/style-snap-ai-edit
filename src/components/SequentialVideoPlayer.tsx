import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SequentialVideoPlayerProps {
  videoUrls: string[];
  onVideoEnd?: (currentIndex: number) => void;
}

const SequentialVideoPlayer: React.FC<SequentialVideoPlayerProps> = ({ 
  videoUrls, 
  onVideoEnd 
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const totalDuration = videoUrls.length * 8; // Each video is 8 seconds
      const currentTime = (currentVideoIndex * 8) + video.currentTime;
      setProgress((currentTime / totalDuration) * 100);
    };

    const handleEnded = () => {
      onVideoEnd?.(currentVideoIndex);
      
      if (currentVideoIndex < videoUrls.length - 1) {
        // Move to next video
        setCurrentVideoIndex(prev => prev + 1);
      } else {
        // All videos finished
        setIsPlaying(false);
        setCurrentVideoIndex(0);
        setProgress(0);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentVideoIndex, videoUrls.length, onVideoEnd]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load the current video
    video.src = videoUrls[currentVideoIndex];
    video.load();

    // Auto-play if we were playing
    if (isPlaying) {
      video.play();
    }
  }, [currentVideoIndex, videoUrls]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentVideoIndex(0);
    setProgress(0);
    setIsPlaying(false);
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
    }
  };

  if (videoUrls.length === 0) {
    return <div>No videos to play</div>;
  }

  return (
    <div className="relative w-full mx-auto" style={{ aspectRatio: '9/16', maxWidth: '400px' }}>
      <video 
        ref={videoRef}
        className="w-full h-full rounded-lg object-cover shadow-lg"
        style={{ aspectRatio: '9/16' }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        Your browser does not support the video tag.
      </video>
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
        {/* Progress Bar */}
        <div className="w-full bg-white/20 rounded-full h-1 mb-3">
          <div 
            className="bg-white h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Video Info */}
        <div className="flex items-center justify-between text-white text-xs mb-2">
          <span>Video {currentVideoIndex + 1} of {videoUrls.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        
        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="text-white hover:bg-white/20"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlayPause}
            className="text-white hover:bg-white/20"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SequentialVideoPlayer;
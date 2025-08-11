import React, { useState, useRef } from 'react';
import { Play, Pause } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  caption?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, caption }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setShowControls(true);
      }
    }
  };

  const handleVideoClick = () => {
    if (!showControls) {
      handlePlayPause();
    }
  };

  if (!videoUrl) {
    return (
      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">Video not available</span>
      </div>
    );
  }

  return (
    <div className="video-element">
      <div 
        className="relative group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleVideoClick}
      >
        <video
          ref={videoRef}
          className="w-full h-auto block"
          preload="metadata"
          playsInline
          muted
          controls={showControls}
          style={{ 
            display: 'block',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none'
          }}
          controlsList="nodownload"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => {
          }}
          onLoadedMetadata={(e) => {
            // Force thumbnail generation on mobile
            const video = e.currentTarget;
            if (video.videoWidth > 0 && video.videoHeight > 0) {
              video.currentTime = 0.1;
            }
          }}
          onLoadedData={(e) => {
            // Ensure first frame is shown
            const video = e.currentTarget;
            video.currentTime = 0.1;
          }}
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          <source src={videoUrl} type="video/mov" />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause Button Overlay */}
        {(!showControls || (showControls && isHovered)) && (
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
              isHovered || !showControls ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ pointerEvents: showControls ? 'none' : 'auto' }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
              style={{ pointerEvents: 'auto' }}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} />}
            </button>
          </div>
        )}
      </div>

      {caption && (
        <p className="text-sm text-gray-600 italic mt-2 text-center">
          {caption}
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;
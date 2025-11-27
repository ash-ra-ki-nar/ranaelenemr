import React, { useState, useRef } from 'react';
import { Play } from 'lucide-react';
import { isArabicText } from '../../utils/imageUtils';

interface VideoPlayerProps {
  videoUrl: string | null;
  caption?: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl, caption }) => {
  const [showOverlay, setShowOverlay] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
      // Hide the overlay after first interaction
      setShowOverlay(false);
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
    <div className="video-element mx-4">
      <div className="relative group cursor-pointer">
        <video
          ref={videoRef}
          className="w-full h-auto block"
          preload="metadata"
          playsInline
          controls
          style={{ 
            display: 'block',
            margin: 0,
            padding: 0,
            border: 'none',
            outline: 'none',
            minHeight: '300px'
          }}
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

        {/* Play Button Overlay - only shown until first interaction */}
        {showOverlay && (
          <div 
            className="absolute inset-0 flex items-center justify-center transition-opacity duration-300 opacity-100 group-hover:opacity-100"
            onClick={handleVideoClick}
          >
            <button
              className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white rounded-full p-4 transition-all duration-200 transform hover:scale-110"
            >
              <Play size={32} />
            </button>
          </div>
        )}
      </div>

      {caption && (
        <p 
          className={`text-sm text-gray-600 italic mt-2 ${isArabicText(caption) ? 'arabic-text' : ''}`}
          style={{ 
            direction: isArabicText(caption) ? 'rtl' : 'ltr',
            textAlign: isArabicText(caption) ? 'right' : 'center'
          }}
        >
          {caption}
        </p>
      )}
    </div>
  );
};

export default VideoPlayer;
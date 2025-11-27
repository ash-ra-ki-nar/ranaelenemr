/**
 * Utility functions for handling image URLs and media
 */

/**
 * Ensures the image URL is properly formatted and accessible
 * @param url - The image URL from the database
 * @returns Properly formatted URL or null if invalid
 */
export const getImageUrl = (url: string | null | undefined): string | null => {
  if (!url || url.trim() === '') {
    return null;
  }

  // Ensure we're using the correct R2 public URL format
  if (url.includes('r2.cloudflarestorage.com')) {
    // Convert old storage URLs to public CDN URLs
    return url.replace(
      'https://197bd1784412aaae4b1982dfb83c5ab0.r2.cloudflarestorage.com/rana-website-media/',
      'https://pub-7c8b6de15604429f91020a1b08796bce.r2.dev/'
    );
  }
  
  // Also handle old incorrect pub URLs
  if (url.includes('pub-197bd1784412aaae4b1982dfb83c5ab0.r2.dev')) {
    return url.replace(
      'https://pub-197bd1784412aaae4b1982dfb83c5ab0.r2.dev/',
      'https://pub-7c8b6de15604429f91020a1b08796bce.r2.dev/'
    );
  }

  return url;
};

/**
 * Creates a fallback image URL for broken images
 * @param width - Image width
 * @param height - Image height
 * @returns Base64 encoded placeholder image
 */
export const getFallbackImageUrl = (width: number = 400, height: number = 300): string => {
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#ffffff"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#000000" text-anchor="middle" dy=".3em">
        No Image Available
      </text>
    </svg>
  `)}`;
};

/**
 * Validates if an image URL is accessible
 * @param url - The image URL to validate
 * @returns Promise that resolves to true if image is accessible
 */
export const validateImageUrl = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Generates a thumbnail from a video URL
 * @param videoUrl - The video URL to generate thumbnail from
 * @returns Promise that resolves to a base64 thumbnail image
 */
export const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';
    video.crossOrigin = 'anonymous';
    
    const cleanup = () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
    
    const generateThumbnail = () => {
      try {
        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          canvas.width = 200;
          canvas.height = 150;
          ctx.drawImage(video, 0, 0, 200, 150);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
          cleanup();
          resolve(thumbnail);
        } else {
          cleanup();
          reject(new Error('No video dimensions'));
        }
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    
    video.oncanplay = () => {
      video.currentTime = 1;
    };
    
    video.onseeked = () => {
      generateThumbnail();
    };
    
    video.onloadeddata = () => {
      if (video.duration > 0) {
        video.currentTime = Math.min(1, video.duration * 0.1);
      } else {
        generateThumbnail();
      }
    };
    
    video.onerror = () => {
      cleanup();
      reject(new Error('Video load failed'));
    };
    
    setTimeout(() => {
      cleanup();
      reject(new Error('Timeout'));
    }, 15000);
    
    video.src = videoUrl;
  });
};

/**
 * Detects if text contains Arabic characters
 * @param text - The text to check
 * @returns true if text contains Arabic characters
 */
export const isArabicText = (text: string): boolean => {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  return arabicRegex.test(text);
};

/**
 * Converts YouTube and Vimeo URLs to embeddable URLs
 * @param url - The original video URL
 * @returns Embeddable URL or original URL if not recognized
 */
export const convertToEmbedUrl = (url: string): string => {
  if (!url) return url;

  // YouTube URL patterns
  const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);
  
  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // Vimeo URL patterns
  const vimeoRegex = /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);
  
  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  // Return original URL if not YouTube or Vimeo
  return url;
};
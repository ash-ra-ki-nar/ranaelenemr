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
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#9ca3af" text-anchor="middle" dy=".3em">
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
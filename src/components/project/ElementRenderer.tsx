import type { SectionElement } from '../../types';

interface ElementRendererProps {
  element: SectionElement;
}

const ElementRenderer = ({ element }: ElementRendererProps) => {
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: element.content || '' }}
          />
        );

      case 'quote':
        return (
          <blockquote className="quote-element border-l-4 border-gray-300 pl-4 italic text-lg text-gray-700">
            {element.content}
          </blockquote>
        );

      case 'image':
        return (
          <div className="image-element">
            {element.media_url ? (
              <div className="relative">
                <img
                  src={element.media_url}
                  alt={element.alt_text || ''}
                  className="w-full h-auto rounded-lg shadow-sm block"
                  onError={(e) => {
                    // Fallback for broken images from Cloudflare R2
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIE5vdCBBdmFpbGFibGU8L3RleHQ+PC9zdmc+';
                  }}
                />
                {element.caption && (
                  <p 
                    className="text-sm text-gray-600 italic mt-2 text-center"
                  >
                    {element.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="video-element">
            {element.media_url ? (
              <div className="relative">
                <div className="relative bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-auto"
                    preload="metadata"
                    playsInline
                    muted
                    style={{ 
                      maxHeight: '70vh', 
                      minHeight: '200px',
                      backgroundColor: '#000'
                    }}
                    controlsList="nodownload"
                    onError={() => {
                      console.error('Video failed to load from Cloudflare R2:', element.media_url);
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
                    <source src={element.media_url} type="video/mp4" />
                    <source src={element.media_url} type="video/webm" />
                    <source src={element.media_url} type="video/mov" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                {element.caption && (
                  <p className="text-sm text-gray-600 italic mt-2 text-center">
                    {element.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Video not available</span>
              </div>
            )}
          </div>
        );

      case 'embed':
        return (
          <div className="embed-element">
            {element.embed_url ? (
              <div className="relative">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <iframe
                    src={element.embed_url}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    title="Embedded content"
                    loading="lazy"
                  />
                </div>
                {element.caption && (
                  <p className="text-sm text-gray-600 italic mt-2 text-center">
                    {element.caption}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-400">Embed not available</span>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-500 text-sm">
              Unknown element type: {element.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="element-container mb-6">
      {renderContent()}
    </div>
  );
};

export default ElementRenderer;
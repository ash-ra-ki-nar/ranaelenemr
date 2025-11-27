import type { SectionElement } from '../../types';
import { getImageUrl, getFallbackImageUrl, isArabicText } from '../../utils/imageUtils';
import VideoPlayer from '../ui/VideoPlayer';

interface ElementRendererProps {
  element: SectionElement;
}

const ElementRenderer = ({ element }: ElementRendererProps) => {
  const renderContent = () => {
    switch (element.type) {
      case 'text':
        const textContent = element.content || '';
        const isRTL = isArabicText(textContent);
        return (
          <div 
            className={`prose prose-lg ${isRTL ? 'arabic-text' : ''}`}
            style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
            dangerouslySetInnerHTML={{ __html: textContent }}
          />
        );

      case 'quote':
        const quoteContent = element.content || '';
        const isQuoteRTL = isArabicText(quoteContent);
        return (
          <blockquote 
            className={`quote-element border-gray-300 italic text-lg text-gray-700 ${
              isQuoteRTL ? 'border-r-4 pr-4 arabic-text' : 'border-l-4 pl-4'
            }`}
            style={{ direction: isQuoteRTL ? 'rtl' : 'ltr', textAlign: isQuoteRTL ? 'right' : 'left' }}
          >
            {quoteContent}
          </blockquote>
        );

      case 'image':
        const imageUrl = getImageUrl(element.media_url);
        return (
          <div className="image-element">
            {imageUrl ? (
              <div className="relative">
                <img
                  src={imageUrl}
                  alt={element.alt_text || ''}
                  className="w-full h-auto rounded-lg block"
                  onError={(e) => {
                    // Fallback for broken images from Cloudflare R2
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImageUrl(400, 300);
                  }}
                />
                {element.caption && (
                  <p 
                    className={`text-sm text-gray-600 italic mt-2 ${isArabicText(element.caption) ? 'arabic-text' : ''}`}
                    style={{ 
                      direction: isArabicText(element.caption) ? 'rtl' : 'ltr',
                      textAlign: isArabicText(element.caption) ? 'right' : 'center'
                    }}
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
        const videoUrl = getImageUrl(element.media_url); // Same function works for videos
        return (
          <VideoPlayer videoUrl={videoUrl} caption={element.caption} />
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
                  <p 
                    className={`text-sm text-gray-600 italic mt-2 ${isArabicText(element.caption) ? 'arabic-text' : ''}`}
                    style={{ 
                      direction: isArabicText(element.caption) ? 'rtl' : 'ltr',
                      textAlign: isArabicText(element.caption) ? 'right' : 'center'
                    }}
                  >
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
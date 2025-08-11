import { useState } from 'react';
import { Edit2, Save, X, Image, Video } from 'lucide-react';
import { elementsApi } from '../../services/api';
import RichTextEditor from './RichTextEditor';
import MediaLibrary from './MediaLibrary';
import type { SectionElement } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils';

interface ElementEditorProps {
  element: SectionElement;
  onUpdate: (element: SectionElement) => void;
  onDelete: (elementId: number) => void;
}

const ElementEditor = ({ element, onUpdate }: ElementEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [content, setContent] = useState(element.content || '');
  const [embedUrl, setEmbedUrl] = useState(element.embed_url || '');
  const [altText, setAltText] = useState(element.alt_text || '');
  const [caption, setCaption] = useState(element.caption || '');
  const [selectedMediaUrl, setSelectedMediaUrl] = useState<string | null>(element.media_url || null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const handleSave = async () => {
    try {
      setLoading(true);

      const updateData: any = {};
      
      // Always include content for text and quote elements
      if (element.type === 'text' || element.type === 'quote') {
        updateData.content = content;
      }
      
      // Always include embed_url for embed elements
      if (element.type === 'embed') {
        updateData.embed_url = embedUrl;
      }
      
      // Include media fields for image and video elements
      if (element.type === 'image' || element.type === 'video') {
        updateData.media_url = selectedMediaUrl;
        updateData.alt_text = altText;
        updateData.caption = caption;
      }

      const updatedElement = await elementsApi.update(element.id, updateData);
      onUpdate(updatedElement);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating element:', error);
      alert('Failed to update element. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form state
    setContent(element.content || '');
    setEmbedUrl(element.embed_url || '');
    setAltText(element.alt_text || '');
    setCaption(element.caption || '');
    setSelectedMediaUrl(element.media_url || null);
    setIsEditing(false);
  };

  const handleMediaSelect = (url: string) => {
    setSelectedMediaUrl(url);
    setShowMediaLibrary(false);
  };

  const renderEditForm = () => {
    switch (element.type) {
      case 'text':
        return (
          <div className="space-y-4">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Enter your text content..."
            />
          </div>
        );

      case 'quote':
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Quote Text</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="input"
              placeholder="Enter your quote..."
            />
          </div>
        );

      case 'image':
      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {element.type === 'image' ? 'Image' : 'Video'}
              </label>
              {selectedMediaUrl ? (
                <div className="relative">
                  {element.type === 'image' ? (
                    <img
                      src={selectedMediaUrl}
                      alt={altText}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJyb2tlbiBJbWFnZTwvdGV4dD48L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <video
                      src={selectedMediaUrl}
                      className="w-full h-48 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <button
                    onClick={() => setSelectedMediaUrl(null)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {element.type === 'image' ? <Image size={48} /> : <Video size={48} />}
                  <p className="text-gray-600 mt-4 mb-4">
                    Use the "Browse Media Library" button above to select or upload media
                  </p>
                  <button
                    onClick={() => setShowMediaLibrary(true)}
                    className="btn btn-secondary"
                  >
                    Browse Media Library
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="input"
                placeholder="Describe the image for accessibility..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input"
                placeholder="Optional caption..."
              />
            </div>
          </div>
        );

      case 'embed':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Embed URL</label>
              <input
                type="url"
                value={embedUrl}
                onChange={(e) => setEmbedUrl(e.target.value)}
                className="input"
                placeholder="https://www.youtube.com/embed/..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Use embed URLs (e.g., YouTube embed, Vimeo embed, etc.)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="input"
                placeholder="Optional caption..."
              />
            </div>

            {embedUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    title="Embed preview"
                  />
                </div>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>Unknown element type: {element.type}</p>
          </div>
        );
    }
  };

  const renderPreview = () => {
    switch (element.type) {
      case 'text':
        return (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: element.content || '<p>No content</p>' }}
          />
        );

      case 'quote':
        return (
          <blockquote className="border-l-4 border-gray-300 pl-4 italic text-lg text-gray-700">
            {element.content || 'No quote text'}
          </blockquote>
        );

      case 'image':
        const imageUrl = getImageUrl(element.media_url);
        return imageUrl ? (
          <div>
            <img
              src={imageUrl}
              alt={element.alt_text || ''}
              className="w-full h-auto rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackImageUrl(200, 150);
              }}
            />
            {element.caption && (
              <p className="text-sm text-gray-600 italic mt-2">{element.caption}</p>
            )}
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No image selected</span>
          </div>
        );

      case 'video':
        const videoUrl = getImageUrl(element.media_url);
        return videoUrl ? (
          <div>
            <video
              src={videoUrl}
              controls
              className="w-full h-auto rounded-lg"
              onError={() => {
              }}
            />
            {element.caption && (
              <p className="text-sm text-gray-600 italic mt-2">{element.caption}</p>
            )}
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No video selected</span>
          </div>
        );

      case 'embed':
        return element.embed_url ? (
          <div>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                src={element.embed_url}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title="Embedded content"
              />
            </div>
            {element.caption && (
              <p className="text-sm text-gray-600 italic mt-2">{element.caption}</p>
            )}
          </div>
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400">No embed URL provided</span>
          </div>
        );

      default:
        return (
          <div className="text-center py-4 text-gray-500">
            <p>Unknown element type: {element.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="element-editor">
      {isEditing ? (
        <div className="space-y-4">
          {/* Media Library Button for image/video elements */}
          {(element.type === 'image' || element.type === 'video') && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="btn btn-secondary btn-sm flex items-center space-x-2"
              >
                {element.type === 'image' ? <Image size={14} /> : <Video size={14} />}
                <span>Browse Media Library</span>
              </button>
            </div>
          )}

          {renderEditForm()}

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="btn btn-primary flex items-center space-x-2"
            >
              {loading && <LoadingSpinner size="sm" />}
              <Save size={16} />
              <span>{loading ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="group relative">
          {renderPreview()}
          <div 
            onClick={() => setIsEditing(true)}
            className="absolute inset-0 bg-blue-600 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100"
          >
            <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
              <Edit2 size={20} />
            </div>
          </div>
        </div>
      )}

      {/* Media Library Modal */}
      <MediaLibrary
        isOpen={showMediaLibrary}
        onClose={() => setShowMediaLibrary(false)}
        onSelect={handleMediaSelect}
        mediaType={element.type === 'video' ? 'video' : 'image'}
      />
    </div>
  );
};

export default ElementEditor;
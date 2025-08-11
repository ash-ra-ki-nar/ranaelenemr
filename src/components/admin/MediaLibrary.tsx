import { useState, useEffect } from 'react';
import { X, Image, Video, Trash2, Search, Upload, Check } from 'lucide-react';
import { mediaApi } from '../../services/api';
import type { MediaItem } from '../../types';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils';

interface MediaLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaId?: number) => void;
  mediaType: 'image' | 'video';
}

const MediaLibrary = ({ isOpen, onClose, onSelect, mediaType }: MediaLibraryProps) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [selectedForDeletion, setSelectedForDeletion] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen, mediaType]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const data = await mediaApi.getAll(mediaType);
      setMedia(data);
    } catch (error) {
      console.error('Error fetching media:', error);
      alert('Failed to load media library. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm('Are you sure you want to delete this media? This will also remove it from R2 storage. This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingIds(prev => new Set(prev).add(mediaId));
      await mediaApi.delete(mediaId);
      setMedia(prev => prev.filter(item => item.id !== mediaId));
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(mediaId);
        return newSet;
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedForDeletion.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedForDeletion.size} media items? This will also remove them from R2 storage. This action cannot be undone.`)) {
      return;
    }

    try {
      const idsToDelete = Array.from(selectedForDeletion);
      setDeletingIds(new Set(idsToDelete));
      
      await mediaApi.deleteMultiple(idsToDelete);
      setMedia(prev => prev.filter(item => !selectedForDeletion.has(item.id)));
      setSelectedForDeletion(new Set());
    } catch (error) {
      console.error('Error deleting media:', error);
      alert('Failed to delete media items. Please try again.');
    } finally {
      setDeletingIds(new Set());
    }
  };

  const handleUpload = async (files: FileList) => {
    try {
      setUploading(true);
      const uploadPromises = Array.from(files).map(file =>
        mediaApi.upload(file)
      );
      
      const uploadedMedia = await Promise.all(uploadPromises);
      setMedia(prev => [...uploadedMedia as any, ...prev]);
      
    } catch (error) {
      console.error('Error uploading media:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleUpload(files);
    }
    // Reset input
    e.target.value = '';
  };

  const filteredMedia = media.filter(item =>
    item.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelection = (mediaId: number) => {
    setSelectedForDeletion(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  const handleSelect = (item: MediaItem) => {
    setSelectedItem(item.id);
    const validatedUrl = getImageUrl(item.url);
    onSelect(validatedUrl || item.url, item.id);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Media Library - {mediaType === 'image' ? 'Images' : 'Videos'}
            </h2>
            {selectedForDeletion.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="btn btn-danger btn-sm flex items-center space-x-2"
                disabled={deletingIds.size > 0}
              >
                <Trash2 size={14} />
                <span>Delete Selected ({selectedForDeletion.size})</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between space-x-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>

            {/* Upload */}
            <div className="flex items-center space-x-2">
              <input
                type="file"
                multiple
                accept={mediaType === 'image' ? 'image/*' : 'video/*'}
                onChange={handleFileInputChange}
                className="hidden"
                id="media-upload"
                disabled={uploading}
              />
              <label
                htmlFor="media-upload"
                className={`btn btn-primary flex items-center space-x-2 ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {uploading ? <LoadingSpinner size="sm" /> : <Upload size={16} />}
                <span>{uploading ? 'Uploading...' : `Upload ${mediaType}s`}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="text-gray-600 mt-4">Loading media...</p>
              </div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                {mediaType === 'image' ? <Image size={48} /> : <Video size={48} />}
                <p className="text-gray-600 mt-4">
                  {searchTerm ? 'No media found matching your search.' : `No ${mediaType}s uploaded yet.`}
                </p>
                {!searchTerm && (
                  <label
                    htmlFor="media-upload"
                    className="btn btn-primary mt-4 cursor-pointer"
                  >
                    Upload {mediaType}s
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selectedItem === item.id ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.id);
                      }}
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedForDeletion.has(item.id)
                          ? 'bg-red-600 border-red-600 text-white'
                          : 'bg-white border-gray-300 hover:border-red-500'
                      }`}
                    >
                      {selectedForDeletion.has(item.id) && <Check size={14} />}
                    </button>
                  </div>

                  {/* Media Preview */}
                  <div
                    onClick={() => handleSelect(item)}
                    className="aspect-square bg-gray-100 flex items-center justify-center"
                  >
                    {item.file_type === 'image' ? (
                      <img
                        src={getImageUrl(item.url) || getFallbackImageUrl(200, 200)}
                        alt={item.original_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = getFallbackImageUrl(200, 200);
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Video size={32} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    disabled={deletingIds.has(item.id)}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingIds.has(item.id) ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 size={14} />
                    )}
                  </button>

                  {/* File Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs truncate" title={item.original_name}>
                      {item.original_name}
                    </p>
                    <p className="text-xs text-gray-300">
                      {(item.file_size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MediaLibrary;
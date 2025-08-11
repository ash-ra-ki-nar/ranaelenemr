import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { aboutApi } from '../../services/api';
import type { About } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import RichTextEditor from '../../components/admin/RichTextEditor';

const AboutEditor = () => {
  const navigate = useNavigate();
  
  const [, setAbout] = useState<About | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Create a custom event to notify about page updates
  const dispatchUpdateEvent = () => {
    window.dispatchEvent(new CustomEvent('aboutContentUpdated'));
  };

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aboutApi.get();
      setAbout(data);
      setContent(data.content || '');
    } catch (err) {
      // If no about page exists, start with empty content
      setAbout(null);
      setContent('<p>Welcome to my portfolio. Tell your story here...</p>');
      console.log('No about page found, starting with empty content');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const savedAbout = await aboutApi.update(content);
      setAbout(savedAbout);
      setSuccessMessage('About page saved successfully!');
      dispatchUpdateEvent(); // Notify about page to refresh
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError('Failed to save about page. Please try again.');
      console.error('Error saving about page:', err);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading about page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Edit About Page
              </h1>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="text-green-600 mr-3">✓</div>
              <p className="text-green-800 font-medium">{successMessage}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        {/* About Content Editor */}
        <div className="card p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-2">About Page Content</h2>
            <p className="text-sm text-gray-600">
              Create and edit your about page content. This will be displayed on the public about page.
            </p>
          </div>

          <div className="space-y-4">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Tell your story here... You can add text, images, links, and more."
            />
          </div>

          {/* Preview Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>

          {/* Save Button (Bottom) */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save About Page'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;
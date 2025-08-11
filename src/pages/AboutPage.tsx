import { useState, useEffect, useReducer } from 'react';
import { aboutApi } from '../services/api';
import type { About } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

const AboutPage = () => {
  const [about, setAbout] = useState<About | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshToken, refresh] = useReducer(x => x + 1, 0);

  const fetchAbout = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aboutApi.get();
      setAbout(data);
    } catch (err) {
      setError('Failed to load about content');
      console.error('Error fetching about:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAbout();
  }, [refreshToken]);
  
  // Listen for about content updates
  useEffect(() => {
    const handleUpdate = () => {
      refresh(); // Trigger refresh
    };
    
    window.addEventListener('aboutContentUpdated', handleUpdate);
    
    return () => {
      window.removeEventListener('aboutContentUpdated', handleUpdate);
    };
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error} onRetry={fetchAbout} />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white">
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
        <div className="rich-content">
          {about && about.content ? (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: about.content }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No about content available yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
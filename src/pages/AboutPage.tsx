import { useState, useEffect, useReducer } from 'react';
import { aboutApi } from '../services/api';
import type { About } from '../types';
import SvgLoader from '../components/ui/SvgLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import Footer from '../components/layout/Footer';

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
    return <SvgLoader />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error} onRetry={fetchAbout} />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white flex flex-col">
      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 flex-grow">
        <div className="rich-content mx-auto" style={{ maxWidth: '52rem' }}>
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
          
          {/* Contact Info - Email, Social Icons, and CV in one line */}
          <div className="mt-12 flex flex-col items-center justify-center">
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {/* Email */}
              <a href="mailto:ranaelnemr1@gmail.com" className="text-gray-700 hover:text-primary-600 transition-colors">
                ranaelnemr1@gmail.com
              </a>
              
              {/* Separator */}
              <span className="text-gray-300">|</span>
              
              {/* Social Media Icons */}
              <div className="flex items-center space-x-6">
                <a 
                  href="https://www.instagram.com/rana.elnemr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                  aria-label="Instagram"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                <a 
                  href="https://vimeo.com/user66283766" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-700 hover:text-primary-600 transition-colors"
                  aria-label="Vimeo"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
                  </svg>
                </a>
              </div>
              
              {/* Separator */}
              <span className="text-gray-300">|</span>
              
              {/* CV Link */}
              <a 
                href="https://pub-7c8b6de15604429f91020a1b08796bce.r2.dev/rana%20elnemr%202-page-cv%202025%20.pdf" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                2-page c.v.
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;
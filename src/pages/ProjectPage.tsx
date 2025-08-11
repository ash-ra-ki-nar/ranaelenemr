import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { projectsApi } from '../services/api';
import type { Project } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SectionRenderer from '../components/project/SectionRenderer';
import WavyMarquee from '../components/ui/WavyMarquee';

const ProjectPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getBySlug(slug);
      setProject(data);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage 
          message={error || 'Project not found'} 
          onRetry={fetchProject} 
        />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-white relative">
      {/* Wavy Marquee Effect - Only for coming soon projects */}
      {project.coming_soon && (
        <WavyMarquee text={project.title} />
      )}
      
      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8 relative z-20">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            {!project.coming_soon && (
              <h1 className="text-4xl font-bold text-gray-900 title-font">
                {project.title}
              </h1>
            )}
            <div className="flex items-center space-x-4">
              {/* Date/Year hidden as requested */}
              {project.coming_soon && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  Coming Soon
                </div>
              )}
            </div>
          </div>

          {project.subtitle && (
            <p className="text-xl text-gray-600 mb-6">
              {project.subtitle}
            </p>
          )}

          {/* Category Metadata */}
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <div className="flex items-center">
              <Tag size={16} className="mr-2" />
              {project.category}
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="rich-content">
          {project.sections && project.sections.length > 0 ? (
            <div className="space-y-12">
              {project.sections.map((section) => (
                <SectionRenderer key={section.id} section={section} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No content available for this project yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
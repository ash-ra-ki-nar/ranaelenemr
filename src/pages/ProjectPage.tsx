import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tag } from 'lucide-react';
import { projectsApi } from '../services/api';
import type { Project } from '../types';
import SvgLoader from '../components/ui/SvgLoader';
import ErrorMessage from '../components/ui/ErrorMessage';
import SectionRenderer from '../components/project/SectionRenderer';
import WavyMarquee from '../components/ui/WavyMarquee';
import Footer from '../components/layout/Footer';
import RandomProjectNav from '../components/project/RandomProjectNav';

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
    return <SvgLoader />;
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
    <div className="pt-16 min-h-screen bg-white flex flex-col">
      {/* Wavy Marquee Effect - Only for coming soon projects */
      }
      {project.coming_soon && (
        <WavyMarquee text={project.title} />
      )}
      
      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 relative z-20 flex-grow" style={{ paddingTop: project.coming_soon ? '0' : undefined }}>
        {/* Project Header */}
        {!project.coming_soon && (
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold text-gray-900 title-font">
                {project.title}
              </h1>
              {/* Category Tag - Right Aligned */}
              <div className="flex items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <Tag size={16} className="mr-2" />
                  {project.category}
                </div>
              </div>
            </div>

            {project.subtitle && (
              <p className="text-xl text-gray-600 mb-6">
                {project.subtitle}
              </p>
            )}
          </div>
        )}

        {/* Content Sections - Constrained width */}
        <div className="rich-content mx-auto" style={{ maxWidth: '52rem' }}>
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

      {/* Random Project Navigation - Only show if not coming soon */}
      {!project.coming_soon && (
        <RandomProjectNav currentProjectId={project.id} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ProjectPage;
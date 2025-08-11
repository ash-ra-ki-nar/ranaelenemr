import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../services/api';
import type { Project } from '../types';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import WavyMarquee from '../components/ui/WavyMarquee';
import { getImageUrl, getFallbackImageUrl } from '../utils/imageUtils';
import '../components/ui/ProjectCard.css';

const HomePage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (err) {
      setError('Failed to load projects');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error} onRetry={fetchProjects} />
      </div>
    );
  }

  const worksProjects = projects.filter(p => p.category === 'works');
  const parallelProjects = projects.filter(p => p.category === 'parallel discourses');

  return (
    <div className="pt-16 h-screen flex flex-col relative">
      {/* Scrollable Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 flex-1 min-h-0 relative">
        {/* Works Column */}
        <div className="flex flex-col h-full min-h-0 relative">
          <div className="absolute top-4 left-4 z-50 pointer-events-none">
            <h2 className="text-3xl font-normal text-white title-font">works</h2>
          </div>
          <div className="overflow-y-scroll scrollbar-hide" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {worksProjects.length > 0 ? (
              worksProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="bg-gray-50 p-8">
                  <p className="text-lg mb-2">No works projects yet</p>
                  <p className="text-sm">Add your first project from the admin panel</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Parallel Discourse Column */}
        <div className="flex flex-col h-full min-h-0 relative">
          <div className="absolute top-4 left-4 z-50 pointer-events-none">
            <h2 className="text-3xl font-normal text-white title-font">parallel discourse</h2>
          </div>
          <div className="overflow-y-scroll scrollbar-hide" style={{ maxHeight: 'calc(100vh - 64px)' }}>
            {parallelProjects.length > 0 ? (
              parallelProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="bg-gray-50 p-8">
                  <p className="text-lg mb-2">No parallel discourse projects yet</p>
                  <p className="text-sm">Add your first project from the admin panel</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const imageUrl = getImageUrl(project.main_image_url);
  
  return (
    <Link to={`/project/${project.slug}`} className="block">
      <div className={`project-card-fullwidth ${project.coming_soon ? 'coming-soon-card' : ''} relative group`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={project.title}
            className="w-full h-96 object-cover"
            onError={(e) => {
              // Fallback for broken images
              const target = e.target as HTMLImageElement;
              target.src = getFallbackImageUrl(400, 384);
            }}
          />
        ) : (
          <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image</span>
          </div>
        )}
        
        {/* Coming Soon Wavy Marquee Overlay */}
        {project.coming_soon && (
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-80 transition-opacity duration-300">
            <WavyMarquee text={project.title} />
          </div>
        )}
        
        <div className="project-card-overlay">
          <div className="text-center">
            {!project.coming_soon && (
              <h3 className="project-card-title">{project.title}</h3>
            )}
            {project.coming_soon && (
              <p className="coming-soon-label text-sm font-medium opacity-90 group-hover:opacity-0 transition-opacity duration-300 mt-2">
                Coming Up
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default HomePage;
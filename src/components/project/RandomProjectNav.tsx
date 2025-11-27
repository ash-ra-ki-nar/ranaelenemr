import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../../services/api';
import type { Project } from '../../types';
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils';
import WavyMarquee from '../ui/WavyMarquee';
import '../ui/ProjectCard.css';

interface RandomProjectNavProps {
  currentProjectId: number;
}

const RandomProjectNav = ({ currentProjectId }: RandomProjectNavProps) => {
  const [randomProjects, setRandomProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsApi.getAll();

        // Filter out current project
        const otherProjects = data.filter(p => p.id !== currentProjectId);

        // Randomly select 2 projects
        const shuffled = [...otherProjects].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 2);

        setRandomProjects(selected);
      } catch (err) {
        console.error('Error fetching random projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomProjects();
  }, [currentProjectId]);

  if (loading || randomProjects.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {randomProjects.map((project) => (
          <RandomProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
};

interface RandomProjectCardProps {
  project: Project;
}

const RandomProjectCard = ({ project }: RandomProjectCardProps) => {
  const imageUrl = getImageUrl(project.main_image_url);

  return (
    <Link to={`/project/${project.slug}`} className="block">
      <div
        className={`project-card-fullwidth ${project.coming_soon ? 'coming-soon-card' : ''} relative group`}
        style={{
          height: '220px',
          maxHeight: '220px',
          boxShadow: 'none !important',
          background: 'transparent',
          border: 'none',
          filter: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)';
          e.currentTarget.style.filter = 'none';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.title}
            className="w-full h-full object-cover"
            style={{
              boxShadow: 'none',
              objectFit: 'cover',
              width: '100%',
              height: '100%'
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = getFallbackImageUrl(400, 220);
            }}
          />
        ) : (
          <div className="w-full h-full bg-white flex items-center justify-center">
            <span className="text-black text-sm">No image</span>
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
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RandomProjectNav;

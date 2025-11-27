import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Tag, GripVertical } from 'lucide-react';
import { projectsApi } from '../../services/api';
import type { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import Modal from '../../components/ui/Modal';
import { getImageUrl, getFallbackImageUrl } from '../../utils/imageUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableProjectCard = ({ project, onDelete }: { 
  project: Project; 
  onDelete: (project: Project) => void; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(project.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between min-w-0">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          {/* Drag Handle */}
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical size={20} className="text-gray-400 hover:text-gray-600" />
          </div>
          
          {/* Project Image */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {project.main_image_url ? (
              <img
                src={getImageUrl(project.main_image_url) || getFallbackImageUrl(64, 64)}
                alt={project.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getFallbackImageUrl(64, 64);
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs text-gray-400">No image</span>
              </div>
            )}
          </div>
          
          {/* Project Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start space-x-2 mb-1">
              <h3 className="text-lg font-medium text-gray-900 truncate flex-1 min-w-0 leading-tight">{project.title}</h3>
              {project.coming_soon && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex-shrink-0">
                  Coming Soon
                </span>
              )}
            </div>
            {project.subtitle && (
              <p className="text-sm text-gray-600 truncate mb-1">{project.subtitle}</p>
            )}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{project.year}</span>
              <div className="flex items-center">
                <Tag size={14} className="mr-1" />
                {project.category}
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <Link
            to={`/project/${project.slug}`}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View Project"
          >
            <Eye size={18} />
          </Link>
          <Link
            to={`/admin/projects/${project.id}/edit`}
            className="p-2 text-gray-400 hover:text-green-600 transition-colors"
            title="Edit Project"
          >
            <Edit size={18} />
          </Link>
          <button
            onClick={() => onDelete(project)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Delete Project"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Find which category we're working with
    const activeProject = projects.find(p => String(p.id) === active.id);
    const overProject = projects.find(p => String(p.id) === over.id);
    
    if (!activeProject || !overProject || activeProject.category !== overProject.category) {
      return;
    }

    // Filter projects by category for reordering
    const categoryProjects = projects.filter(p => p.category === activeProject.category);
    const otherProjects = projects.filter(p => p.category !== activeProject.category);

    const oldIndex = categoryProjects.findIndex((project) => String(project.id) === active.id);
    const newIndex = categoryProjects.findIndex((project) => String(project.id) === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const newCategoryProjects = arrayMove(categoryProjects, oldIndex, newIndex);
    const newAllProjects = [...otherProjects, ...newCategoryProjects];
    setProjects(newAllProjects);

    // Update order in backend
    try {
      const projectOrders = newCategoryProjects.map((project, index) => ({
        id: project.id,
        order_index: index,
        category: project.category,
      }));
      
      await projectsApi.reorder(projectOrders);
    } catch (error) {
      console.error('Error updating project order:', error);
      // Revert on error
      fetchProjects();
    }
  };

  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      setDeleting(true);
      await projectsApi.delete(projectToDelete.id);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 mt-4">Loading projects...</p>
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
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Portfolio Dashboard</h1>
            <Link
              to="/admin/projects/new"
              className="btn btn-primary flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Works Projects */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Works ({worksProjects.length})
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={worksProjects.map(p => String(p.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {worksProjects.map((project) => (
                    <SortableProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                  {worksProjects.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500">No works projects yet</p>
                      <Link
                        to="/admin/projects/new"
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                      >
                        Create your first project
                      </Link>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Parallel Discourses Projects */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Parallel Discourses ({parallelProjects.length})
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={parallelProjects.map(p => String(p.id))}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {parallelProjects.map((project) => (
                    <SortableProjectCard
                      key={project.id}
                      project={project}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                  {parallelProjects.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                      <p className="text-gray-500">No parallel discourse projects yet</p>
                      <Link
                        to="/admin/projects/new"
                        className="text-blue-600 hover:text-blue-700 text-sm mt-2 inline-block"
                      >
                        Create your first project
                      </Link>
                    </div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Project"
      >
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{projectToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="btn btn-secondary"
              disabled={deleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="btn btn-danger flex items-center space-x-2"
              disabled={deleting}
            >
              {deleting && <LoadingSpinner size="sm" />}
              <span>{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
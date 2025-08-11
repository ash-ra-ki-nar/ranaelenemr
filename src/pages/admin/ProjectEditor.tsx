import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import { projectsApi } from '../../services/api';
import type { Project } from '../../types';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorMessage from '../../components/ui/ErrorMessage';
import SectionEditor from '../../components/admin/SectionEditor';

const ProjectEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    year: new Date().getFullYear(),
    category: 'works',
    coming_soon: false,
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isEditing && id) {
      fetchProject();
    }
  }, [id, isEditing]);

  const fetchProject = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getById(id);
      setProject(data);
      setFormData({
        title: data.title,
        subtitle: data.subtitle || '',
        year: data.year,
        category: data.category,
        coming_soon: data.coming_soon || false,
      });
      setMainImagePreview(data.main_image_url || null);
    } catch (err) {
      setError('Failed to load project');
      console.error('Error fetching project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setMainImageFile(null);
    setMainImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a project title');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('subtitle', formData.subtitle.trim());
      submitData.append('year', formData.year.toString());
      submitData.append('category', formData.category);
      submitData.append('coming_soon', formData.coming_soon.toString());

      if (mainImageFile) {
        submitData.append('main_image', mainImageFile);
      }

      let savedProject: Project;
      if (isEditing && id) {
        savedProject = await projectsApi.update(id, submitData);
      } else {
        savedProject = await projectsApi.create(submitData);
      }

      navigate(`/admin/projects/${savedProject.id}/edit`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save project');
      console.error('Error saving project:', err);
    } finally {
      setSaving(false);
    }
  };

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
                {isEditing ? 'Edit Project' : 'Create New Project'}
              </h1>
            </div>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="btn btn-primary flex items-center space-x-2"
            >
              {saving && <LoadingSpinner size="sm" />}
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Project'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <ErrorMessage message={error} className="mb-6" />
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input"
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="input"
                  min="1900"
                  max="2100"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="input"
                  required
                >
                  <option value="works">Works</option>
                  <option value="parallel discourses">Parallel Discourses</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="coming_soon"
                  name="coming_soon"
                  checked={formData.coming_soon}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="coming_soon" className="ml-2 block text-sm text-gray-700">
                  Coming Soon
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 mb-2">
                Subtitle
              </label>
              <textarea
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                rows={3}
                className="input"
                placeholder="Optional project subtitle or description"
              />
            </div>
          </div>

          {/* Main Image */}
          <div className="card p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Main Image</h2>
            
            {mainImagePreview ? (
              <div className="relative">
                <img
                  src={mainImagePreview}
                  alt="Main image preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Upload a main image for your project</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="main-image-upload"
                />
                <label
                  htmlFor="main-image-upload"
                  className="btn btn-secondary cursor-pointer"
                >
                  Choose Image
                </label>
              </div>
            )}
          </div>
        </form>

        {/* Content Sections */}
        {isEditing && project && (
          <div className="mt-8">
            <SectionEditor projectId={project.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEditor;
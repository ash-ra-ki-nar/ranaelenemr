import axios from 'axios';
import type { Project, About, MediaItem, Section, SectionElement } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

// Projects API
export const projectsApi = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>('/api/projects');
    return response.data.data || [];
  },

  getById: async (id: number | string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/api/projects/slug/${slug}`);
    return response.data.data;
  },

  create: async (projectData: FormData): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>('/api/projects', projectData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  update: async (id: number | string, projectData: FormData): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(`/api/projects/${id}`, projectData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  delete: async (id: number | string): Promise<void> => {
    await api.delete(`/api/projects/${id}`);
  },

  reorder: async (projectOrders: { id: number; order_index: number; category: string }[]): Promise<void> => {
    await api.post('/api/projects/reorder', { projectOrders });
  },
};

// About API
export const aboutApi = {
  get: async (): Promise<About> => {
    const response = await api.get<ApiResponse<About>>('/api/about');
    return response.data.data;
  },

  update: async (content: string): Promise<About> => {
    const response = await api.put<ApiResponse<About>>('/api/about', { content });
    return response.data.data;
  },
};

// Media API
export const mediaApi = {
  getAll: async (type?: 'image' | 'video'): Promise<MediaItem[]> => {
    const params = type ? { type } : {};
    const response = await api.get<ApiResponse<MediaItem[]>>('/api/media', { params });
    return response.data.data || [];
  },

  upload: async (file: File): Promise<MediaItem> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<MediaItem>>('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/media/${id}`);
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    await Promise.all(ids.map(id => api.delete(`/api/media/${id}`)));
  },
};

// Sections API
export const sectionsApi = {
  create: async (projectId: number, sectionData: { title?: string; columns?: number }): Promise<Section> => {
    const response = await api.post<ApiResponse<Section>>('/api/sections', {
      project_id: projectId,
      ...sectionData,
    });
    return response.data.data;
  },

  update: async (id: number, sectionData: Partial<Section>): Promise<Section> => {
    const response = await api.put<ApiResponse<Section>>(`/api/sections/${id}`, sectionData);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/sections/${id}`);
  },

  reorder: async (sectionId: number, elementOrders: any[]): Promise<void> => {
    await api.post(`/api/sections/${sectionId}/reorder`, { elementOrders });
  },
};

// Elements API
export const elementsApi = {
  create: async (sectionId: number, elementData: Partial<SectionElement>): Promise<SectionElement> => {
    const response = await api.post<ApiResponse<SectionElement>>(`/api/sections/${sectionId}/elements`, elementData);
    return response.data.data;
  },

  update: async (id: number, elementData: Partial<SectionElement>): Promise<SectionElement> => {
    const response = await api.put<ApiResponse<SectionElement>>(`/api/elements/${id}`, elementData);
    return response.data.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/elements/${id}`);
  },
};

export default api;
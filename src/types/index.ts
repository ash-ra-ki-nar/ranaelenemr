export interface Project {
  id: number;
  title: string;
  subtitle?: string;
  year: number;
  category: 'works' | 'parallel discourses';
  main_image_url?: string;
  main_image_key?: string;
  slug: string;
  coming_soon: boolean;
  order_index: number; // For drag-and-drop ordering within category
  works_order?: number; // For works category ordering
  parallel_order?: number; // For parallel discourses category ordering
  created_at: string;
  updated_at: string;
  sections?: Section[];
}

export interface Section {
  id: number;
  project_id: number;
  section_order: number;
  section_type: 'text' | 'image' | 'video' | 'quote' | 'embed';
  title?: string; // Added title field
  columns: number;
  created_at: string;
  updated_at: string;
  elements: SectionElement[];
}

export interface SectionElement {
  id: number;
  section_id: number;
  element_order: number;
  order_index?: number; // Added for drag-and-drop ordering
  column_position: number;
  column_index?: number; // Added for column positioning
  element_type: 'text' | 'image' | 'video' | 'quote' | 'embed';
  type?: 'text' | 'image' | 'video' | 'quote' | 'embed'; // Database field name
  content?: string;
  media_url?: string;
  media_id?: number; // Added for media library integration
  media_key?: string;
  embed_url?: string;
  embed_type?: string;
  alt_text?: string; // Moved from metadata for easier access
  caption?: string; // Moved from metadata for easier access
  metadata?: {
    alt_text?: string;
    caption?: string;
    embed_data?: {
      isValid: boolean;
      embedUrl: string;
      type: string;
      originalUrl: string;
    };
  };
  created_at: string;
  updated_at: string;
}

export interface MediaItem {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  mimetype: string;
  url: string;
  storage_key: string;
  alt_text?: string;
  folder: string;
  created_at: string;
  updated_at: string;
}

export interface About {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ProjectFormData {
  title: string;
  subtitle?: string;
  year: number;
  category: 'works' | 'parallel discourses';
  coming_soon: boolean;
  main_image?: File;
  remove_main_image?: boolean;
  slug: string;
  order_index: number;
}

export interface SectionFormData {
  project_id: number;
  section_type: 'text' | 'image' | 'video' | 'quote' | 'embed';
  columns: number;
}

export interface ElementFormData {
  element_type: 'text' | 'image' | 'video' | 'quote' | 'embed';
  column_position: number;
  content?: string;
  embed_url?: string;
  alt_text?: string;
  caption?: string;
  media_id?: number; // Changed from File to media_id
  remove_media?: boolean;
}
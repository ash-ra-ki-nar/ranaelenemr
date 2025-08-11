import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { uploadToCloudflareR2, deleteFromCloudflareR2 } from './services/cloudflareR2.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        sections (
          *,
          section_elements (
            *
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Sort sections and elements by order
    if (project.sections) {
      project.sections = project.sections
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map(section => ({
          ...section,
          elements: section.section_elements 
            ? section.section_elements.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            : []
        }));
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get project by slug
app.get('/api/projects/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        sections (
          *,
          section_elements (
            *
          )
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) throw error;

    // Sort sections and elements by order
    if (project.sections) {
      project.sections = project.sections
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map(section => ({
          ...section,
          elements: section.section_elements 
            ? section.section_elements.sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            : []
        }));
    }

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new project
app.post('/api/projects', upload.single('main_image'), async (req, res) => {
  try {
    const { title, subtitle, year, category, coming_soon } = req.body;
    
    let main_image_url = null;
    
    // Upload image to Cloudflare R2 if provided
    if (req.file) {
      const uploadResult = await uploadToCloudflareR2(req.file, 'projects');
      main_image_url = uploadResult.url;
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        title,
        subtitle,
        year: parseInt(year),
        category,
        main_image_url,
        slug,
        coming_soon: coming_soon === 'true'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update project
app.put('/api/projects/:id', upload.single('main_image'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, year, category, coming_soon } = req.body;
    
    const updateData = {
      title,
      subtitle,
      year: parseInt(year),
      category,
      coming_soon: coming_soon === 'true'
    };
    
    // Upload new image if provided
    if (req.file) {
      const uploadResult = await uploadToCloudflareR2(req.file, 'projects');
      updateData.main_image_url = uploadResult.url;
    }
    
    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get about content
app.get('/api/about', async (req, res) => {
  try {
    const { data: about, error } = await supabase
      .from('about')
      .select('*')
      .single();

    if (error) throw error;

    res.json({ success: true, data: about });
  } catch (error) {
    console.error('Error fetching about:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update about content
app.put('/api/about', async (req, res) => {
  try {
    const { content } = req.body;
    
    const { data: about, error } = await supabase
      .from('about')
      .upsert({ id: 1, content })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: about });
  } catch (error) {
    console.error('Error updating about:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload media
app.post('/api/media/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    // Upload to Cloudflare R2
    const uploadResult = await uploadToCloudflareR2(req.file, 'media');
    
    // Save to database
    const { data: media, error } = await supabase
      .from('media')
      .insert({
        filename: uploadResult.key.split('/').pop(),
        original_name: uploadResult.originalName,
        file_type: uploadResult.mimetype.startsWith('image/') ? 'image' : 'video',
        file_size: uploadResult.size,
        mimetype: uploadResult.mimetype,
        url: uploadResult.url,
        storage_key: uploadResult.key,
        folder: 'media'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all media
app.get('/api/media', async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = supabase.from('media').select('*').order('created_at', { ascending: false });
    
    if (type) {
      query = query.eq('file_type', type);
    }
    
    const { data: media, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: media });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete media
app.delete('/api/media/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get media info first
    const { data: media, error: fetchError } = await supabase
      .from('media')
      .select('storage_key')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Delete from Cloudflare R2
    if (media.storage_key) {
      await deleteFromCloudflareR2(media.storage_key);
    }
    
    // Delete from database
    const { error } = await supabase
      .from('media')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create section
app.post('/api/sections', async (req, res) => {
  try {
    const { project_id, title, columns } = req.body;
    
    console.log('Creating section:', { project_id, title, columns });
    
    const { data: section, error } = await supabase
      .from('sections')
      .insert({
        project_id: parseInt(project_id),
        title: title || 'New Section',
        columns: parseInt(columns) || 1,
        order_index: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating section:', error);
      throw error;
    }

    console.log('Section created successfully:', section);
    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create section element
app.post('/api/sections/:id/elements', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, content, media_url, alt_text, caption, embed_url, order_index, column_index } = req.body;
    
    console.log('Creating element:', { section_id: id, type, content, column_index });
    
    const { data: element, error } = await supabase
      .from('section_elements')
      .insert({
        section_id: parseInt(id),
        type,
        content: content || '',
        media_url: media_url || null,
        alt_text: alt_text || '',
        caption: caption || '',
        embed_url: embed_url || '',
        order_index: order_index || 0,
        column_index: column_index !== undefined ? column_index : 0
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating element:', error);
      throw error;
    }

    console.log('Element created successfully:', element);
    res.json({ success: true, data: element });
  } catch (error) {
    console.error('Error creating element:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Project reorder endpoint
app.post('/api/projects/reorder', async (req, res) => {
  try {
    const { projectOrders } = req.body;
    
    if (!projectOrders || !Array.isArray(projectOrders)) {
      return res.status(400).json({ success: false, error: 'Invalid project orders data' });
    }

    // Update each project's order
    for (const order of projectOrders) {
      await supabase
        .from('projects')
        .update({ order_index: order.order_index })
        .eq('id', order.id);
    }

    res.json({ success: true, message: 'Project order updated successfully' });
  } catch (error) {
    console.error('Error updating project order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Section and element endpoints
app.put('/api/sections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data: section, error } = await supabase
      .from('sections')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: section });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/sections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/sections/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { elementOrders } = req.body;
    
    if (!elementOrders || !Array.isArray(elementOrders)) {
      return res.status(400).json({ success: false, error: 'Invalid element orders data' });
    }

    // Update each element's order
    for (const order of elementOrders) {
      await supabase
        .from('section_elements')
        .update({ 
          order_index: order.order_index,
          column_index: order.column_index || 0
        })
        .eq('id', order.id);
    }

    res.json({ success: true, message: 'Element order updated successfully' });
  } catch (error) {
    console.error('Error updating element order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/elements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const { data: element, error } = await supabase
      .from('section_elements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: element });
  } catch (error) {
    console.error('Error updating element:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/elements/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('section_elements')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Element deleted successfully' });
  } catch (error) {
    console.error('Error deleting element:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
// Section model for handling rich content sections - adapted from working notebook-frontend
import database from './vercel-supabase.js';

class Section {
  // Create a new section
  static async create(sectionData) {
    try {
      const { project_id, section_type = 'content', columns = 1 } = sectionData;
      
      // Validate columns (1-4 only)
      const validColumns = [1, 2, 3, 4];
      const columnCount = parseInt(columns);
      if (!validColumns.includes(columnCount)) {
        throw new Error(`Invalid column count: ${columnCount}. Must be 1, 2, 3, or 4.`);
      }
      
      // Get the next order number for this project
      const { data: orderData } = await database.supabase
        .from('sections')
        .select('order_index')
        .eq('project_id', project_id)
        .order('order_index', { ascending: false })
        .limit(1);
      
      const section_order = orderData && orderData.length > 0 ? orderData[0].order_index + 1 : 1;
      
      const { data, error } = await database.supabase
        .from('sections')
        .insert([{
          project_id: parseInt(project_id),
          order_index: section_order,
          title: section_type,
          columns: columnCount
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating section:', error);
        throw error;
      }

      // Return section with proper structure and empty elements array for each column
      const elements = [];
      for (let i = 1; i <= columnCount; i++) {
        // Initialize empty column structure
        elements.push({
          column: i,
          elements: []
        });
      }

      return {
        id: data.id,
        project_id: data.project_id,
        section_order: data.order_index,
        section_type: data.title,
        columns: data.columns,
        elements: [], // Will be populated when elements are added
        column_structure: elements, // For frontend column management
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating section:', error);
      throw error;
    }
  }

  // Find section by ID
  static async findById(id) {
    try {
      const { data, error } = await database.supabase
        .from('sections')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error finding section:', error);
        return null;
      }

      if (data) {
        data.elements = await this.getElements(id);
        data.section_order = data.order_index;
        data.section_type = data.title;
      }

      return data;
    } catch (error) {
      console.error('Error finding section by ID:', error);
      return null;
    }
  }

  // Get all sections for a project
  static async findByProjectId(projectId) {
    try {
      const { data, error } = await database.supabase
        .from('sections')
        .select('*')
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching sections:', error);
        return [];
      }

      const sections = data || [];
      
      // Get elements for each section
      for (const section of sections) {
        section.elements = await this.getElements(section.id);
        section.section_order = section.order_index;
        section.section_type = section.title;
      }

      return sections;
    } catch (error) {
      console.error('Error finding sections by project ID:', error);
      return [];
    }
  }

  // Get elements for a section
  static async getElements(sectionId) {
    try {
      const { data, error } = await database.supabase
        .from('section_elements')
        .select('*')
        .eq('section_id', sectionId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching section elements:', error);
        return [];
      }

      const elements = (data || []).map(element => ({
        id: element.id,
        section_id: element.section_id,
        element_order: element.order_index,
        column_position: element.column_index,
        element_type: element.type,
        content: element.content || '',
        media_url: element.media_url,
        media_key: null, // Not stored separately in current schema
        embed_url: element.embed_url || '',
        embed_type: null, // Could be derived from embed_url
        metadata: {
          alt_text: element.alt_text || '',
          caption: element.caption || '',
          embed_data: element.embed_url ? {
            isValid: true,
            embedUrl: element.embed_url,
            type: 'unknown',
            originalUrl: element.embed_url
          } : null
        },
        created_at: element.created_at,
        updated_at: element.updated_at
      }));

      return elements;
    } catch (error) {
      console.error('Error getting elements:', error);
      return [];
    }
  }

  // Add element to section
  static async addElement(sectionId, elementData) {
    try {
      const { 
        element_type, 
        column_position = 1, 
        content = '', 
        media_url, 
        media_key, 
        embed_url = '', 
        embed_type,
        metadata 
      } = elementData;
      
      console.log('Adding element with data:', elementData);
      
      // Validate element type to prevent duplications
      const validElementTypes = ['text', 'image', 'video', 'quote', 'embed'];
      if (!validElementTypes.includes(element_type)) {
        throw new Error(`Invalid element type: ${element_type}. Must be one of: ${validElementTypes.join(', ')}`);
      }
      
      // Get the next order number for this section and column
      const { data: orderData } = await database.supabase
        .from('section_elements')
        .select('order_index')
        .eq('section_id', sectionId)
        .eq('column_index', parseInt(column_position))
        .order('order_index', { ascending: false })
        .limit(1);
      
      const element_order = orderData && orderData.length > 0 ? orderData[0].order_index + 1 : 1;
      
      // Parse metadata for alt_text and caption
      const alt_text = metadata?.alt_text || '';
      const caption = metadata?.caption || '';
      
      // Handle embed URL validation for embed type
      let validatedEmbedUrl = embed_url;
      let embedMetadata = null;
      
      if (element_type === 'embed' && embed_url) {
        const embedValidation = this.validateAndParseEmbed(embed_url);
        if (embedValidation.isValid) {
          validatedEmbedUrl = embedValidation.embedUrl;
          embedMetadata = {
            type: embedValidation.type,
            originalUrl: embedValidation.originalUrl,
            embedUrl: embedValidation.embedUrl
          };
        } else {
          throw new Error(embedValidation.error);
        }
      }
      
      const { data, error } = await database.supabase
        .from('section_elements')
        .insert([{
          section_id: parseInt(sectionId),
          order_index: element_order,
          column_index: parseInt(column_position),
          type: element_type,
          content: content,
          media_url: media_url,
          alt_text: alt_text,
          caption: caption,
          embed_url: validatedEmbedUrl
        }])
        .select()
        .single();

      if (error) {
        console.error('Supabase error adding element:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Element added to database:', data);

      // Transform to match frontend expectations with proper structure
      const transformedElement = {
        id: data.id,
        section_id: data.section_id,
        element_order: data.order_index,
        column_position: data.column_index,
        element_type: data.type,
        content: data.content || '',
        media_url: data.media_url,
        media_key: media_key,
        embed_url: data.embed_url,
        embed_type: embedMetadata?.type || null,
        metadata: {
          alt_text: data.alt_text || '',
          caption: data.caption || '',
          embed_data: embedMetadata
        },
        created_at: data.created_at,
        updated_at: data.updated_at,
        // Add unique identifier to help frontend avoid duplications
        unique_key: `${data.section_id}-${data.type}-${data.order_index}-${data.column_index}`,
        editor_config: {
          type: data.type,
          editorType: data.type === 'text' || data.type === 'quote' ? 'rich-text' : 
                     data.type === 'image' || data.type === 'video' ? 'file-upload' :
                     data.type === 'embed' ? 'embed-url' : 'rich-text'
        }
      };

      console.log('Transformed element for frontend:', transformedElement);
      return transformedElement;
    } catch (error) {
      console.error('Error adding section element:', error);
      throw error;
    }
  }

  // Get element by ID
  static async getElementById(id) {
    try {
      const { data, error } = await database.supabase
        .from('section_elements')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching element:', error);
        return null;
      }

      if (data) {
        return {
          id: data.id,
          section_id: data.section_id,
          element_order: data.order_index,
          column_position: data.column_index,
          element_type: data.type,
          content: data.content || '',
          media_url: data.media_url,
          media_key: null,
          embed_url: data.embed_url || '',
          embed_type: null,
          metadata: {
            alt_text: data.alt_text || '',
            caption: data.caption || '',
            embed_data: data.embed_url ? {
              isValid: true,
              embedUrl: data.embed_url,
              type: 'unknown',
              originalUrl: data.embed_url
            } : null
          },
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting element by ID:', error);
      return null;
    }
  }

  // Update element
  static async updateElement(elementId, elementData) {
    try {
      const updateData = { ...elementData };
      
      // Transform field names for database
      if (updateData.element_type) {
        updateData.type = updateData.element_type;
        delete updateData.element_type;
      }
      if (updateData.column_position) {
        updateData.column_index = updateData.column_position;
        delete updateData.column_position;
      }
      if (updateData.element_order) {
        updateData.order_index = updateData.element_order;
        delete updateData.element_order;
      }
      
      // Handle metadata
      if (updateData.metadata) {
        updateData.alt_text = updateData.metadata.alt_text || '';
        updateData.caption = updateData.metadata.caption || '';
        delete updateData.metadata;
      }
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await database.supabase
        .from('section_elements')
        .update(updateData)
        .eq('id', elementId)
        .select()
        .single();

      if (error) {
        console.error('Error updating element:', error);
        throw error;
      }

      return {
        id: data.id,
        section_id: data.section_id,
        element_order: data.order_index,
        column_position: data.column_index,
        element_type: data.type,
        content: data.content || '',
        media_url: data.media_url,
        media_key: null,
        embed_url: data.embed_url || '',
        embed_type: null,
        metadata: {
          alt_text: data.alt_text || '',
          caption: data.caption || '',
          embed_data: data.embed_url ? {
            isValid: true,
            embedUrl: data.embed_url,
            type: 'unknown',
            originalUrl: data.embed_url
          } : null
        },
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error updating section element:', error);
      throw error;
    }
  }

  // Delete element
  static async deleteElement(elementId) {
    try {
      const { data, error } = await database.supabase
        .from('section_elements')
        .delete()
        .eq('id', elementId)
        .select()
        .single();

      if (error) {
        console.error('Error deleting element:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deleting section element:', error);
      throw error;
    }
  }

  // Update section
  static async update(id, sectionData) {
    try {
      const updateData = { ...sectionData };
      
      // Transform field names
      if (updateData.section_type) {
        updateData.title = updateData.section_type;
        delete updateData.section_type;
      }
      if (updateData.section_order) {
        updateData.order_index = updateData.section_order;
        delete updateData.section_order;
      }
      
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await database.supabase
        .from('sections')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating section:', error);
        throw error;
      }

      return {
        ...data,
        section_order: data.order_index,
        section_type: data.title,
        elements: await this.getElements(id)
      };
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  }

  // Delete section
  static async delete(id) {
    try {
      const { data, error } = await database.supabase
        .from('sections')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error deleting section:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  // Validate embed URL and extract metadata (from original working version)
  static validateAndParseEmbed(url) {
    const embedPatterns = {
      youtube: {
        regex: /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
        getEmbedUrl: (match) => `https://www.youtube.com/embed/${match[1]}?rel=0`,
        type: 'youtube'
      },
      vimeo: {
        regex: /(?:vimeo\.com\/)([0-9]+)/,
        getEmbedUrl: (match) => `https://player.vimeo.com/video/${match[1]}?title=0&byline=0&portrait=0`,
        type: 'vimeo'
      },
      soundcloud: {
        regex: /soundcloud\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_]+)/,
        getEmbedUrl: (match) => `https://w.soundcloud.com/player/?url=${encodeURIComponent('https://' + match[0])}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true`,
        type: 'soundcloud'
      }
    };

    console.log('Validating embed URL:', url);

    for (const [platform, pattern] of Object.entries(embedPatterns)) {
      const match = url.match(pattern.regex);
      if (match) {
        const result = {
          isValid: true,
          embedUrl: pattern.getEmbedUrl(match),
          type: pattern.type,
          originalUrl: url
        };
        console.log(`${platform} embed validated:`, result);
        return result;
      }
    }

    console.log('No embed pattern matched for URL:', url);
    return {
      isValid: false,
      error: 'Unsupported embed URL. Supported platforms: YouTube, Vimeo, SoundCloud'
    };
  }
}

export default Section;
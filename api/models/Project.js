// Project model for handling project operations with sections
import database from './vercel-supabase.js';

class Project {
  static async findById(id) {
    try {
      const project = await database.getProjectById(id);
      if (!project) return null;

      console.log('Getting sections for project:', id);

      // Get sections with elements for this project
      const sections = await Section.findByProjectId(id);
      
      console.log('Found sections:', sections.length);
      console.log('Sections data:', sections);

      project.sections = sections;
      
      console.log('Final project with sections:', {
        id: project.id,
        title: project.title,
        sections_count: project.sections.length
      });
      
      return project;
    } catch (error) {
      console.error('Error finding project by ID:', error);
      return null;
    }
  }

  static async findBySlug(slug) {
    try {
      const project = await database.getProjectBySlug(slug);
      if (!project) return null;

      console.log('Getting sections for project by slug:', slug, 'ID:', project.id);

      // Get sections with elements for this project
      const sections = await Section.findByProjectId(project.id);
      
      console.log('Found sections for slug:', sections.length);

      project.sections = sections;
      return project;
    } catch (error) {
      console.error('Error finding project by slug:', error);
      return null;
    }
  }

  static async create(projectData) {
    try {
      return await database.createProject(projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  static async update(id, projectData) {
    try {
      return await database.updateProject(id, projectData);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      return await database.deleteProject(id);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  static async findAll(category = null) {
    try {
      return await database.getProjects(category);
    } catch (error) {
      console.error('Error finding all projects:', error);
      return [];
    }
  }
}

export default Project;
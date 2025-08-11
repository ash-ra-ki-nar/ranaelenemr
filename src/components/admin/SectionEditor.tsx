import { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, GripVertical, Type, Image, Video, Quote, Link } from 'lucide-react';
import { sectionsApi, elementsApi, projectsApi } from '../../services/api';
import type { Section, SectionElement } from '../../types';
import ElementEditor from './ElementEditor';
import LoadingSpinner from '../ui/LoadingSpinner';
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

interface SectionEditorProps {
  projectId: number;
}

const SortableElementWrapper = ({ element, onUpdate, onDelete }: { 
  element: SectionElement; 
  onUpdate: (element: SectionElement) => void; 
  onDelete: (elementId: number) => void; 
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(element.id) });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
            <GripVertical size={16} className="text-gray-400" />
          </div>
          <span className="text-sm font-medium text-gray-700 capitalize">{element.type}</span>
        </div>
        <button
          onClick={() => onDelete(element.id)}
          className="text-red-600 hover:text-red-700 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <ElementEditor
        element={element}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
};

const SectionEditor = ({ projectId }: SectionEditorProps) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionColumns, setSectionColumns] = useState(1);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchSections();
  }, [projectId]);

  const fetchSections = async () => {
    try {
      setLoading(true);
      console.log('Fetching sections for project:', projectId);
      
      const project = await projectsApi.getById(projectId);
      console.log('Project data received:', project);
      console.log('Sections found:', project.sections?.length || 0);
      
      setSections(project.sections || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = async () => {
    try {
      setCreating(true);
      console.log('Creating section for project:', projectId);
      
      const newSection = await sectionsApi.create(projectId, {
        title: '',
        columns: 1,
      });
      
      console.log('Section created:', newSection);
      setSections(prev => [...prev, { ...newSection, elements: [] }]);
    } catch (error) {
      console.error('Error creating section:', error);
      alert('Failed to create section. Please check console for details.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm('Are you sure you want to delete this section? All content will be lost.')) {
      return;
    }

    try {
      await sectionsApi.delete(sectionId);
      setSections(prev => prev.filter(s => s.id !== sectionId));
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Failed to delete section. Please try again.');
    }
  };

  const handleAddElement = async (sectionId: number, elementType: string) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      const nextOrderIndex = section?.elements?.length || 0;
      
      const newElement = await elementsApi.create(sectionId, {
        type: elementType as 'text' | 'image' | 'video' | 'quote' | 'embed',
        content: elementType === 'text' ? '<p>Enter your content here...</p>' : '',
        order_index: nextOrderIndex,
      });

      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              elements: [...(section.elements || []), newElement].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            }
          : section
      ));
    } catch (error) {
      console.error('Error adding element:', error);
      alert('Failed to add element. Please try again.');
    }
  };

  const handleAddElementToColumn = async (sectionId: number, elementType: string, columnIndex: number) => {
    try {
      const section = sections.find(s => s.id === sectionId);
      const nextOrderIndex = section?.elements?.length || 0;
      
      const newElement = await elementsApi.create(sectionId, {
        type: elementType as 'text' | 'image' | 'video' | 'quote' | 'embed',
        content: elementType === 'text' ? '<p>Enter your content here...</p>' : '',
        order_index: nextOrderIndex,
        column_index: columnIndex,
      });

      setSections(prev => prev.map(section => 
        section.id === sectionId 
          ? { 
              ...section, 
              elements: [...(section.elements || []), newElement].sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            }
          : section
      ));
    } catch (error) {
      console.error('Error adding element to column:', error);
      alert('Failed to add element. Please try again.');
    }
  };

  const handleUpdateElement = (updatedElement: SectionElement) => {
    setSections(prev => prev.map(section => ({
      ...section,
      elements: section.elements?.map(element => 
        element.id === updatedElement.id ? updatedElement : element
      ) || []
    })));
  };

  const handleDeleteElement = async (elementId: number) => {
    try {
      await elementsApi.delete(elementId);
      setSections(prev => prev.map(section => ({
        ...section,
        elements: section.elements?.filter(element => element.id !== elementId) || []
      })));
    } catch (error) {
      console.error('Error deleting element:', error);
      alert('Failed to delete element. Please try again.');
    }
  };

  const handleEditSection = (section: Section) => {
    setEditingSection(section);
    setSectionTitle(section.title || '');
    setSectionColumns(section.columns || 1);
  };

  const handleSaveSection = async () => {
    if (!editingSection) return;

    try {
      const updatedSection = await sectionsApi.update(editingSection.id, {
        title: sectionTitle.trim(),
        columns: sectionColumns,
      });

      setSections(prev => prev.map(section => 
        section.id === editingSection.id 
          ? { ...section, title: updatedSection.title, columns: updatedSection.columns }
          : section
      ));

      setEditingSection(null);
      setSectionTitle('');
      setSectionColumns(1);
    } catch (error) {
      console.error('Error updating section:', error);
      alert('Failed to update section. Please try again.');
    }
  };

  const handleDragEnd = async (event: DragEndEvent, sectionId: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const section = sections.find(s => s.id === sectionId);
    if (!section?.elements) return;

    const oldIndex = section.elements.findIndex(el => String(el.id) === active.id);
    const newIndex = section.elements.findIndex(el => String(el.id) === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newElements = arrayMove(section.elements, oldIndex, newIndex);
    
    // Update local state
    setSections(prev => prev.map(s => 
      s.id === sectionId ? { ...s, elements: newElements } : s
    ));

    // Update backend
    try {
      const elementOrders = newElements.map((element, index) => ({
        id: element.id,
        order_index: index,
        column_index: element.column_index || 0,
      }));
      
      await sectionsApi.reorder(sectionId, elementOrders);
    } catch (error) {
      console.error('Error updating element order:', error);
      fetchSections();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Content Sections</h2>
        <button
          onClick={handleCreateSection}
          disabled={creating}
          className="btn btn-primary flex items-center space-x-2"
        >
          {creating ? <LoadingSpinner size="sm" /> : <Plus size={16} />}
          <span>{creating ? 'Creating...' : 'Add Section'}</span>
        </button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 mb-4">No content sections yet</p>
          <button
            onClick={handleCreateSection}
            className="btn btn-primary"
            disabled={creating}
          >
            Create First Section
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
                  <span className="text-sm text-gray-500">
                    {section.elements?.length || 0} elements
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleEditSection(section)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit Section Settings"
                  >
                    <Settings size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Add Element Buttons - Different layout for 1 vs 2 columns */}
              {section.columns === 2 ? (
                <div className="grid grid-cols-2 gap-6 mb-6">
                  {/* Column 1 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Column 1 - Add Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'text', 0)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Type size={14} />
                        <span>Text</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'image', 0)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Image size={14} />
                        <span>Image</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'video', 0)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Video size={14} />
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'quote', 0)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Quote size={14} />
                        <span>Quote</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'embed', 0)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Link size={14} />
                        <span>Embed</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Column 2 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Column 2 - Add Elements</h4>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'text', 1)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Type size={14} />
                        <span>Text</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'image', 1)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Image size={14} />
                        <span>Image</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'video', 1)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Video size={14} />
                        <span>Video</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'quote', 1)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Quote size={14} />
                        <span>Quote</span>
                      </button>
                      <button
                        onClick={() => handleAddElementToColumn(section.id, 'embed', 1)}
                        className="btn btn-secondary btn-sm flex items-center space-x-2"
                      >
                        <Link size={14} />
                        <span>Embed</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-6">
                  <button
                    onClick={() => handleAddElement(section.id, 'text')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Type size={14} />
                    <span>Text</span>
                  </button>
                  <button
                    onClick={() => handleAddElement(section.id, 'image')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Image size={14} />
                    <span>Image</span>
                  </button>
                  <button
                    onClick={() => handleAddElement(section.id, 'video')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Video size={14} />
                    <span>Video</span>
                  </button>
                  <button
                    onClick={() => handleAddElement(section.id, 'quote')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Quote size={14} />
                    <span>Quote</span>
                  </button>
                  <button
                    onClick={() => handleAddElement(section.id, 'embed')}
                    className="btn btn-secondary btn-sm flex items-center space-x-2"
                  >
                    <Link size={14} />
                    <span>Embed</span>
                  </button>
                </div>
              )}

              {/* Column Layout Info */}
              {section.columns === 2 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Two-column layout:</strong> Elements will be distributed across 2 columns on the public page.
                  </p>
                </div>
              )}

              {/* Elements */}
              {section.elements && section.elements.length > 0 ? (
                section.columns === 2 ? (
                  // Two-column layout in admin
                  <div className="grid grid-cols-2 gap-6">
                    {/* Column 1 Elements */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Column 1 Elements</h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, section.id)}
                      >
                        <SortableContext
                          items={section.elements.filter(el => el.column_index === 0 || (el.column_index === undefined && section.columns === 1)).map(el => String(el.id))}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {section.elements
                              .filter(el => el.column_index === 0)
                              .map((element) => (
                                <SortableElementWrapper
                                  key={element.id}
                                  element={element}
                                  onUpdate={handleUpdateElement}
                                  onDelete={handleDeleteElement}
                                />
                              ))}
                            {section.elements.filter(el => el.column_index === 0).length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">No elements in column 1</p>
                                <p className="text-xs">Use the buttons above to add content</p>
                              </div>
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>

                    {/* Column 2 Elements */}
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Column 2 Elements</h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => handleDragEnd(event, section.id)}
                      >
                        <SortableContext
                          items={section.elements.filter(el => el.column_index === 1).map(el => String(el.id))}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-4">
                            {section.elements
                              .filter(el => el.column_index === 1)
                              .map((element) => (
                                <SortableElementWrapper
                                  key={element.id}
                                  element={element}
                                  onUpdate={handleUpdateElement}
                                  onDelete={handleDeleteElement}
                                />
                              ))}
                            {section.elements.filter(el => el.column_index === 1).length === 0 && (
                              <div className="text-center py-8 text-gray-400">
                                <p className="text-sm">No elements in column 2</p>
                                <p className="text-xs">Use the buttons above to add content</p>
                              </div>
                            )}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </div>
                ) : (
                  // Single column layout in admin
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, section.id)}
                  >
                    <SortableContext
                      items={section.elements.map(el => String(el.id))}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-4">
                        {section.elements.map((element) => (
                          <SortableElementWrapper
                            key={element.id}
                            element={element}
                            onUpdate={handleUpdateElement}
                            onDelete={handleDeleteElement}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>No elements in this section yet</p>
                  <p className="text-sm">Use the buttons above to add content</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Section Settings Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Section Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Section Title
                  </label>
                  <input
                    type="text"
                    id="sectionTitle"
                    value={sectionTitle}
                    onChange={(e) => setSectionTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter section title (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="sectionColumns" className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Columns
                  </label>
                  <select
                    id="sectionColumns"
                    value={sectionColumns}
                    onChange={(e) => setSectionColumns(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 Column</option>
                    <option value={2}>2 Columns</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingSection(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
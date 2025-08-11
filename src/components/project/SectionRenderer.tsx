import type { Section } from '../../types';
import ElementRenderer from './ElementRenderer';

interface SectionRendererProps {
  section: Section;
}

const SectionRenderer = ({ section }: SectionRendererProps) => {
  if (!section.elements || section.elements.length === 0) {
    return null;
  }

  // Sort elements by order_index
  const sortedElements = section.elements ? [...section.elements].sort((a, b) => 
    (a.order_index || 0) - (b.order_index || 0)
  ) : [];

  // Group elements by column if multi-column layout
  const columns = section.columns || 1;
  const elementsByColumn: { [key: number]: typeof sortedElements } = {};

  if (columns > 1) {
    // Distribute elements evenly across columns if no column_index is set
    sortedElements.forEach((element, index) => {
      const columnIndex = element.column_index !== undefined ? element.column_index : index % columns;
      if (!elementsByColumn[columnIndex]) {
        elementsByColumn[columnIndex] = [];
      }
      elementsByColumn[columnIndex].push(element);
    });
  }

  return (
    <section className="section-container mb-12">
      {section.title && section.title.trim() && section.title !== 'New Section' && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {section.title}
        </h2>
      )}
      
      {columns === 2 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 2 }, (_, columnIndex) => (
            <div key={columnIndex} className="column">
              {elementsByColumn[columnIndex]?.map((element) => (
                <ElementRenderer key={element.id} element={element} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="single-column">
          {sortedElements.map((element) => (
            <ElementRenderer key={element.id} element={element} />
          ))}
        </div>
      )}
    </section>
  );
};

export default SectionRenderer;
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import {
  Bold, Italic, List, ListOrdered, Quote, Undo, Redo,
  Link as LinkIcon, Image as ImageIcon, Palette, Highlighter
} from 'lucide-react';
import { useEffect, useRef } from 'react';
import './RichTextEditor.css';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder = 'Start writing...' }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-600 hover:text-primary-700 underline',
        },
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
    ].map(ext => {
      if (ext.name === 'starterKit') {
        return StarterKit.configure({
          heading: {
            levels: [1, 2, 3, 4, 5, 6],
          },
        });
      }
      return ext;
    }),
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 rich-text-editor',
        placeholder,
      },
    },
  });

  const textColorRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Handle click outside for text color dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (textColorRef.current && !textColorRef.current.contains(e.target as Node)) {
        const dropdown = textColorRef.current.querySelector('.color-dropdown') as HTMLElement;
        if (dropdown && !dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Handle click outside for highlight dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (highlightRef.current && !highlightRef.current.contains(e.target as Node)) {
        const dropdown = highlightRef.current.querySelector('.color-dropdown') as HTMLElement;
        if (dropdown && !dropdown.classList.contains('hidden')) {
          dropdown.classList.add('hidden');
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Enhanced Toolbar */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 p-3 space-y-3">
        {/* Row 1: Headings */}
        <div className="flex items-center space-x-3 flex-wrap">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Style:</span>
            <select
              onChange={(e) => {
                const level = parseInt(e.target.value);
                if (level === 0) {
                  editor.chain().focus().setParagraph().run();
                } else {
                  editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run();
                }
              }}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white shadow-sm"
              value={
                editor.isActive('heading', { level: 1 }) ? 1 :
                editor.isActive('heading', { level: 2 }) ? 2 :
                editor.isActive('heading', { level: 3 }) ? 3 : 0
              }
            >
              <option value={0}>Paragraph</option>
              <option value={1}>Heading 1</option>
              <option value={2}>Heading 2</option>
              <option value={3}>Heading 3</option>
            </select>
          </div>
        </div>

        {/* Row 2: Text Formatting */}
        <div className="flex items-center space-x-2 flex-wrap">
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('bold') ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold size={18} />
            </button>
            
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('italic') ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('strike') ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Strikethrough"
            >
              <span className="text-lg font-bold">S</span>
            </button>
          </div>

          {/* Font Family */}
          <div className={`flex items-center space-x-1 rounded-lg p-1 shadow-sm border ${
            editor.getAttributes('textStyle').fontFamily ? 'bg-blue-100 border-blue-300' : 'bg-white border-gray-300'
          }`}>
            <select
              onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white shadow-sm"
              value={editor.getAttributes('textStyle').fontFamily || 'sans-serif'}
              style={{ fontFamily: editor.getAttributes('textStyle').fontFamily || 'sans-serif' }}
            >
              <option value="sans-serif" style={{ fontFamily: 'sans-serif' }}>Sans-serif</option>
              <option value="serif" style={{ fontFamily: 'serif' }}>Serif</option>
              <option value="monospace" style={{ fontFamily: 'monospace' }}>Monospace</option>
              <option value="cursive" style={{ fontFamily: 'cursive' }}>Cursive</option>
            </select>
          </div>

          {/* Text Color */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border relative">
            <div className="relative" ref={textColorRef}>
              <button
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center ${
                  editor.getAttributes('textStyle').color ? 'text-blue-600' : 'text-gray-600'
                }`}
                title="Text Color"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <Palette size={18} />
              </button>
              
              {/* Color swatches dropdown */}
              <div className="color-dropdown absolute top-full left-0 mt-1 hidden bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
                <div className="grid grid-cols-6 gap-1 w-48">
                  {['#000000', '#7f7f7f', '#880000', '#ff0000', '#ff9900', '#ffff00',
                    '#008a00', '#00ff00', '#0000ff', '#00ffff', '#800080', '#ff00ff',
                    '#ff69b4', '#ffc0cb', '#dda0dd', '#9370db', '#4169e1', '#87ceeb',
                    '#20b2aa', '#00fa9a', '#32cd32', '#ffd700', '#ff8c00', '#8b4513',
                    '#a52a2a', '#b22222', '#cd5c5c', '#d2691e', '#daa520', '#f0e68c',
                    '#98fb98', '#afeeee', '#dcdcdc', '#f5f5f5', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform ${
                        editor.getAttributes('textStyle').color === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        editor.chain().focus().setColor(color).run();
                        // Close dropdown after selection
                        const dropdown = e.currentTarget.closest('.color-dropdown') as HTMLElement;
                        if (dropdown) {
                          dropdown.classList.add('hidden');
                        }
                      }}
                    />
                  ))}
                  <button
                    className="w-6 h-6 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.chain().focus().unsetColor().run();
                      // Close dropdown after selection
                      const dropdown = e.currentTarget.closest('.color-dropdown') as HTMLElement;
                      if (dropdown) {
                        dropdown.classList.add('hidden');
                      }
                    }}
                    title="Remove color"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div
              className="color-preview"
              style={{ backgroundColor: editor.getAttributes('textStyle').color || '#000000' }}
            />
          </div>

          {/* Highlight */}
          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border relative">
            <div className="relative" ref={highlightRef}>
              <button
                className={`p-2 rounded-md hover:bg-gray-100 transition-colors flex items-center ${
                  editor.getAttributes('highlight').color ? 'text-blue-600' : 'text-gray-600'
                }`}
                title="Highlight"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
              >
                <Highlighter size={18} />
              </button>
              
              {/* Highlight swatches dropdown */}
              <div className="color-dropdown absolute top-full left-0 mt-1 hidden bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-20">
                <div className="grid grid-cols-6 gap-1 w-48">
                  {['#ffff00', '#ff9900', '#ff0000', '#ff00ff', '#0000ff', '#00ffff',
                    '#00ff00', '#ffffff', '#cccccc', '#7f7f7f', '#000000', '#ffd700',
                    '#ffa500', '#ff6347', '#ff1493', '#da70d6', '#9370db', '#4169e1',
                    '#87ceeb', '#20b2aa', '#00fa9a', '#32cd32', '#f0e68c', '#f5deb3',
                    '#d2b48c', '#a0522d', '#8b4513', '#a52a2a', '#b22222', '#cd5c5c',
                    '#d2691e', '#daa520', '#98fb98', '#afeeee', '#e0ffff', '#f0f8ff'].map((color) => (
                    <button
                      key={color}
                      className={`w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform ${
                        editor.getAttributes('highlight').color === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        editor.chain().focus().setHighlight({ color }).run();
                        // Close dropdown after selection
                        const dropdown = e.currentTarget.closest('.color-dropdown') as HTMLElement;
                        if (dropdown) {
                          dropdown.classList.add('hidden');
                        }
                      }}
                    />
                  ))}
                  <button
                    className="w-6 h-6 text-xs text-gray-500 hover:text-gray-700 flex items-center justify-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      editor.chain().focus().unsetHighlight().run();
                      // Close dropdown after selection
                      const dropdown = e.currentTarget.closest('.color-dropdown') as HTMLElement;
                      if (dropdown) {
                        dropdown.classList.add('hidden');
                      }
                    }}
                    title="Remove highlight"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
            <div
              className="color-preview"
              style={{ backgroundColor: editor.getAttributes('highlight').color || '#FFFF00' }}
            />
          </div>

          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('bulletList') ? 'bg-green-100 text-green-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Bullet List"
            >
              <List size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('orderedList') ? 'bg-green-100 text-green-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Numbered List"
            >
              <ListOrdered size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('blockquote') ? 'bg-orange-100 text-orange-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Quote"
            >
              <Quote size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={addLink}
              className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${
                editor.isActive('link') ? 'bg-purple-100 text-purple-600 shadow-sm' : 'text-gray-600'
              }`}
              title="Add Link"
            >
              <LinkIcon size={18} />
            </button>

            <button
              onClick={addImage}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors text-gray-600"
              title="Add Image"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          <div className="flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              title="Undo (Ctrl+Z)"
            >
              <Undo size={18} />
            </button>

            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
              title="Redo (Ctrl+Y)"
            >
              <Redo size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="relative rich-text-container">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;
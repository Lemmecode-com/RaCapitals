import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table'

const TipTapEditor = ({ content = '', onChange }) => {
  const [viewMode, setViewMode] = useState('visual') // 'visual' | 'html'
  const [htmlValue, setHtmlValue] = useState(content)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] }
      }),
      Placeholder.configure({
        placeholder: 'Start writing your market insight here... You can select text to apply bold, headings, or use the toolbar buttons above!'
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'insight-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      setHtmlValue(html)
      if (onChange) onChange(html)
    }
  })

  // Synchronize when external content changes (e.g. edit mode loads data)
  useEffect(() => {
    if (editor && !editor.isFocused && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
      setHtmlValue(content || '')
    }
  }, [content, editor])

  // Handle direct HTML code editing
  const handleHtmlCodeChange = (e) => {
    const newHtml = e.target.value
    setHtmlValue(newHtml)
    if (editor) {
      editor.commands.setContent(newHtml, false)
    }
    if (onChange) onChange(newHtml)
  }

  // Insert custom structured blocks
  const insertLeadIntro = () => {
    if (!editor) return
    editor.chain().focus().insertContent('<div class="insight-lead"><p>Your lead introductory analysis paragraph here...</p></div>').run()
  }

  const insertCalloutBox = () => {
    if (!editor) return
    editor.chain().focus().insertContent('<div class="insight-callout"><h4>Key Strategic Takeaways</h4><ul><li><strong>Point 1:</strong> Overview of unit economics...</li><li><strong>Point 2:</strong> Pre-IPO valuation multiple comparisons...</li></ul></div>').run()
  }

  const insertComparisonTable = () => {
    if (!editor) return
    editor.chain().focus().insertTable({ rows: 4, cols: 3, withHeaderRow: true }).run()
  }

  const addLink = () => {
    if (!editor) return
    const prevUrl = editor.getAttributes('link').href
    const url = window.prompt('Enter link URL:', prevUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  if (!editor) {
    return <p className="muted">Loading rich text editor…</p>
  }

  return (
    <div className="tiptap-editor-wrap">
      {/* Top Toolbar */}
      <div className="tiptap-toolbar">
        {/* View Mode Switcher */}
        <div className="tiptap-mode-group">
          <button
            type="button"
            className={`tiptap-btn ${viewMode === 'visual' ? 'active' : ''}`}
            onClick={() => setViewMode('visual')}
            title="Visual WYSIWYG Editor (MS Word style)"
          >
            ✏️ Rich Text
          </button>
          <button
            type="button"
            className={`tiptap-btn ${viewMode === 'html' ? 'active' : ''}`}
            onClick={() => {
              if (editor) setHtmlValue(editor.getHTML())
              setViewMode('html')
            }}
            title="Raw HTML Source Code"
          >
            &lt;/&gt; HTML Code
          </button>
        </div>

        {viewMode === 'visual' && (
          <>
            <div className="tiptap-divider" />

            {/* Basic Formatting */}
            <div className="tiptap-btn-group">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`tiptap-btn ${editor.isActive('bold') ? 'active' : ''}`}
                title="Bold (Ctrl+B)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`tiptap-btn ${editor.isActive('italic') ? 'active' : ''}`}
                title="Italic (Ctrl+I)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`tiptap-btn ${editor.isActive('strike') ? 'active' : ''}`}
                title="Strikethrough"
              >
                <s>S</s>
              </button>
            </div>

            <div className="tiptap-divider" />

            {/* Headings */}
            <div className="tiptap-btn-group">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`tiptap-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
                title="Heading 2 (Section Title)"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`tiptap-btn ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
                title="Heading 3 (Subsection)"
              >
                H3
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`tiptap-btn ${editor.isActive('paragraph') ? 'active' : ''}`}
                title="Normal Paragraph"
              >
                ¶
              </button>
            </div>

            <div className="tiptap-divider" />

            {/* Lists & Quotes */}
            <div className="tiptap-btn-group">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`tiptap-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
                title="Bullet List"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`tiptap-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
                title="Numbered List"
              >
                1. List
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`tiptap-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
                title="Quote block"
              >
                ” Quote
              </button>
              <button
                type="button"
                onClick={addLink}
                className={`tiptap-btn ${editor.isActive('link') ? 'active' : ''}`}
                title="Insert or Edit Link"
              >
                🔗 Link
              </button>
            </div>

            <div className="tiptap-divider" />

            {/* Custom Structured Taurus Magnus Blocks */}
            <div className="tiptap-btn-group">
              <button
                type="button"
                onClick={insertLeadIntro}
                className="tiptap-btn action-pill"
                title="Insert Lead Introductory Paragraph"
              >
                + Lead Intro
              </button>
              <button
                type="button"
                onClick={insertCalloutBox}
                className="tiptap-btn action-pill"
                title="Insert Key Takeaways Callout Box"
              >
                + Callout Box
              </button>
              <button
                type="button"
                onClick={insertComparisonTable}
                className="tiptap-btn action-pill"
                title="Insert Financial Comparison Table"
              >
                + Table
              </button>
            </div>

            {/* Table Editing Tools (Active when cursor is inside a table) */}
            {editor.isActive('table') && (
              <>
                <div className="tiptap-divider" />
                <div className="tiptap-btn-group table-tools">
                  <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="tiptap-btn" title="Add Row Below">+ Row</button>
                  <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="tiptap-btn" title="Delete Row">- Row</button>
                  <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="tiptap-btn" title="Add Column Right">+ Col</button>
                  <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="tiptap-btn" title="Delete Column">- Col</button>
                  <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="tiptap-btn delete" title="Delete Table">🗑 Table</button>
                </div>
              </>
            )}

            {/* Undo / Redo */}
            <div className="tiptap-btn-group ml-auto">
              <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                className="tiptap-btn"
                title="Undo (Ctrl+Z)"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                className="tiptap-btn"
                title="Redo (Ctrl+Y)"
              >
                ↻
              </button>
            </div>
          </>
        )}
      </div>

      {/* Editor Body */}
      <div className="tiptap-body-container">
        {viewMode === 'visual' ? (
          <EditorContent editor={editor} className="tiptap-content-editable" />
        ) : (
          <textarea
            value={htmlValue}
            onChange={handleHtmlCodeChange}
            placeholder="Edit raw HTML code..."
            rows={18}
            className="contact-form-textarea"
            style={{
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              width: '100%',
              minHeight: '400px'
            }}
          />
        )}
      </div>
    </div>
  )
}

export default TipTapEditor

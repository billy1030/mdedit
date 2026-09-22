import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  Upload,
  Sun,
  Moon,
  Save,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Sigma,
  Table as TableIcon,
  Link,
  GitBranch,
  FileCode,
  Box,
  Code,
  Sparkles,
  Columns
} from 'lucide-react';
import { DirectArticleEditor } from './components/DirectArticleEditor';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { DEFAULT_MARKDOWN } from './constants/defaultMarkdown';
import { generateStandaloneExportHtml } from './utils/htmlExport';

type ThemeMode = 'dark' | 'light' | 'warm';
type EditViewMode = 'code' | 'wysiwyg' | 'split';

export function App() {
  const [content, setContent] = useState<string>(() => { try { localStorage.removeItem('mdedit_content'); } catch(e){} return DEFAULT_MARKDOWN; });
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('mdedit_theme') as ThemeMode) || 'light';
  });
  const [isSaved, setIsSaved] = useState(true);
  const [viewMode, setViewMode] = useState<EditViewMode>('wysiwyg');
  const [contentWidth, setContentWidth] = useState<number>(82);
  const [docRevision, setDocRevision] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const codeTextareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('dark', 'warm'); if (theme === 'dark') { document.documentElement.classList.add('dark'); } else if (theme === 'warm') { document.documentElement.classList.add('warm'); }
    localStorage.setItem('mdedit_theme', theme);
  }, [theme]);

  const handleContentChange = (newMd: string) => {
    setContent(newMd);
    setIsSaved(false);
  };

  const handleSaveToLocal = () => {
    localStorage.setItem('mdedit_content', content);
    setIsSaved(true);
  };

  const handleExportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleExportHtml = () => {
    const html = generateStandaloneExportHtml(content, 'MDEdit Export Document');
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-export.html';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (typeof text === 'string') {
        setContent(text);
        setIsSaved(true);
        setDocRevision((r) => r + 1);
      }
    };
    reader.readAsText(file);
    // Reset input value so opening the exact same file again triggers change event
    e.target.value = '';
  };

  // SLS Inserter & Formatter
  const insertMarkdownSnippet = (before: string, after: string = '', defaultText: string = '') => {
    if (viewMode === 'wysiwyg') {
      if (before === '**') {
        document.execCommand('bold', false);
        return;
      }
      if (before === '*') {
        document.execCommand('italic', false);
        return;
      }
      if (before === '# ') {
        document.execCommand('formatBlock', false, '<h1>');
        return;
      }
      if (before === '## ') {
        document.execCommand('formatBlock', false, '<h2>');
        return;
      }
      if (before === '### ') {
        document.execCommand('formatBlock', false, '<h3>');
        return;
      }
      if (before === '- ') {
        document.execCommand('insertUnorderedList', false);
        return;
      }
      if (before === '1. ') {
        document.execCommand('insertOrderedList', false);
        return;
      }
      if (before === '> ') {
        document.execCommand('formatBlock', false, '<blockquote>');
        return;
      }
    }

    if (viewMode === 'code' || viewMode === 'split') {
      const textarea = codeTextareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const currentVal = textarea.value;
        const selected = currentVal.substring(start, end) || defaultText;
        const replacement = `${before}${selected}${after}`;
        const updated = currentVal.substring(0, start) + replacement + currentVal.substring(end);
        setContent(updated);
        setIsSaved(false);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
        }, 10);
        return;
      }
    }

    // Append snippet (Mermaid / SVG / Draw.io / Tables / Math / Code)
    setContent((prev) => {
      const trimmed = prev.trim();
      const insertText = before + (defaultText || '') + after;
      return trimmed ? trimmed + '\n\n' + insertText : insertText;
    });
    setIsSaved(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* Top Header & SLS Function Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          backgroundColor: 'var(--bg-toolbar)',
          userSelect: 'none',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Left: Brand & Document Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0284c7 0%, #38bdf8 100%)',
              color: '#ffffff',
            }}
          >
            <FileText size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 800, fontSize: '15px', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                MDEdit
              </span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  backgroundColor: isSaved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isSaved ? '#10b981' : '#f59e0b',
                  fontWeight: 600,
                }}
              >
                {isSaved ? 'Saved' : 'Modified'}
              </span>
            </div>
          </div>
        </div>

        {/* Center: SLS Function Toolbar (B, I, H1, H2, H3, Lists, Diagrams, etc.) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--btn-bg)', padding: '3px 8px', borderRadius: '10px', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
          {/* Bold & Italic */}
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('**', '**', 'Bold text')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Bold (**text**)"
          >
            <Bold size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('*', '*', 'Italic text')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Italic (*text*)"
          >
            <Italic size={15} />
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

          {/* Heading 1, 2, 3 */}
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('# ', '', 'Heading 1')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Heading 1 (#)"
          >
            <Heading1 size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('## ', '', 'Heading 2')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Heading 2 (##)"
          >
            <Heading2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('### ', '', 'Heading 3')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Heading 3 (###)"
          >
            <Heading3 size={15} />
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

          {/* Lists */}
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('- ', '', 'List item')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Unordered list (-)"
          >
            <List size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('1. ', '', 'Numbered item')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Ordered list (1.)"
          >
            <ListOrdered size={15} />
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

          {/* Diagram Badges: Mermaid, SVG, Drawio (Icon Only) */}
          <button
            type="button"
            onClick={() =>
              insertMarkdownSnippet(
                '```mermaid\nflowchart TD\n  A[Start] --> B[Processing]\n  B --> C[Complete]\n```\n',
                '',
                ''
              )
            }
            style={{
              padding: '5px',
              borderRadius: '6px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Insert Mermaid Diagram"
          >
            <GitBranch size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              insertMarkdownSnippet(
                '```xml\n<svg viewBox="0 0 800 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100%" height="100%" rx="12" fill="#0b0f19" stroke="#1e293b"/>\n  <text x="40" y="50" fill="#38bdf8" font-size="18" font-weight="bold">System Architecture</text>\n  <rect x="40" y="80" width="200" height="100" rx="8" fill="#111827" stroke="#38bdf8"/>\n  <text x="60" y="135" fill="#f8fafc" font-size="14">Service Component</text>\n</svg>\n```\n',
                '',
                ''
              )
            }
            style={{
              padding: '5px',
              borderRadius: '6px',
              background: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(2, 132, 199, 0.3)',
              color: '#0284c7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Insert SVG Architecture Diagram"
          >
            <FileCode size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              insertMarkdownSnippet(
                '```drawio\n<mxfile host="Electron" version="21.0.0">\n  <diagram id="Sample" name="Page-1">\n    <mxGraphModel dx="800" dy="600" grid="1" gridSize="10">\n      <root>\n        <mxCell id="0" />\n        <mxCell id="1" parent="0" />\n        <mxCell id="n1" value="&lt;b&gt;Interactive Node&lt;/b&gt;" style="rounded=1;whiteSpace=wrap;html=1;fillColor=#e1f5fe;strokeColor=#0288d1;" vertex="1" parent="1">\n          <mxGeometry x="60" y="60" width="160" height="60" as="geometry" />\n        </mxCell>\n      </root>\n    </mxGraphModel>\n  </diagram>\n</mxfile>\n```\n',
                '',
                ''
              )
            }
            style={{
              padding: '5px',
              borderRadius: '6px',
              background: 'rgba(168, 85, 247, 0.1)',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              color: '#a855f7',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Insert Draw.io Diagram"
          >
            <Box size={15} />
          </button>

          <div style={{ width: '1px', height: '16px', background: 'var(--border)', margin: '0 4px' }} />

          {/* Code, Math, Table, Quote, Link */}
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('```typescript\n', '\n```\n', '// Code snippet')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Code Block"
          >
            <Code2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('$$\n', '\n$$\n', 'E = mc^2')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="KaTeX Math Formula ($$)"
          >
            <Sigma size={15} />
          </button>
          <button
            type="button"
            onClick={() =>
              insertMarkdownSnippet(
                '\n| Column 1 | Column 2 | Column 3 |\n| :--- | :--- | :--- |\n| Item A | Item B | Item C |\n\n',
                '',
                ''
              )
            }
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Table"
          >
            <TableIcon size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('> ', '', 'Quote text')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Blockquote (>)"
          >
            <Quote size={15} />
          </button>
          <button
            type="button"
            onClick={() => insertMarkdownSnippet('[', '](https://example.com)', 'Link text')}
            style={{ padding: '5px', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center' }}
            title="Link"
          >
            <Link size={15} />
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Width Slider Feature in Header Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--btn-bg)',
              padding: '4px 10px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Width: <strong style={{ color: '#0ea5e9' }}>{contentWidth}%</strong>
            </span>
            <input
              type="range"
              min="55"
              max="95"
              value={contentWidth}
              onChange={(e) => setContentWidth(Number(e.target.value))}
              style={{
                width: '100px',
                cursor: 'pointer',
                accentColor: '#0ea5e9'
              }}
              title="Adjust Document Width"
            />
          </div>

          <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 2px' }} />

          {/* Open Markdown File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleOpenFile}
            accept=".md,.markdown,.txt"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title="Open Markdown File"
          >
            <Upload size={15} />
          </button>

          {/* Save to Local Storage */}
          <button
            onClick={handleSaveToLocal}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title="Save (Local Storage)"
          >
            <Save size={15} />
          </button>

          {/* Export Markdown (.md) */}
          <button
            onClick={handleExportMarkdown}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title="Export Markdown (.md)"
          >
            <Download size={15} />
          </button>

          {/* Export Standalone HTML */}
          <button
            onClick={handleExportHtml}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(2, 132, 199, 0.3)',
            }}
            title="Export Standalone HTML (with Diagrams & Styles)"
          >
            <FileText size={15} />
          </button>

          <div style={{ width: '1px', height: '18px', background: 'var(--border)', margin: '0 2px' }} />

          {/* View Modes (WYSIWYG, Split, Code) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--btn-bg)',
              padding: '2px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <button
              onClick={() => setViewMode('code')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'code' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'code' ? '#ffffff' : 'var(--text-muted)',
              }}
              title="Markdown Code Mode"
            >
              <Code size={14} />
            </button>
            <button
              onClick={() => setViewMode('wysiwyg')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'wysiwyg' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'wysiwyg' ? '#ffffff' : 'var(--text-muted)',
              }}
              title="WYSIWYG Visual Mode"
            >
              <Sparkles size={14} />
            </button>
            <button
              onClick={() => setViewMode('split')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: viewMode === 'split' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'split' ? '#ffffff' : 'var(--text-muted)',
              }}
              title="Split Code & Preview Mode"
            >
              <Columns size={14} />
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'var(--btn-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
            }}
            title="Toggle Theme (Light / Dark)"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', width: '100%', height: 'calc(100vh - 54px)' }}>
        {viewMode === 'wysiwyg' && (
          <div style={{ flex: 1, width: '100%', height: '100%', overflow: 'hidden' }}>
            <DirectArticleEditor
              key={docRevision}
              content={content}
              onChange={handleContentChange}
              onSave={handleSaveToLocal}
              isSaved={isSaved}
              contentWidth={contentWidth}
            />
          </div>
        )}

        {viewMode === 'code' && (
          <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Raw Markdown Editor</span>
              <span>{content.length} characters</span>
            </div>
            <textarea
              ref={codeTextareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Enter markdown content here..."
              style={{
                flex: 1,
                width: '100%',
                padding: '24px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                lineHeight: '1.7',
                resize: 'none',
                boxSizing: 'border-box'
              }}
              spellCheck={false}
            />
          </div>
        )}

        {viewMode === 'split' && (
          <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex' }}>
            {/* Left: Code Editor Pane */}
            <div style={{ width: '50%', height: '100%', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', backgroundColor: 'var(--bg-card)' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>Left: Markdown Editor</span>
                <span>{content.length} characters</span>
              </div>
              <textarea
                ref={codeTextareaRef}
                value={content}
                onChange={(e) => handleContentChange(e.target.value)}
                placeholder="Enter markdown content here..."
                style={{
                  flex: 1,
                  width: '100%',
                  padding: '20px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  resize: 'none',
                  boxSizing: 'border-box'
                }}
                spellCheck={false}
              />
            </div>
            {/* Right: Live Preview Pane */}
            <div style={{ width: '50%', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-app)', padding: '24px', boxSizing: 'border-box' }}>
              <DirectArticleEditor
                content={content}
                onChange={handleContentChange}
                onSave={handleSaveToLocal}
                isSaved={isSaved}
                isSplitView={true}
                contentWidth={100}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
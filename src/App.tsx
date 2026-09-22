import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Download,
  FolderOpen,
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
  Columns,
  FilePlus
} from 'lucide-react';
import { DirectArticleEditor } from './components/DirectArticleEditor';
import { MarkdownRenderer } from './components/MarkdownRenderer';
import { FileSidebar, DirectoryFileItem } from './components/FileSidebar';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [dirName, setDirName] = useState<string | null>(null);
  const [dirFiles, setDirFiles] = useState<DirectoryFileItem[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const [nativeDirPath, setNativeDirPath] = useState<string | null>(null);

  const dirInputRef = useRef<HTMLInputElement>(null);
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

  const handleNewDocument = () => {
    if (!isSaved) {
      const confirmDiscard = window.confirm('You have unsaved changes. Create new document anyway?');
      if (!confirmDiscard) return;
    }
    setContent(DEFAULT_MARKDOWN);
    setIsSaved(true);
    setActiveFileId(null);
    setDocRevision((r) => r + 1);
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

  // Helper to read directory via File System Access API
  const scanDirectoryHandle = async (handle: FileSystemDirectoryHandle) => {
    try {
      const items: DirectoryFileItem[] = [];
      // Type assertion for entries iterator
      for await (const [name, entry] of (handle as any).entries()) {
        if (entry.kind === 'file') {
          const lower = name.toLowerCase();
          const isMd = lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt');
          items.push({
            id: name,
            name,
            handle: entry as FileSystemFileHandle,
            isMarkdown: isMd,
          });
        }
      }
      // Sort markdown files first, then alphabetically
      items.sort((a, b) => {
        if (a.isMarkdown && !b.isMarkdown) return -1;
        if (!a.isMarkdown && b.isMarkdown) return 1;
        return a.name.localeCompare(b.name);
      });
      setDirFiles(items);
      setDirName(handle.name);
      setDirHandle(handle);
      setNativeDirPath(null);
      setIsSidebarOpen(true);
    } catch (err) {
      console.error('Error scanning directory:', err);
    }
  };

  // Scan directory via Tauri native plugin-fs
  const scanNativeDirectory = async (folderPath: string) => {
    try {
      const { readDir } = await import('@tauri-apps/plugin-fs');
      const entries = await readDir(folderPath);
      const items: DirectoryFileItem[] = [];

      for (const entry of entries) {
        if (entry.isFile) {
          const lower = entry.name.toLowerCase();
          const isMd = lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt');
          const sep = folderPath.includes('\\') ? '\\' : '/';
          const fullPath = folderPath.endsWith(sep) ? `${folderPath}${entry.name}` : `${folderPath}${sep}${entry.name}`;
          items.push({
            id: fullPath,
            name: entry.name,
            nativePath: fullPath,
            isMarkdown: isMd,
          });
        }
      }

      items.sort((a, b) => {
        if (a.isMarkdown && !b.isMarkdown) return -1;
        if (!a.isMarkdown && b.isMarkdown) return 1;
        return a.name.localeCompare(b.name);
      });

      const parts = folderPath.replace(/\\/g, '/').split('/');
      const detectedName = parts.filter(Boolean).pop() || folderPath;
      setDirName(detectedName);
      setNativeDirPath(folderPath);
      setDirFiles(items);
      setIsSidebarOpen(true);
    } catch (err) {
      console.error('Tauri readDir failed:', err);
    }
  };

  // Select Directory triggered by Open button
  const handleOpenDirectory = async () => {
    // 1. If running inside Tauri desktop app, use native OS Folder Dialog ("Select Folder" / "Open")
    if (typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog');
        const selected = await open({
          directory: true,
          multiple: false,
          title: 'Select Folder',
        });
        if (selected && typeof selected === 'string') {
          await scanNativeDirectory(selected);
          return;
        }
      } catch (err) {
        console.warn('Tauri open dialog error, falling back:', err);
      }
    }

    // 2. Modern Web Browser API (showDirectoryPicker)
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker();
        await scanDirectoryHandle(handle);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
        console.warn('showDirectoryPicker failed or cancelled, falling back to input:', err);
      }
    }

    // 3. Fallback to directory input element
    if (dirInputRef.current) {
      dirInputRef.current.click();
    }
  };

  // Handle directory files from fallback input (webkitdirectory)
  const handleDirectoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const items: DirectoryFileItem[] = [];
    let detectedDirName = 'Selected Folder';

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const relPath = file.webkitRelativePath || file.name;
      if (i === 0 && file.webkitRelativePath) {
        detectedDirName = file.webkitRelativePath.split('/')[0] || 'Selected Folder';
      }
      const lower = file.name.toLowerCase();
      const isMd = lower.endsWith('.md') || lower.endsWith('.markdown') || lower.endsWith('.txt');

      items.push({
        id: relPath,
        name: file.name,
        relativePath: relPath,
        file: file,
        isMarkdown: isMd,
      });
    }

    items.sort((a, b) => {
      if (a.isMarkdown && !b.isMarkdown) return -1;
      if (!a.isMarkdown && b.isMarkdown) return 1;
      return a.name.localeCompare(b.name);
    });

    setDirName(detectedDirName);
    setDirFiles(items);
    setIsSidebarOpen(true);
    e.target.value = '';
  };

  // Handle selecting a file from sidebar
  const handleSelectFileItem = async (fileItem: DirectoryFileItem) => {
    try {
      let text = '';
      if (fileItem.nativePath) {
        const { readTextFile } = await import('@tauri-apps/plugin-fs');
        text = await readTextFile(fileItem.nativePath);
      } else if (fileItem.handle) {
        const file = await fileItem.handle.getFile();
        text = await file.text();
      } else if (fileItem.file) {
        text = await fileItem.file.text();
      }
      setContent(text);
      setActiveFileId(fileItem.id);
      setIsSaved(true);
      setDocRevision((r) => r + 1);
    } catch (err) {
      console.error('Failed to read file:', err);
    }
  };

  const handleRefreshDirectory = async () => {
    if (nativeDirPath) {
      await scanNativeDirectory(nativeDirPath);
    } else if (dirHandle) {
      await scanDirectoryHandle(dirHandle);
    }
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
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: isSaved ? '#10b981' : '#ef4444',
                  boxShadow: isSaved ? '0 0 6px rgba(16, 185, 129, 0.4)' : '0 0 6px rgba(239, 68, 68, 0.5)',
                  transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                  display: 'inline-block',
                }}
                title={isSaved ? 'Document Saved' : 'Document Modified'}
              />
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

          {/* New Document Button */}
          <button
            onClick={handleNewDocument}
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
            title="New Document"
          >
            <FilePlus size={15} />
          </button>

          {/* Hidden Directory Input (Fallback) */}
          <input
            type="file"
            ref={dirInputRef}
            onChange={handleDirectoryInputChange}
            // @ts-ignore
            webkitdirectory=""
            directory=""
            multiple
            style={{ display: 'none' }}
          />

          {/* Browse Directory Button */}
          <button
            onClick={handleOpenDirectory}
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
            title="Browse Directory / Select Folder"
          >
            <FolderOpen size={15} />
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

          {/* Export Standalone HTML (styled same as other toolbar buttons) */}
          <button
            onClick={handleExportHtml}
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
        {/* Left: Directory Files Sidebar */}
        <FileSidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen((open) => !open)}
          dirName={dirName}
          files={dirFiles}
          activeFileId={activeFileId}
          onSelectFile={handleSelectFileItem}
          onOpenDirectory={handleOpenDirectory}
          onRefresh={dirHandle || nativeDirPath ? handleRefreshDirectory : undefined}
        />

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
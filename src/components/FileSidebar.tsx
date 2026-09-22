import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  FileCode,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

export interface DirectoryFileItem {
  id: string;
  name: string;
  relativePath?: string;
  nativePath?: string;
  handle?: FileSystemFileHandle;
  file?: File;
  isMarkdown: boolean;
}

interface FileSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  dirName: string | null;
  files: DirectoryFileItem[];
  activeFileId: string | null;
  onSelectFile: (fileItem: DirectoryFileItem) => void;
  onOpenDirectory: () => void;
  onRefresh?: () => void;
}

export const FileSidebar: React.FC<FileSidebarProps> = ({
  isOpen,
  onToggle,
  dirName,
  files,
  activeFileId,
  onSelectFile,
  onOpenDirectory,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) {
    return (
      <aside
        style={{
          width: '42px',
          borderRight: '1px solid var(--border)',
          backgroundColor: 'var(--bg-toolbar)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '10px 0',
          gap: '8px',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <button
          onClick={onToggle}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Open Files Sidebar"
        >
          <ChevronRight size={16} />
        </button>
        <button
          onClick={onOpenDirectory}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--btn-bg)',
            color: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Choose Directory"
        >
          <FolderOpen size={16} />
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        width: '260px',
        borderRight: '1px solid var(--border)',
        backgroundColor: 'var(--bg-toolbar)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flexShrink: 0,
        userSelect: 'none',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <Folder size={17} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-main)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={dirName || 'No Folder Selected'}
          >
            {dirName || 'Workspace'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
              }}
              title="Refresh Directory"
            >
              <RefreshCw size={13} />
            </button>
          )}
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* Directory Actions bar */}
      <div
        style={{
          padding: '8px 12px',
          display: 'flex',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={onOpenDirectory}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '12px',
            padding: '6px 8px',
            borderRadius: '6px',
            backgroundColor: 'var(--btn-bg)',
            border: '1px solid var(--border)',
            color: 'var(--text-main)',
            cursor: 'pointer',
            fontWeight: 500,
          }}
          title="Select Directory / Folder"
        >
          <FolderOpen size={14} style={{ color: 'var(--accent)' }} />
          <span>Select Folder</span>
        </button>
      </div>

      {/* Search Filter */}
      {files.length > 0 && (
        <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--btn-bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 8px',
              gap: '6px',
            }}
          >
            <Search size={13} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search files..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '12px',
              }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '6px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {files.length === 0 ? (
          <div
            style={{
              padding: '32px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <FolderOpen size={28} style={{ opacity: 0.4 }} />
            <span>No folder opened</span>
            <button
              onClick={onOpenDirectory}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: 'var(--btn-bg)',
                border: '1px solid var(--border)',
                color: 'var(--accent)',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Open Directory
            </button>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
            No matching files
          </div>
        ) : (
          filteredFiles.map((f) => {
            const isActive = f.id === activeFileId;
            return (
              <button
                key={f.id}
                onClick={() => onSelectFile(f)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  backgroundColor: isActive ? 'var(--accent-glow)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-main)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '12px',
                  width: '100%',
                  outline: 'none',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.04)';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
                title={f.name}
              >
                {f.isMarkdown ? (
                  <FileText size={15} style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} />
                ) : (
                  <FileCode size={15} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                )}
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}
                >
                  {f.name}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      {files.length > 0 && (
        <div
          style={{
            padding: '6px 12px',
            borderTop: '1px solid var(--border)',
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <span>{files.length} items</span>
          <span>{files.filter((f) => f.isMarkdown).length} markdown</span>
        </div>
      )}
    </aside>
  );
};

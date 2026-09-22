# MDEdit

A modern, high-performance Markdown Viewer and Visual Editor with native support for the **Triple Visual Diagram Engine**:

- **Mermaid.js Diagrams**: Flowcharts, sequences, state diagrams, class diagrams, mindmaps, etc.
- **Editorial Native SVG Diagrams**: Zero-sandbox, DOM-rendered vector diagrams with instant 4-theme dynamic recoloring (Clean Light, Dark Slate, Warm Paper, Original), smooth wheel zoom (40%–400%), and pan.
- **Draw.io (diagrams.net) Interactive Architecture Models**: Embedded viewer with bi-directional postMessage communication, auto-deflate unpacking, direct diagrams.net editor launch, and PNG/SVG export.
- **Standalone HTML Export Engine**: Inspired by SLS and MiniBot, exports a 100% self-contained single `.html` document for offline reading, sharing, and standard A4 PDF printing.

## Quick Start (Web)
```bash
npm run dev
```

## Desktop Standalone App (Tauri v2)
To run the desktop app in development mode:
```bash
npm run tauri dev
```

To build standalone Windows release executables:
```bash
npm run tauri:build
```
Build artifacts are placed in the `release/` directory:
- **`release/MDEdit.exe`**: Portable standalone executable (no installation required).
- **`release/MDEdit_1.0.0_x64-setup.exe`**: Windows NSIS setup installer.
- **`release/MDEdit_1.0.0_x64_en-US.msi`**: Windows MSI installer package.
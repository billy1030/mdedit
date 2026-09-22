# MDEdit Studio

A modern, high-performance Markdown Viewer and Visual Editor with native support for the **Triple Visual Diagram Engine**:

- **Mermaid.js Diagrams**: Flowcharts, sequences, state diagrams, class diagrams, mindmaps, etc.
- **Editorial Native SVG Diagrams**: Zero-sandbox, DOM-rendered vector diagrams with instant 4-theme dynamic recoloring (Clean Light, Dark Slate, Warm Paper, Original), smooth wheel zoom (40%–400%), and pan.
- **Draw.io (diagrams.net) Interactive Architecture Models**: Embedded viewer with bi-directional postMessage communication, auto-deflate unpacking, direct diagrams.net editor launch, and PNG/SVG export.
- **Standalone HTML Export Engine**: Inspired by SLS and MiniBot, exports a 100% self-contained single `.html` document for offline reading, sharing, and standard A4 PDF printing.

## Project Location
`C:\ai\mdedit`

## Quick Start
Run the convenient startup batch file:
```cmd
C:\ai\mdedit\start.bat
```
Or run via terminal:
```bash
cd C:\ai\mdedit
npm run dev
```
Then open your browser at **http://localhost:5188**.

## Production Build
```bash
cd C:\ai\mdedit
npm run build
```
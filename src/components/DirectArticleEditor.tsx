import React, { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import { MermaidDiagram } from "./MermaidDiagram";
import { SvgDiagramViewer } from "./SvgDiagramViewer";
import { DrawioViewer } from "./DrawioViewer";

interface DirectArticleEditorProps {
  markdown?: string;
  content?: string;
  onChange: (markdown: string) => void;
  onSave?: () => void;
  isSaved?: boolean;
  isSplitView?: boolean;
  contentWidth?: number;
}

interface EditorSection {
  textHtml: string;
  mermaidCode?: string;
  svgCode?: string;
  drawioCode?: string;
  id: string;
}

export const DirectArticleEditor: React.FC<DirectArticleEditorProps> = ({
  markdown,
  content,
  onChange,
  isSplitView = false,
  contentWidth: propContentWidth
}) => {
  const activeMarkdown = markdown !== undefined ? markdown : (content || "");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isInternalChangeRef = useRef(false);
  const [contentWidthState] = useState<number>(82);
  const contentWidth = propContentWidth ?? contentWidthState;

  // Parse markdown into SLS-style sections
  const parseMarkdownToSections = (mdText: string): EditorSection[] => {
    let md = mdText || "";

    const svgBlocks: string[] = [];
    const drawioBlocks: string[] = [];

    const sanitizeSvgXML = (svg: string): string => {
      const startIdx = svg.indexOf("<svg");
      if (startIdx === -1) return svg;
      let clean = svg.slice(startIdx);
      const endIdx = clean.lastIndexOf("</svg>");
      if (endIdx !== -1) {
        clean = clean.slice(0, endIdx + 6);
      }
      return clean.replace(/```&(?!(?:amp|lt|gt|quot|apos|#\d+|#[xX][0-9a-fA-F]+);)/g, "&amp;");
    };

    // 1. Extract Draw.io blocks
    md = md.replace(/```(?:drawio|mxfile)\s*([\s\S]*?)```/gi, (_match, code) => {
      const token = "SLSDRAWIOTOKEN" + drawioBlocks.length + "END";
      drawioBlocks.push(code.trim());
      return "\n\n" + token + "\n\n";
    });
    md = md.replace(/```(?:xml)?\s*(<mxfile[\s\S]*?<\/mxfile>|<diagram[\s\S]*?<\/diagram>)\s*```/gi, (_match, code) => {
      const token = "SLSDRAWIOTOKEN" + drawioBlocks.length + "END";
      drawioBlocks.push(code.trim());
      return "\n\n" + token + "\n\n";
    });

    // 2. Extract SVG blocks in code fences
    md = md.replace(/```(?:xml|html|svg)?\s*(<svg[\s\S]*?<\/svg>)\s*```/gi, (_match, svgContent) => {
      const token = "SLSSVGTOKEN" + svgBlocks.length + "END";
      svgBlocks.push(sanitizeSvgXML(svgContent.trim()));
      return "\n\n" + token + "\n\n";
    });

    // 3. Extract raw SVG tags
    md = md.replace(/```(<div[\s\S]*?<svg[\s\S]*?<\/svg>[\s\S]*?<\/div>|<svg[\s\S]*?<\/svg>)/gi, (match) => {
      const token = `SLSSVGTOKEN${svgBlocks.length}END`;
      svgBlocks.push(sanitizeSvgXML(match.trim()));
      return `\n\n${token}\n\n`;
    });

    const parsedSections: EditorSection[] = [];
    let counter = 0;

    const splitTextAndDiagramTokens = (text: string, trailingMermaidCode?: string) => {
      const TOKEN_REGEX = /SLS(SVG|DRAWIO)TOKEN(\d+)END/g;
      let lastIdx = 0;
      let m: RegExpExecArray | null;

      while ((m = TOKEN_REGEX.exec(text)) !== null) {
        if (m.index > lastIdx) {
          const piece = text.slice(lastIdx, m.index);
          const textHtml = marked.parse(piece, { async: false }) as string;
          parsedSections.push({
            textHtml,
            id: `sec_${counter++}`
          });
        }

        const type = m[1];
        const blockIdx = parseInt(m[2], 10);
        if (type === "SVG" && svgBlocks[blockIdx] !== undefined) {
          parsedSections.push({
            textHtml: "",
            svgCode: svgBlocks[blockIdx],
            id: `svg_${counter++}`
          });
        } else if (type === "DRAWIO" && drawioBlocks[blockIdx] !== undefined) {
          parsedSections.push({
            textHtml: "",
            drawioCode: drawioBlocks[blockIdx],
            id: `drawio_${counter++}`
          });
        }
        lastIdx = m.index + m[0].length;
      }

      const remainingPiece = text.slice(lastIdx);
      const textHtml = marked.parse(remainingPiece, { async: false }) as string;
      parsedSections.push({
        textHtml,
        mermaidCode: trailingMermaidCode,
        id: trailingMermaidCode ? `mermaid_${counter++}` : `sec_${counter++}`
      });
    };

    const mermaidRegex = /```mermaid([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = mermaidRegex.exec(md)) !== null) {
      const textBefore = md.slice(lastIndex, match.index);
      const diagramCode = match[1].trim();
      splitTextAndDiagramTokens(textBefore, diagramCode);
      lastIndex = match.index + match[0].length;
    }

    const tailText = md.slice(lastIndex);
    splitTextAndDiagramTokens(tailText);

    return parsedSections;
  };

  // SLS DOM Serializer: Walks section DOM nodes and produces pristine Markdown
  const serializeAllSectionsToMarkdown = (): string => {
    const serializeSectionDom = (root: HTMLElement): string => {
      const walk = (node: Node): string => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) return "";

        const el = node as HTMLElement;
        const tag = el.tagName.toLowerCase();
        const childrenText = Array.from(el.childNodes).map(walk).join("");

        switch (tag) {
          case "h1":
            return `\n\n# ${childrenText.trim()}\n\n`;
          case "h2":
            return `\n\n## ${childrenText.trim()}\n\n`;
          case "h3":
            return `\n\n### ${childrenText.trim()}\n\n`;
          case "h4":
            return `\n\n#### ${childrenText.trim()}\n\n`;
          case "h5":
            return `\n\n##### ${childrenText.trim()}\n\n`;
          case "h6":
            return `\n\n###### ${childrenText.trim()}\n\n`;
          case "p":
            return `\n\n${childrenText.trim()}\n\n`;
          case "strong":
          case "b":
            return `**${childrenText}**`;
          case "em":
          case "i":
            return `*${childrenText}*`;
          case "code":
            if (el.parentElement && el.parentElement.tagName.toLowerCase() === "pre") {
              return childrenText;
            }
            return "`" + childrenText + "`";
          case "pre": {
            const lang = (el.className.match(/language-(\w+)/) || [])[1] || "";
            return "\n\n```" + lang + "\n" + (el.textContent || "") + "\n```\n\n";
          }
          case "blockquote":
            return `\n\n> ${childrenText.trim().split("\n").join("\n> ")}\n\n`;
          case "ul": {
            const items = Array.from(el.children)
              .filter(c => c.tagName.toLowerCase() === "li")
              .map(c => `- ${Array.from(c.childNodes).map(walk).join("").trim()}`)
              .join("\n");
            return `\n\n${items}\n\n`;
          }
          case "ol": {
            const items = Array.from(el.children)
              .filter(c => c.tagName.toLowerCase() === "li")
              .map((c, i) => `${i + 1}. ${Array.from(c.childNodes).map(walk).join("").trim()}`)
              .join("\n");
            return `\n\n${items}\n\n`;
          }
          case "a": {
            const href = el.getAttribute("href") || "";
            return `[${childrenText}](${href})`;
          }
          case "img": {
            const alt = el.getAttribute("alt") || "";
            const src = el.getAttribute("src") || "";
            return `![${alt}](${src})`;
          }
          case "hr":
            return `\n\n---\n\n`;
          case "table": {
            const rows = Array.from(el.querySelectorAll("tr"));
            if (rows.length === 0) return "";
            const headerRow = rows[0];
            const ths = Array.from(headerRow.querySelectorAll("th, td")).map(c => (c.textContent || "").trim());
            let mdTable = `\n\n| ${ths.join(" | ")} |\n| ${ths.map(() => ":---").join(" | ")} |\n`;
            for (let r = 1; r < rows.length; r++) {
              const tds = Array.from(rows[r].querySelectorAll("td")).map(c => (c.textContent || "").trim());
              mdTable += `| ${tds.join(" | ")} |\n`;
            }
            return `${mdTable}\n`;
          }
          case "br":
            return "\n";
          case "div":
            return `\n${childrenText}\n`;
          default:
            return childrenText;
        }
      };

      return Array.from(root.childNodes).map(walk).join("");
    };

    let fullMarkdown = "";
    sections.forEach((sec, idx) => {
      const domNode = sectionRefs.current[idx];
      const textMd = domNode ? serializeSectionDom(domNode).trim() : "";
      if (textMd) {
        fullMarkdown += textMd + "\n\n";
      }
      if (sec.mermaidCode) {
        fullMarkdown += "```mermaid\n" + sec.mermaidCode.trim() + "\n```\n\n";
      }
      if (sec.svgCode) {
        fullMarkdown += "```svg\n" + sec.svgCode.trim() + "\n```\n\n";
      }
      if (sec.drawioCode) {
        fullMarkdown += "```drawio\n" + sec.drawioCode.trim() + "\n```\n\n";
      }
    });

    return fullMarkdown.replace(/```\n{3,}/g, "\n\n").trim() + "\n";
  };

  // Sync external markdown changes into sections
  useEffect(() => {
    if (isInternalChangeRef.current) {
      isInternalChangeRef.current = false;
      return;
    }
    const parsed = parseMarkdownToSections(activeMarkdown);
    setSections(parsed);
    sectionRefs.current.forEach((el, idx) => {
      if (el && parsed[idx]) {
        el.innerHTML = parsed[idx].textHtml;
        el.setAttribute("data-initialized", "true");
      }
    });
  }, [activeMarkdown]);

  const handleInput = () => {
    isInternalChangeRef.current = true;
    const newMd = serializeAllSectionsToMarkdown();
    onChange(newMd);
  };

  return (
    <div
      className="direct-editor-container"
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        backgroundColor: "var(--bg-app, #f1f5f9)",
        padding: isSplitView ? "0.75rem" : "0 1rem 0 1rem",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      {/* Horizontal Divider Line between Top Toolbar & Workspace */}
      <div
        style={{
          width: "100%",
          height: "1px",
          backgroundColor: "var(--border, #e2e8f0)",
          marginBottom: "12px",
          flexShrink: 0
        }}
      />

      {/* Document Sheet (Styled according to Header Width % Slider, extends to bottom) */}
      <div
        style={{
          width: isSplitView ? "100%" : `${contentWidth}%`,
          maxWidth: isSplitView ? "100%" : "1400px",
          minHeight: "100%",
          flex: "1 0 auto",
          margin: "0 auto",
          backgroundColor: "var(--bg-secondary, #ffffff)",
          border: isSplitView ? "none" : "1px solid var(--border, #e2e8f0)",
          borderBottom: "none",
          borderRadius: isSplitView ? "0" : "12px 12px 0 0",
          borderBottomLeftRadius: "0 !important" as any,
          borderBottomRightRadius: "0 !important" as any,
          boxShadow: isSplitView ? "none" : "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.03)",
          padding: isSplitView ? "1rem" : "2.5rem 3rem 4rem 3rem",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "1.25rem",
          transition: "width 0.15s ease-out"
        }}
      >
        {sections.map((sec, idx) => (
          <React.Fragment key={sec.id || `sec_${idx}`}>
            {/* SLS Editable Text Block */}
            <div
              ref={(el) => {
                sectionRefs.current[idx] = el;
                if (el && !el.hasAttribute("data-initialized")) {
                  el.innerHTML = sec.textHtml;
                  el.setAttribute("data-initialized", "true");
                }
              }}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onInput={handleInput}
              className="markdown-body wysiwyg-canvas"
              style={{
                outline: "none",
                minHeight: sec.textHtml ? "24px" : "0px",
                lineHeight: "1.7",
                fontSize: "15px",
                color: "var(--text-main, #0f172a)"
              }}
            />

            {/* Mermaid Diagram Card */}
            {sec.mermaidCode && (
              <div
                style={{
                  margin: "1.5rem 0",
                  userSelect: "none"
                }}
                contentEditable={false}
              >
                <MermaidDiagram code={sec.mermaidCode} index={idx}  />
              </div>
            )}

            {/* SVG Diagram Card */}
            {sec.svgCode && (
              <div
                style={{
                  margin: "1.5rem 0",
                  userSelect: "none"
                }}
                contentEditable={false}
              >
                <SvgDiagramViewer svgContent={sec.svgCode} index={idx} />
              </div>
            )}

            {/* Draw.io Diagram Card */}
            {sec.drawioCode && (
              <div
                style={{
                  margin: "1.5rem 0",
                  userSelect: "none"
                }}
                contentEditable={false}
              >
                <DrawioViewer xml={sec.drawioCode} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

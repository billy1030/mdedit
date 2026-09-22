import React, { useCallback, useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import {
  Network,
  X,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Copy,
  Check,
  Code,
  Eye,
  ChevronsDownUp
} from 'lucide-react';
import { sanitizeMermaidCode } from '../utils/mermaidGuardrail';

export type MermaidThemeId = 'sky' | 'emerald' | 'indigo' | 'amber' | 'midnight';

export interface ThemePreset {
  id: MermaidThemeId;
  label: string;
  dotColor: string;
  isDark: boolean;
  clusterBkg: string;
  clusterBorder: string;
  themeVariables: Record<string, any>;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'sky',
    label: 'Tech Sky',
    dotColor: '#38bdf8',
    isDark: false,
    clusterBkg: '#f8fafc',
    clusterBorder: '#93c5fd',
    themeVariables: {
      darkMode: false,
      background: '#ffffff',
      mainBkg: '#f8fafc',
      primaryColor: '#f0f9ff',
      primaryTextColor: '#0f172a',
      primaryBorderColor: '#38bdf8',
      secondaryColor: '#f8fafc',
      secondaryTextColor: '#1e293b',
      secondaryBorderColor: '#cbd5e1',
      tertiaryColor: '#f1f5f9',
      tertiaryTextColor: '#1e293b',
      tertiaryBorderColor: '#94a3b8',
      lineColor: '#2563eb',
      textColor: '#0f172a',
      clusterBkg: '#f8fafc',
      clusterBorder: '#93c5fd',
      nodeBorder: '#0284c7',
      defaultLinkColor: '#2563eb',
      titleColor: '#0369a1',
      edgeLabelBackground: '#ffffff',
      nodeTextColor: '#0f172a',
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif'
    }
  },
  {
    id: 'emerald',
    label: 'Fresh Emerald',
    dotColor: '#10b981',
    isDark: false,
    clusterBkg: '#f0fdf4',
    clusterBorder: '#86efac',
    themeVariables: {
      darkMode: false,
      background: '#ffffff',
      mainBkg: '#f0fdf4',
      primaryColor: '#ecfdf5',
      primaryTextColor: '#064e3b',
      primaryBorderColor: '#34d399',
      secondaryColor: '#f0fdf4',
      secondaryTextColor: '#065f46',
      secondaryBorderColor: '#a7f3d0',
      tertiaryColor: '#d1fae5',
      tertiaryTextColor: '#064e3b',
      tertiaryBorderColor: '#6ee7b7',
      lineColor: '#059669',
      textColor: '#064e3b',
      clusterBkg: '#f0fdf4',
      clusterBorder: '#86efac',
      nodeBorder: '#059669',
      defaultLinkColor: '#059669',
      titleColor: '#047857',
      edgeLabelBackground: '#ffffff',
      nodeTextColor: '#064e3b',
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif'
    }
  },
  {
    id: 'indigo',
    label: 'Aurora Indigo',
    dotColor: '#6366f1',
    isDark: false,
    clusterBkg: '#f5f3ff',
    clusterBorder: '#c7d2fe',
    themeVariables: {
      darkMode: false,
      background: '#ffffff',
      mainBkg: '#f5f3ff',
      primaryColor: '#eef2ff',
      primaryTextColor: '#1e1b4b',
      primaryBorderColor: '#818cf8',
      secondaryColor: '#f5f3ff',
      secondaryTextColor: '#312e81',
      secondaryBorderColor: '#c7d2fe',
      tertiaryColor: '#ede9fe',
      tertiaryTextColor: '#1e1b4b',
      tertiaryBorderColor: '#a5b4fc',
      lineColor: '#4f46e5',
      textColor: '#1e1b4b',
      clusterBkg: '#f5f3ff',
      clusterBorder: '#c7d2fe',
      nodeBorder: '#4f46e5',
      defaultLinkColor: '#4f46e5',
      titleColor: '#4338ca',
      edgeLabelBackground: '#ffffff',
      nodeTextColor: '#1e1b4b',
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif'
    }
  },
  {
    id: 'amber',
    label: 'Warm Amber',
    dotColor: '#f59e0b',
    isDark: false,
    clusterBkg: '#ede3cb',
    clusterBorder: '#c4b087',
    themeVariables: {
      darkMode: false,
      background: '#fbf7ee',
      mainBkg: '#f6f1e3',
      primaryColor: '#ede4cf',
      primaryTextColor: '#382e21',
      primaryBorderColor: '#b49f70',
      secondaryColor: '#f1ebd8',
      secondaryTextColor: '#382e21',
      secondaryBorderColor: '#c4ad7c',
      tertiaryColor: '#e8ddc4',
      tertiaryTextColor: '#382e21',
      tertiaryBorderColor: '#9f8859',
      lineColor: '#8c6f3e',
      textColor: '#382e21',
      clusterBkg: '#ede3cb',
      clusterBorder: '#c4b087',
      nodeBorder: '#b49f70',
      defaultLinkColor: '#8c6f3e',
      titleColor: '#5c4b32',
      edgeLabelBackground: '#f6f1e3',
      nodeTextColor: '#382e21',
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif'
    }
  },
  {
    id: 'midnight',
    label: 'Deep Midnight',
    dotColor: '#1e293b',
    isDark: true,
    clusterBkg: '#0f172a',
    clusterBorder: '#38bdf8',
    themeVariables: {
      darkMode: true,
      background: '#020617',
      mainBkg: '#0f172a',
      primaryColor: '#1e293b',
      primaryTextColor: '#f8fafc',
      primaryBorderColor: '#38bdf8',
      secondaryColor: '#172554',
      secondaryTextColor: '#f1f5f9',
      secondaryBorderColor: '#60a5fa',
      tertiaryColor: '#1e1b4b',
      tertiaryTextColor: '#f1f5f9',
      tertiaryBorderColor: '#93c5fd',
      lineColor: '#38bdf8',
      textColor: '#f8fafc',
      clusterBkg: '#0f172a',
      clusterBorder: '#38bdf8',
      nodeBorder: '#38bdf8',
      defaultLinkColor: '#38bdf8',
      titleColor: '#7dd3fc',
      edgeLabelBackground: '#1e293b',
      nodeTextColor: '#f8fafc',
      fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif'
    }
  }
];

interface MermaidDiagramProps {
  code: string;
  index?: number;
}

export const MermaidDiagram: React.FC<MermaidDiagramProps> = ({ code, index = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const modalViewportRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  const [svgContent, setSvgContent] = useState<string>('');
  const [isCodeCopied, setIsCodeCopied] = useState<boolean>(false);
  const [isCodeVisible, setIsCodeVisible] = useState<boolean>(false);
  const [showColorMenu, setShowColorMenu] = useState<boolean>(false);

  // 色彩風格狀態 (預設 light 模式 'sky')
  const [selectedTheme, setSelectedTheme] = useState<MermaidThemeId>('sky');

  // é»žæ“Šé ¸å–®å¤–éƒ¨è‡ªå‹•é—œé–‰è‰²å½©ä¸»é¡Œé ¸å–®
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (colorMenuRef.current && !colorMenuRef.current.contains(e.target as Node)) {
        setShowColorMenu(false);
      }
    };
    if (showColorMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorMenu]);

  // å¤–æ¡†å¯¬åº¦ä¸‰ç´šç‹€æ…‹ï¼š0 (é è¨­), 1 (4:3 å±•é–‹), 2 (æ”¾åˆ°æœ€å¤§ 80vw å…¨å±è¦–é‡Ž)
  const [expandLevel, setExpandLevel] = useState<number>(0);

  // ç¸®æ”¾èˆ‡å¹³ç§»ç‹€æ…‹ (50% ~ 500%)
  const [inlineScale, setInlineScale] = useState(1.0);
  const [inlinePan, setInlinePan] = useState({ x: 0, y: 0 });
  const [isInlineDragging, setIsInlineDragging] = useState(false);
  const inlineDragStart = useRef({ x: 0, y: 0, initialPanX: 0, initialPanY: 0 });

  const MIN_ZOOM = 0.5;
  const MAX_ZOOM = 5.0;
  const ZOOM_STEP = 0.25;

  // åŽŸå§‹ SVG å°ºå¯¸ç´€éŒ„
  const [, setNativeSvgDim] = useState<{ width: number; height: number } | null>(null);

  // ç¯€é»žè¡Œè·èˆ‡ä¸Šä¸‹å±¤ç´šé–“è·ç‹€æ…‹ (é è¨­ rankSpacing 50, lineHeight 1.2)
  const [lineHeight, setLineHeight] = useState(1.2);
  const [rankSpacing, setRankSpacing] = useState(50);

  // ä¾ç•¶å‰æ”¾å¤§å€çŽ‡è‡ªå‹•åµæ¸¬ä¸¦ç·Šç¸®æ¶ˆé™¤ä¸Šä¸‹ç•™ç™½é‚Šè· (é è¨­å•Ÿç”¨)
  const [isReduceMargin, setIsReduceMargin] = useState(false);
  const [tightHeight, setTightHeight] = useState<number | null>(null);
  const [dynamicWidthStyle, setDynamicWidthStyle] = useState<{ width?: string; marginLeft?: string }>({});

  const [renderError, setRenderError] = useState<string | null>(null);

  // Normalize Mermaid SVG after rendering (prevent responsive sizing from restricting 500% zoom)
  useEffect(() => {
    if (!svgContent || !containerRef.current) return;

    const timer = window.setTimeout(() => {
      const svg = containerRef.current?.querySelector('svg') as SVGSVGElement | null;
      if (!svg) return;

      svg.style.maxWidth = 'none';
      svg.style.width = 'auto';
      svg.style.height = 'auto';
      svg.style.display = 'block';
      svg.style.flexShrink = '0';
    }, 0);

    return () => window.clearTimeout(timer);
  }, [svgContent]);

  // ä¾ç•¶å‰æ”¾å¤§å€çŽ‡ (scale) è‡ªå‹•åµæ¸¬åœ–è¡¨å…§å®¹çœŸå¯¦ç¾æœ‰é«˜åº¦ï¼Œè¨ˆç®—æ¶ˆé™¤ä¸Šä¸‹ç•™ç™½å¾Œçš„ç·Šæ¹Šé«˜åº¦
  const calculateTightHeight = (scale: number): number | null => {
    const container = containerRef.current;
    if (!container) return null;
    const svg = container.querySelector('svg');
    if (!svg) return null;

    let baseHeight = 0;
    const isTall = svg.classList.contains('mermaid-tall-chart');
    try {
      const rect = svg.getBoundingClientRect();
      if (rect && rect.height > 0) {
        baseHeight = rect.height / (scale || 1.0);
      }
    } catch {
      // ignore
    }

    if (!baseHeight) {
      try {
        const bbox = svg.getBBox();
        if (bbox && bbox.height > 0 && bbox.width > 0) {
          if (isTall || bbox.height / bbox.width > 1.33) {
            baseHeight = Math.min(480, bbox.height);
          } else {
            const clientW = svg.clientWidth || container.clientWidth || 800;
            const widthRatio = clientW / bbox.width;
            baseHeight = bbox.height * widthRatio;
          }
        }
      } catch {
        // ignore
      }
    }

    if (baseHeight > 0) {
      if (isTall) {
        baseHeight = Math.min(baseHeight, 480);
      }
      // æ ¹æ“šç•¶å‰æ”¾å¤§æ¯”ä¾‹è¨ˆç®—ç·Šå¯†é«˜åº¦ï¼Œä¸Šä¸‹å„ä¿ç•™ 8px å‘¼å¸é‚Šè· (å…± 16px)ï¼›è¨­å®šä¸Šé™ 750px é¿å… 500% ç¸®æ”¾æ™‚æ’çˆ†æŽ’ç‰ˆ
      const snug = Math.min(750, Math.round(baseHeight * scale + 16));
      return Math.max(60, snug);
    }
    return null;
  };

  const toggleReduceMargin = () => {
    if (!isReduceMargin) {
      const h = calculateTightHeight(inlineScale);
      setTightHeight(h);
      setIsReduceMargin(true);
      setInlinePan(p => ({ ...p, y: 0 }));
    } else {
      setIsReduceMargin(false);
      setTightHeight(null);
    }
  };

  // ç•¶å€çŽ‡è®Šå‹•æˆ– SVG è¼‰å…¥æ™‚é‡ç®—ç·Šæ¹Šé«˜åº¦
  useEffect(() => {
    if (isReduceMargin && svgContent) {
      const timer = setTimeout(() => {
        const h = calculateTightHeight(inlineScale);
        if (h) setTightHeight(h);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [inlineScale, isReduceMargin, svgContent]);

  // å‹•æ…‹æ›´æ–°åœ–è¡¨å±¤ç´šè¡Œè· (rankSpacing) èˆ‡ç¯€é»žå…§éƒ¨è¡Œè·
  const updateLineHeight = (val: number) => {
    const nextLh = parseFloat(val.toFixed(1));
    setLineHeight(nextLh);

    const calculatedSpacing = Math.round(50 + (nextLh - 1.2) * 55);
    setRankSpacing(Math.max(25, Math.min(150, calculatedSpacing)));

    const container = containerRef.current;
    if (!container) return;

    container.style.setProperty('--mermaid-node-line-height', nextLh.toString());

    // ç´” SVG æ¨¡å¼ (tspan dy)
    const tspans = container.querySelectorAll('tspan');
    tspans.forEach((ts, i) => {
      if (i > 0 && ts.getAttribute('dy')) {
        ts.setAttribute('dy', `${(nextLh * 1.1).toFixed(2)}em`);
      }
    });

    const textContainers = container.querySelectorAll('foreignObject, .nodeLabel, .label, text, .cluster-label, div, span');
    textContainers.forEach((el: any) => {
      el.style.setProperty('line-height', nextLh.toString(), 'important');
    });
  };

  // è®Šæ›´å±•é–‹ç­‰ç´š (0: é è¨­, 1: 4:3 å±•é–‹, 2: æ”¾åˆ°æœ€å¤§å…¨å±è¦–åœ–)
  const handleSetExpandLevel = (nextLevel: number) => {
    const target = Math.max(0, Math.min(2, nextLevel));
    setExpandLevel(target);

    if (target === 1) {
      const calculateDynamicBounds = () => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return { canvasW: 800, canvasH: 600 };
        const scrollParent = (wrapper.closest('.overflow-y-auto') || wrapper.parentElement) as HTMLElement | null;
        if (!scrollParent) return { canvasW: wrapper.clientWidth, canvasH: Math.round(wrapper.clientWidth * 0.75) };

        const availableWidth = scrollParent.clientWidth - 48;
        const currentArticleWidth = wrapper.parentElement?.clientWidth || 768;

        const extraSpace = Math.max(0, availableWidth - currentArticleWidth);
        const extendMargin = Math.min(extraSpace / 2, 260);

        if (extendMargin > 10) {
          setDynamicWidthStyle({
            width: `calc(100% + ${Math.round(extendMargin * 2)}px)`,
            marginLeft: `-${Math.round(extendMargin)}px`
          });
        } else {
          setDynamicWidthStyle({ width: '100%', marginLeft: '0px' });
        }

        const effectiveW = currentArticleWidth + extendMargin * 2;
        const effectiveH = Math.round(effectiveW * 0.75);
        return { canvasW: effectiveW, canvasH: effectiveH };
      };

      const { canvasW, canvasH } = calculateDynamicBounds();

      setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;
        const svg = container.querySelector('svg');
        if (!svg) return;

        let svgW = 0;
        let svgH = 0;
        try {
          const bbox = svg.getBBox();
          svgW = bbox.width || 0;
          svgH = bbox.height || 0;
        } catch {}

        if (!svgW || !svgH) {
          const rect = svg.getBoundingClientRect();
          svgW = rect.width / (inlineScale || 1);
          svgH = rect.height / (inlineScale || 1);
        }

        if (svgW > 0 && svgH > 0) {
          const chartAspect = svgW / svgH;
          const nodeCount = svg.querySelectorAll('.node, .cluster, .actor, .statediagram-state').length || 1;

          let bestScale = 1.0;
          if (nodeCount <= 3 && svgW < 300) {
            bestScale = 0.55;
          } else if (chartAspect < 0.65) {
            const fitH = (canvasH * 0.85) / svgH;
            bestScale = Math.max(0.6, Math.min(1.0, fitH));
          } else {
            const targetScaleX = (canvasW * 0.88) / svgW;
            const targetScaleY = (canvasH * 0.85) / svgH;
            bestScale = Math.min(targetScaleX, targetScaleY);
            bestScale = Math.max(0.6, Math.min(1.8, Number(bestScale.toFixed(2))));
          }

          setInlineScale(Number(bestScale.toFixed(2)));
          setInlinePan({ x: 0, y: 0 });
        }
      }, 120);
    } else {
      setDynamicWidthStyle({});
      setInlineScale(1.0);
      setInlinePan({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        setRenderError(null);
        const isDark = document.documentElement.classList.contains('dark');
        const isWarm = document.documentElement.classList.contains('warm');

        let activePreset = THEME_PRESETS.find(p => p.id === selectedTheme);
        if (!activePreset) {
          activePreset = isDark
            ? THEME_PRESETS.find(p => p.id === 'midnight')!
            : isWarm
            ? THEME_PRESETS.find(p => p.id === 'amber')!
            : THEME_PRESETS[0];
        }

        if (containerRef.current) {
          containerRef.current.style.setProperty('--mermaid-cluster-bg', activePreset.clusterBkg);
          containerRef.current.style.setProperty('--mermaid-cluster-border', activePreset.clusterBorder);
        }

        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: 'base',
          themeVariables: activePreset.themeVariables,
          securityLevel: 'loose',
          fontFamily: '"Roboto", -apple-system, BlinkMacSystemFont, "Noto Sans TC", sans-serif',
          fontSize: 13.5,
          flowchart: {
            useMaxWidth: false,
            htmlLabels: true,
            curve: 'basis',
            nodeSpacing: 45,
            rankSpacing: 48,
            padding: 12,
            wrappingWidth: 240
          },
          sequence: {
            diagramMarginX: 50,
            diagramMarginY: Math.round(rankSpacing * 0.6),
            actorFontSize: 14,
            messageFontSize: 13.5,
            noteFontSize: 13,
            width: 180,
            height: Math.round(rankSpacing)
          }
        });

        // ðŸ›¡ï¸ ç¬¬ä¸‰å±¤ï¼šå¼·æ•ˆæ¸…æ´— SVG å­—ä¸²ï¼Œå°‡ Mermaid å¯«æ­»åœ¨ SVG inline style è£¡çš„é è¨­æ·¡é»ƒè‰²å¾¹åº•æ›¿æ›
        const cleanSvgColors = (rawSvg: string, clusterBg: string) => {
          return rawSvg
            .replace(/#ffffde/gi, clusterBg)
            .replace(/#ffffcc/gi, clusterBg)
            .replace(/#ffffdf/gi, clusterBg)
            .replace(/#fffbe8/gi, clusterBg)
            .replace(/#fefae0/gi, clusterBg)
            .replace(/#ffffe0/gi, clusterBg);
        };

        // ðŸ›¡ï¸ ç¬¬ä¸€å±¤ï¼šä¸»å‹•åŸ·è¡Œ Guardrail è‡ªå‹•æ¸…æ´—ä¿®å¾©
        const sanitizedCode = sanitizeMermaidCode(code.trim());
        const id = `mermaid_${Date.now()}_${index}_${selectedTheme}`;
        let finalSvg = '';
        try {
          const { svg } = await mermaid.render(id, sanitizedCode);
          finalSvg = cleanSvgColors(svg, activePreset.clusterBkg);
        } catch {
          // ðŸ›¡ï¸ ç¬¬äºŒå±¤ï¼šè‹¥åˆæ¬¡æ¸²æŸ“å¤±æ•—ï¼Œå˜—è©¦æ·±åº¦è½‰ç¾©æ¸…æ´—å†æ¬¡å˜—è©¦
          const fallbackCode = sanitizeMermaidCode(sanitizedCode)
            .replace(/([A-Za-z0-9_]+)\[([^\]"]+)\]/g, '$1["$2"]')
            .replace(/([A-Za-z0-9_]+)\{([^}"]+)\}/g, '$1{"$2"}');
          const retryId = `retry_${Date.now()}_${index}_${selectedTheme}`;
          const { svg } = await mermaid.render(retryId, fallbackCode);
          finalSvg = cleanSvgColors(svg, activePreset.clusterBkg);
        }

        if (isMounted && finalSvg) {
          let isTallChart = false;
          const vbMatch = finalSvg.match(/viewBox=["']([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)\s+([0-9.-]+)["']/i);
          if (vbMatch) {
            const vbW = parseFloat(vbMatch[3]);
            const vbH = parseFloat(vbMatch[4]);
            if (vbW > 0 && vbH > 0) {
              setNativeSvgDim({ width: vbW, height: vbH });
              if (vbH / vbW > 1.33) {
                isTallChart = true;
              }
            }
          }

          if (isTallChart) {
            if (finalSvg.includes('class="')) {
              finalSvg = finalSvg.replace(/class=["']([^"']*)["']/i, 'class="$1 mermaid-tall-chart"');
            } else {
              finalSvg = finalSvg.replace(/<svg\b/i, '<svg class="mermaid-tall-chart" ');
            }
          }

          setSvgContent(finalSvg);
          setTimeout(() => {
            if (!containerRef.current) return;
            updateLineHeight(lineHeight);
            const svgEl = containerRef.current.querySelector('svg');
            if (svgEl) {
              try {
                const bbox = svgEl.getBBox();
                if (bbox.width > 0 && bbox.height > 0) {
                  setNativeSvgDim({ width: bbox.width, height: bbox.height });
                  if (bbox.height / bbox.width > 1.33) {
                    svgEl.classList.add('mermaid-tall-chart');
                  }
                }
              } catch {
                const rect = svgEl.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  setNativeSvgDim({ width: rect.width, height: rect.height });
                  if (rect.height / rect.width > 1.33) {
                    svgEl.classList.add('mermaid-tall-chart');
                  }
                }
              }
            }
          }, 50);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setRenderError(err?.message || 'Mermaid Render Error');
      }
    };

    renderChart();

    // ðŸŒ— ç›£è½æ—¥å¤œæ¨¡å¼åˆ‡æ›ï¼Œå³æ™‚é‡ç¹ªåœ–è¡¨é…è‰²
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
          const isDarkNow = document.documentElement.classList.contains('dark');
          setSelectedTheme(isDarkNow ? 'midnight' : 'sky');
          break;
        }
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      isMounted = false;
      observer.disconnect();
    };
  }, [code, index, lineHeight, selectedTheme]);

  // Zoom functions (50% ~ 500%)
  const zoomIn = () => {
    setInlineScale(current =>
      Math.min(
        MAX_ZOOM,
        Number((current + ZOOM_STEP).toFixed(2))
      )
    );
  };

  const zoomOut = () => {
    setInlineScale(current =>
      Math.max(
        MIN_ZOOM,
        Number((current - ZOOM_STEP).toFixed(2))
      )
    );
  };

  const resetZoom = () => {
    setInlineScale(1.0);
    setInlinePan({ x: 0, y: 0 });
  };

  // ðŸ›‘ Mouse-wheel zoom logic (æš«æ™‚åœç”¨ï¼šè®“ä½¿ç”¨è€…åœ¨æ»‘é¼ æ»¾å‹•æ™‚æ­£å¸¸ä¸Šä¸‹æ»¾å‹•æ•´å€‹å°è©±é é¢ï¼Œé¿å…æ””æˆªæ»¾è¼ªäº‹ä»¶)
  // è‹¥æ—¥å¾Œéœ€è¦æ¢å¾©æ»¾è¼ªç¸®æ”¾ï¼Œå¯å°‡ ENABLE_WHEEL_ZOOM è¨­ç‚º true
  const ENABLE_WHEEL_ZOOM = false;

  const handleWheelZoom = useCallback((e: WheelEvent) => {
    if (!ENABLE_WHEEL_ZOOM) return;
    e.preventDefault();
    e.stopPropagation();

    const direction = e.deltaY < 0 ? 1 : -1;

    setInlineScale(current =>
      Math.max(
        MIN_ZOOM,
        Math.min(
          MAX_ZOOM,
          Number((current + direction * ZOOM_STEP).toFixed(2))
        )
      )
    );
  }, []);

  // ç¶å®šåŽŸç”Ÿéžè¢«å‹• (passive: false) wheel ç›£è½å™¨ (ç•¶ ENABLE_WHEEL_ZOOM ç‚º false æ™‚ä¸ç¶å®šï¼Œè®“é é¢è‡ªç„¶æµæš¢æ»¾å‹•)
  useEffect(() => {
    if (!ENABLE_WHEEL_ZOOM) return;
    const inlineEl = viewportRef.current;
    if (inlineEl) {
      inlineEl.addEventListener('wheel', handleWheelZoom, { passive: false });
    }
    return () => {
      if (inlineEl) {
        inlineEl.removeEventListener('wheel', handleWheelZoom);
      }
    };
  }, [handleWheelZoom]);

  useEffect(() => {
    if (!ENABLE_WHEEL_ZOOM || expandLevel !== 2) return;
    const modalEl = modalViewportRef.current;
    if (modalEl) {
      modalEl.addEventListener('wheel', handleWheelZoom, { passive: false });
    }
    return () => {
      if (modalEl) {
        modalEl.removeEventListener('wheel', handleWheelZoom);
      }
    };
  }, [expandLevel, handleWheelZoom]);

  // å…§è¯æ‹–æ‹½å¹³ç§»äº‹ä»¶ (é˜²æ­¢æ–‡å­—åç™½ highlight èˆ‡äºžåƒç´ æŠ–å‹•)
  const handleInlineMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault(); // ðŸ›‘ é˜»æ­¢ç€è¦½å™¨é è¨­æ–‡å­—é¸å–è¡Œçˆ² (å¾¹åº•é˜²æ­¢æ‹–æ‹½æ™‚æ–‡å­— highlight é–ƒçˆ)
    setIsInlineDragging(true);
    inlineDragStart.current = {
      x: e.clientX,
      y: e.clientY,
      initialPanX: inlinePan.x,
      initialPanY: inlinePan.y
    };
  };

  // ðŸ›¡ï¸ å…¨åŸŸè¦–çª—æ‹–æ‹½ç›£è½ï¼šæ»‘é¼ å¿«é€Ÿç”©å‡º Viewport ç”šè‡³ç§»å‡ºç€è¦½å™¨è¦–çª—å¤–æ”¾é–‹ï¼Œéƒ½èƒ½ 100% æ­£ç¢ºè§£é™¤å¹³ç§»ç‹€æ…‹
  useEffect(() => {
    if (!isInlineDragging) return;

    const handleWindowMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      const dx = e.clientX - inlineDragStart.current.x;
      const dy = e.clientY - inlineDragStart.current.y;
      setInlinePan({
        x: Math.round(inlineDragStart.current.initialPanX + dx),
        y: Math.round(inlineDragStart.current.initialPanY + dy)
      });
    };

    const handleWindowMouseUp = () => {
      setIsInlineDragging(false);
    };

    window.addEventListener('mousemove', handleWindowMouseMove, { passive: false });
    window.addEventListener('mouseup', handleWindowMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isInlineDragging]);

  const copyMermaidCode = async () => {
    try {
      const rawCode = `\`\`\`mermaid\n${code.trim()}\n\`\`\``;
      await navigator.clipboard.writeText(rawCode);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{
        ...dynamicWidthStyle,
        transition: isInlineDragging ? 'none' : 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
      className="mermaid-wrapper"
    >
      {/* ðŸŒŸ åœ–è¡¨é ‚éƒ¨æ“ä½œåˆ—ï¼šå·¦å´ç‚ºæ¨™é¡Œï¼Œæ‰€æœ‰åŠŸèƒ½æŒ‰éˆ•å…¨éƒ¨é æœ€å³æ‰‹é‚Šå°é½Š (100% SLS Parity) */}
      <div className="mermaid-topbar">
        <div className="mermaid-topbar-left">
          <Network className="w-4 h-4 text-sky-500" style={{ color: '#0ea5e9' }} />
          <span>Diagram ({(index + 1).toString().padStart(2, '0')})</span>
        </div>

        {/* ðŸŽ® æ‰€æœ‰æ“ä½œæŒ‰éˆ•ç¾¤çµ„ (æª¢è¦–èªžæ³•ã€è¤‡è£½ä»£ç¢¼ã€100% ç¸®æ”¾ã€è¡Œè·ã€4:3 å±•é–‹) ä¸€å¾‹é æœ€å³æ‰‹é‚Š */}
        <div className="mermaid-topbar-right">
            {/* Theme / Palette selector */}
            <div style={{ position: 'relative' }} ref={colorMenuRef}>
              <button
                type="button"
                onClick={() => setShowColorMenu(prev => !prev)}
                className={`mm-btn-action ${showColorMenu ? 'active' : ''}`}
                title="Change Mermaid Theme"
              >
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: THEME_PRESETS.find(p => p.id === selectedTheme)?.dotColor || '#38bdf8',
                    display: 'inline-block',
                    boxShadow: '0 0 4px rgba(0,0,0,0.2)'
                  }}
                />
                <span>{THEME_PRESETS.find(p => p.id === selectedTheme)?.label || 'Theme'}</span>
              </button>
              {showColorMenu && (
                <div
                  style={{
                    position: 'relative', margin: '0 auto',
                    top: '100%',
                    right: 0,
                    marginTop: 4,
                    zIndex: 50,
                    background: 'var(--bg-secondary, #ffffff)',
                    border: '1px solid var(--border-color, #e2e8f0)',
                    borderRadius: 8,
                    padding: 4,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    minWidth: 140
                  }}
                >
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(preset.id);
                        setShowColorMenu(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: 'none',
                        background: selectedTheme === preset.id ? 'var(--accent-glow, rgba(2,132,199,0.1))' : 'transparent',
                        color: selectedTheme === preset.id ? 'var(--accent, #0284c7)' : 'var(--text-main, #0f172a)',
                        cursor: 'pointer',
                        fontSize: 12,
                        fontWeight: selectedTheme === preset.id ? 700 : 500,
                        textAlign: 'left'
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: preset.dotColor,
                          display: 'inline-block'
                        }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Code / Hide Code */}
            <button
              onClick={() => setIsCodeVisible(v => !v)}
              className={`mm-btn-action ${isCodeVisible ? 'active' : ''}`}
              title={isCodeVisible ? 'Hide raw code' : 'Display raw code'}
            >
              {isCodeVisible ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hide Code</span>
                </>
              ) : (
                <>
                  <Code className="w-3.5 h-3.5" style={{ color: '#6366f1' }} />
                  <span>View Code</span>
                </>
              )}
            </button>

            {/* Copy Code */}
            <button
              onClick={copyMermaidCode}
              className="mm-btn-action"
              title="Copy raw diagram code"
            >
              {isCodeCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" style={{ color: '#10b981' }} />
                  <span style={{ color: '#10b981', fontWeight: 700 }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-sky-500" style={{ color: '#0ea5e9' }} />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            {/* Zoom Controls */}
            <div
              className="mm-btn-group"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  zoomOut();
                }}
                disabled={inlineScale <= MIN_ZOOM}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-btn"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  resetZoom();
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-text min-w-[38px] text-center"
                title="Reset view"
              >
                {Math.round(inlineScale * 100)}%
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  zoomIn();
                }}
                disabled={inlineScale >= MAX_ZOOM}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-btn"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  resetZoom();
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-btn"
                title="Reset view"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>

            {/* Line spacing controls (- / 1.2 / +) */}
            <div
              className="mm-btn-group"
              onMouseDown={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateLineHeight(Math.max(1.0, Number((lineHeight - 0.2).toFixed(1))));
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-btn"
                title="Decrease line spacing (-0.2)"
              >
                -
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateLineHeight(1.2);
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-text indigo"
                title="Click to reset line spacing to default (1.2)"
              >
                {lineHeight}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  updateLineHeight(Math.min(2.8, Number((lineHeight + 0.2).toFixed(1))));
                }}
                onDoubleClick={(e) => e.stopPropagation()}
                className="mm-group-btn"
                title="Increase line spacing (+0.2)"
              >
                +
              </button>
            </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              toggleReduceMargin();
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className={`mm-btn-fit ${isReduceMargin ? '' : 'inactive'}`}
            title={`${isReduceMargin ? 'Margin Fitted' : 'Fit Margin'}: Detect & reduce vertical margin space for current zoom (${Math.round(inlineScale * 100)}%)`}
          >
            <ChevronsDownUp className="w-3.5 h-3.5" style={{ color: '#475569' }} />
          </button>

          {/* ðŸ“ 4:3 å±•é–‹å¤–æ¡†åˆ‡æ›æŒ‰éˆ• (Icon-only) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleSetExpandLevel(expandLevel === 0 ? 1 : 0);
            }}
            onDoubleClick={(e) => e.stopPropagation()}
            className="mm-btn-icon"
            title={expandLevel === 1 ? 'Restore default frame' : 'Expand to 4:3 aspect ratio frame'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#475569' }}>
              {expandLevel === 1 ? (
                <>
                  <polyline points="4 14 10 14 10 20"/>
                  <polyline points="20 10 14 10 14 4"/>
                  <line x1="14" y1="10" x2="21" y2="3"/>
                  <line x1="3" y1="21" x2="10" y2="14"/>
                </>
              ) : (
                <>
                  <path d="M15 3h6v6"/>
                  <path d="M9 21H3v-6"/>
                  <path d="M21 3l-7 7"/>
                  <path d="M3 21l7-7"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* åŽŸå§‹ç¨‹å¼ç¢¼é è¦½æŠ½å±œ */}
      {isCodeVisible && (
        <div className="p-3.5 bg-slate-900 text-slate-200 border-b border-slate-800 text-xs font-mono relative overflow-hidden transition-all">
          <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
            <span className="font-bold flex items-center gap-1.5 text-sky-400">
              <Code className="w-3.5 h-3.5" />
              <span>Source Code</span>
            </span>
            <span className="text-[10px] text-slate-500">{code.split('\n').length} lines</span>
          </div>
          <pre className="overflow-x-auto p-2 bg-slate-950/60 rounded-lg text-sky-200/90 leading-relaxed font-mono select-text max-h-[260px]">
            <code>{code.trim()}</code>
          </pre>
        </div>
      )}

      {/* ç•«å¸ƒå€åŸŸ */}
      {renderError ? (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 rounded-xl m-3 font-mono text-xs overflow-x-auto border border-slate-200 dark:border-slate-800">
          <div className="text-amber-600 dark:text-amber-400 font-bold mb-2">âš ï¸ Diagram syntax note (displayed in code mode):</div>
          <pre className="!bg-transparent !p-0 !border-0"><code className="!text-slate-700 dark:!text-slate-300">{code}</code></pre>
        </div>
      ) : (
        <div
          ref={viewportRef}
          onMouseDown={handleInlineMouseDown}
          onDoubleClick={resetZoom}
          style={{
            minHeight: isReduceMargin
              ? 'auto'
              : expandLevel === 1
                ? '420px'
                : 'auto',
            height:
              isReduceMargin && tightHeight
                ? `${tightHeight}px`
                : 'auto',
            maxHeight:
              expandLevel === 1 && !isReduceMargin
                ? '750px'
                : 'none',
            padding:
              isReduceMargin
                ? '2px 12px'
                : '6px 12px',
            overflow: 'hidden',
            position: 'relative',
            transition:
              isInlineDragging
                ? 'none'
                : 'height 0.2s ease-out, min-height 0.2s ease-out',
          }}
          className={`mermaid-container relative flex items-center justify-center select-none ${
            isInlineDragging
              ? 'cursor-grabbing'
              : 'cursor-grab'
          }`}
        >
          {/* =====================================================
              ZOOM CANVAS
              The viewport stays fixed with overflow: hidden.
              The canvas freely expands: 50% = 0.5 ... 500% = 5.0
             ===================================================== */}
          <div
            style={{
              position: 'relative', margin: '0 auto',
              // left: 50%,
              // top: 50%,
              width: 'max-content',
              height: 'max-content',
              display: 'block',
              flexShrink: 0,
              transform: `
                
                translate3d(${inlinePan.x}px, ${inlinePan.y}px, 0)
                scale(${inlineScale})
              `,
              transformOrigin: 'center center',
              willChange: isInlineDragging ? 'transform' : 'auto',
              backfaceVisibility: 'hidden',
              WebkitFontSmoothing: 'antialiased',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              transition:
                isInlineDragging
                  ? 'none'
                  : 'transform 0.15s ease-out',
            }}
          >
            {/* =================================================
                INTRINSIC MERMAID SVG
               ================================================= */}
            <div
              ref={containerRef}
              style={{
                width: 'max-content',
                height: 'max-content',
                display: 'block',
                flexShrink: 0,
              }}
              className="pointer-events-none"
              dangerouslySetInnerHTML={{
                __html: svgContent,
              }}
            />
          </div>
        </div>
      )}

      {/* ðŸš€ ç¬¬ä¸‰ç´šï¼šæ”¾åˆ°æœ€å¤§ Pop-Up æµ®å±¤ (ç²¾æº– 80% è¦–çª—è¦–é‡Ž w-[80vw] h-[80vh]) */}
      {expandLevel === 2 && (
        <div className="fixed inset-0 z-[99999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-[85vw] h-[82vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-4">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-sky-500" />
                <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">Full Diagram View (80% Panorama)</span>
              </div>

              <div className="flex items-center gap-3">
                {/* å½ˆçª—å…§ç¸®æ”¾æŽ§åˆ¶çµ„ */}
                <div
                  className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                  onMouseDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      zoomOut();
                    }}
                    disabled={inlineScale <= MIN_ZOOM}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer disabled:opacity-40"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      resetZoom();
                    }}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className="px-1.5 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-sky-600 cursor-pointer min-w-[38px] text-center"
                    title="Reset Zoom (100%)"
                  >
                    {Math.round(inlineScale * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      zoomIn();
                    }}
                    disabled={inlineScale >= MAX_ZOOM}
                    onDoubleClick={(e) => e.stopPropagation()}
                    className="p-1 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition cursor-pointer disabled:opacity-40"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* é€€å›ž 4:3 æŒ‰éˆ• */}
                <button
                  onClick={() => handleSetExpandLevel(1)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
                  title="Return to 4:3 aspect ratio frame"
                >
                  4:3 Frame
                </button>

                {/* é—œé–‰å½ˆçª— */}
                <button
                  onClick={() => handleSetExpandLevel(0)}
                  className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                  title="Close and reset view"
                >
                  <X className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>

            {/* 80% ç•«å¸ƒå€ (Unconstrained Zoom Canvas) */}
            <div
              ref={modalViewportRef}
              onMouseDown={handleInlineMouseDown}
              onDoubleClick={resetZoom}
              className="flex-1 bg-slate-50/70 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-inner overflow-hidden relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing p-4"
            >
              <div
                style={{
                  position: 'relative', margin: '0 auto',
                  // left: 50%,
                  // top: 50%,
                  width: 'max-content',
                  height: 'max-content',
                  display: 'block',
                  flexShrink: 0,
                  transform: `
                    
                    translate3d(${inlinePan.x}px, ${inlinePan.y}px, 0)
                    scale(${inlineScale})
                  `,
                  transformOrigin: 'center center',
                  willChange: isInlineDragging ? 'transform' : 'auto',
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  transition:
                    isInlineDragging
                      ? 'none'
                      : 'transform 0.15s ease-out',
                }}
                className="pointer-events-none"
              >
                <div
                  style={{
                    width: 'max-content',
                    height: 'max-content',
                    display: 'block',
                    flexShrink: 0,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: svgContent,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

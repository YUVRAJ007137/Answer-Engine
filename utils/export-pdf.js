/**
 * Build a PDF from Q&A results and trigger download.
 * Uses jspdf (client-side). Renders Mermaid diagrams as images in the PDF.
 * Call from browser only.
 */

const MERMAID_ERROR_INDICATORS = [
  "Syntax error in text",
  "Diagram error",
  "error in text",
  "mermaid version",
];

function isMermaidErrorSvg(svgString) {
  if (!svgString || typeof svgString !== "string") return true;
  const lower = svgString.toLowerCase();
  return MERMAID_ERROR_INDICATORS.some((msg) => lower.includes(msg.toLowerCase()));
}

/**
 * Parse answer markdown into segments: { type: 'text'|'mermaid', content } (content is text or mermaid code).
 */
function parseAnswerSegments(answer) {
  if (!answer || typeof answer !== "string") return [{ type: "text", content: "" }];
  const segments = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = mermaidRegex.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      const text = answer.slice(lastIndex, match.index).trim();
      if (text) segments.push({ type: "text", content: text });
    }
    segments.push({ type: "mermaid", content: match[1].trim() });
    lastIndex = mermaidRegex.lastIndex;
  }
  if (lastIndex < answer.length) {
    const text = answer.slice(lastIndex).trim();
    if (text) segments.push({ type: "text", content: text });
  }
  if (segments.length === 0 && answer.trim()) {
    segments.push({ type: "text", content: answer });
  }
  return segments;
}

/**
 * Render Mermaid code to SVG (browser only). Returns SVG string or null if error.
 */
async function renderMermaidToSvg(code) {
  const mermaid = (await import("mermaid")).default;
  mermaid.initialize({
    startOnLoad: false,
    theme: "neutral",
    securityLevel: "loose",
  });
  const uid = `mermaid-pdf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const { svg } = await mermaid.render(uid, code);
  if (isMermaidErrorSvg(svg)) return null;
  return svg;
}

/**
 * Convert SVG string to PNG data URL via canvas (browser only).
 * Renders at scale 2x for sharp PDF output. Returns { dataUrl, widthPx, heightPx }.
 */
function svgToPngDataUrl(svgString, maxWidthPx = 500, scale = 2) {
  const scaledMax = maxWidthPx * scale;
  return new Promise((resolve, reject) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > scaledMax) {
        height = (height * scaledMax) / width;
        width = scaledMax;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      try {
        const dataUrl = canvas.toDataURL("image/png", 1.0);
        resolve({ dataUrl, widthPx: width, heightPx: height });
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG"));
    };
    img.src = url;
  });
}

/**
 * Strip markdown to plain text for PDF (basic).
 */
function markdownToPlainText(text) {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/^#+\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}

export async function downloadAnswersAsPdf(results, filename = "assignment-answers.pdf") {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 6;
  let y = margin;

  const checkPageBreak = (requiredSpace) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text, options = {}) => {
    const { fontSize = 11, fontStyle = "normal" } = options;
    const plain = markdownToPlainText(text);
    if (!plain) return;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(plain, maxWidth);
    for (const line of lines) {
      checkPageBreak(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += lineHeight * 0.5;
  };

  const addImage = (dataUrl, segmentWidthMm, segmentHeightMm) => {
    checkPageBreak(segmentHeightMm + 4);
    doc.addImage(dataUrl, "PNG", margin, y, segmentWidthMm, segmentHeightMm);
    y += segmentHeightMm + 4;
  };

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    addText(`Question ${i + 1}`, { fontSize: 12, fontStyle: "bold" });
    addText(r.question || "");
    if (r.answer) {
      addText("Answer:", { fontStyle: "bold" });
      const segments = parseAnswerSegments(r.answer);
      for (const seg of segments) {
        if (seg.type === "text") {
          addText(seg.content);
        } else if (seg.type === "mermaid") {
          try {
            const svg = await renderMermaidToSvg(seg.content);
            if (svg) {
              const result = await svgToPngDataUrl(svg, 550, 3);
              const { dataUrl, widthPx, heightPx } = result;
              const maxImgWidthMm = 170;
              const w = widthPx || 400;
              const h = heightPx || 300;
              const imgW = maxImgWidthMm;
              const imgH = maxImgWidthMm * (h / w);
              addImage(dataUrl, imgW, imgH);
            } else {
              addText("[Diagram could not be rendered]\n" + seg.content);
            }
          } catch (err) {
            addText("[Diagram error]\n" + seg.content);
          }
        }
      }
    } else if (r.error) {
      addText(`Error: ${r.error}`, { fontSize: 10 });
    }
    y += lineHeight * 2;
  }

  doc.save(filename);
}

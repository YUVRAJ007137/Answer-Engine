/**
 * Build a PDF from Q&A results and trigger download.
 * Uses jspdf (client-side). Call from browser only.
 */
export async function downloadAnswersAsPdf(results, filename = "assignment-answers.pdf") {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 6;

  const addText = (text, options = {}) => {
    const { fontSize = 11, fontStyle = "normal" } = options;
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    }
    y += lineHeight * 0.5;
  };

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    addText(`Question ${i + 1}`, { fontSize: 12, fontStyle: "bold" });
    addText(r.question || "");
    if (r.answer) {
      addText("Answer:", { fontStyle: "bold" });
      addText(r.answer);
    } else if (r.error) {
      addText(`Error: ${r.error}`, { fontSize: 10 });
    }
    y += lineHeight * 2;
  }

  doc.save(filename);
}

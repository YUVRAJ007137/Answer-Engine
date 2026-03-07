import pdfParse from "pdf-parse";

export async function extractTextFromPDF(buffer) {
  const data = await pdfParse(buffer);
  const text = data.text?.trim();
  if (!text) {
    throw new Error("Could not extract any text from the PDF.");
  }
  return text;
}

export function getFileType(filename) {
  const ext = String(filename).toLowerCase().split(".").pop();
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "webp", "bmp", "tiff"].includes(ext)) return "image";
  return "unknown";
}

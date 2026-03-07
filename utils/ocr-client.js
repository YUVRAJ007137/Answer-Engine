/**
 * Run OCR in the browser using tesseract.js.
 * Used for image uploads to avoid Next.js worker-script errors on the server.
 */
export async function extractTextFromImageInBrowser(file) {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    if (!text?.trim()) {
      throw new Error("Could not extract any text from the image.");
    }
    return text.trim();
  } finally {
    await worker.terminate();
  }
}

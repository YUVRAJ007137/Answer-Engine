import { extractTextFromPDF, getFileType } from "@/lib/extract-text";
import { detectQuestions } from "@/lib/detect-questions";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let questions = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const textInput = formData.get("text");

      if (file && file.size > 0) {
        const fileType = getFileType(file.name);
        if (fileType !== "pdf") {
          return Response.json(
            {
              error:
                "Server only accepts PDF for extraction. For images, use text input or paste extracted text.",
            },
            { status: 400 }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const extractedText = await extractTextFromPDF(buffer);
        questions = detectQuestions(extractedText);
      } else if (textInput && textInput.trim()) {
        questions = detectQuestions(String(textInput).trim());
      } else {
        return Response.json(
          { error: "No file or text provided." },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      if (body.questions && Array.isArray(body.questions)) {
        questions = body.questions
          .map((q) => (typeof q === "string" ? q.trim() : String(q || "").trim()))
          .filter(Boolean);
      } else if (body.text) {
        questions = detectQuestions(body.text);
      } else {
        return Response.json(
          { error: "No questions or text provided." },
          { status: 400 }
        );
      }
    }

    if (questions.length === 0) {
      return Response.json(
        { error: "No questions could be detected from the input." },
        { status: 400 }
      );
    }

    return Response.json({ questions });
  } catch (err) {
    console.error("Extract questions error:", err);
    return Response.json(
      { error: err.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

import { generateAnswer, getDelayBetweenQuestions } from "@/lib/ai";
import { extractTextFromPDF, getFileType } from "@/lib/extract-text";
import { detectQuestions } from "@/lib/detect-questions";

export const runtime = "nodejs";
export const maxDuration = 120;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function streamLine(controller, text) {
  controller.enqueue(new TextEncoder().encode(text + "\n"));
}

export async function POST(request) {
  const contentType = request.headers.get("content-type") || "";
  let questions = [];
  let answerLength = "standard";
  let answerStyle = "simple";
  let previousQA = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const textInput = formData.get("text");

      if (file && file.size > 0) {
        const fileType = getFileType(file.name);
        if (fileType !== "pdf") {
          return new Response(
            JSON.stringify({
              error:
                "Server only accepts PDF files. For images, paste the extracted text or use the text input.",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        const extractedText = await extractTextFromPDF(buffer);
        questions = detectQuestions(extractedText);
      } else if (textInput && textInput.trim()) {
        questions = detectQuestions(String(textInput).trim());
      } else {
        return new Response(
          JSON.stringify({ error: "No file or text provided." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    } else {
      const body = await request.json();
      if (body.questions && Array.isArray(body.questions)) {
        questions = body.questions;
      } else if (body.text) {
        questions = detectQuestions(body.text);
      } else {
        return new Response(
          JSON.stringify({ error: "No questions or text provided." }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
      answerLength = ["short", "standard", "detailed"].includes(body.length)
        ? body.length
        : "standard";
      answerStyle = ["simple", "technical"].includes(body.style) ? body.style : "simple";
      if (Array.isArray(body.previousQA)) {
        previousQA = body.previousQA
          .filter((qa) => qa && qa.question != null)
          .map((qa) => ({
            question: String(qa.question),
            answer: qa.answer != null ? String(qa.answer) : "",
          }));
      }
    }

    // Normalize: trim and drop empty so we never send blank questions to the AI
    questions = questions
      .map((q) => (typeof q === "string" ? q.trim() : String(q || "").trim()))
      .filter(Boolean);

    if (questions.length === 0) {
      return new Response(
        JSON.stringify({ error: "No questions could be detected from the input." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const delayMs = getDelayBetweenQuestions();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          streamLine(
            controller,
            JSON.stringify({ type: "start", total: questions.length })
          );

          const contextQA = previousQA.slice();

          for (let i = 0; i < questions.length; i++) {
            if (i > 0) await sleep(delayMs);

            const question = questions[i];
            streamLine(
              controller,
              JSON.stringify({ type: "question", index: i, question })
            );

            try {
              const context = contextQA.length > 0 ? { previousQA: contextQA } : {};
              const answer = await generateAnswer(question, {
                length: answerLength,
                style: answerStyle,
              }, context);
              streamLine(
                controller,
                JSON.stringify({ type: "answer", index: i, question, answer })
              );
              contextQA.push({ question, answer });
            } catch (err) {
              streamLine(
                controller,
                JSON.stringify({
                  type: "error",
                  index: i,
                  question,
                  error: err.message || "Failed to generate answer",
                })
              );
            }
          }

          streamLine(controller, JSON.stringify({ type: "done" }));
        } catch (err) {
          streamLine(
            controller,
            JSON.stringify({
              type: "error",
              error: err.message || "An unexpected error occurred.",
            })
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("Generate API error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "An unexpected error occurred." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

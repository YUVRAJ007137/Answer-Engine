"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import TextInput from "@/components/TextInput";
import AnswerCard from "@/components/AnswerCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import QuestionReview from "@/components/QuestionReview";
import { extractTextFromImageInBrowser } from "@/utils/ocr-client";
import { downloadAnswersAsPdf } from "@/utils/export-pdf";
import { getChat, saveChat, createChatId } from "@/lib/chat-storage";

function isImageFile(file) {
  return file?.type?.startsWith("image/");
}
function isPdfFile(file) {
  return file?.type === "application/pdf";
}

async function readStream(response, onEvent) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const event = JSON.parse(trimmed);
        onEvent(event);
      } catch {
        // skip
      }
    }
  }
  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer.trim()));
    } catch {
      // skip
    }
  }
}

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ?? "new";

  const [textInput, setTextInput] = useState("");
  const [file, setFile] = useState(null);
  const [streamResults, setStreamResults] = useState(null);
  const [streamTotal, setStreamTotal] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState(null);
  const [inputMode, setInputMode] = useState("text");
  const totalRef = useRef(0);
  const [reviewQuestions, setReviewQuestions] = useState(null);
  const [regeneratingIndex, setRegeneratingIndex] = useState(-1);
  const [answerOptions, setAnswerOptions] = useState({ length: "standard", style: "simple" });
  const [loaded, setLoaded] = useState(false);
  const pendingNewIdRef = useRef(null);
  const resultsRef = useRef(null);
  const prevIdRef = useRef(id);

  useEffect(() => {
    if (id === "new" || !id) {
      setStreamResults(null);
      setStreamTotal(0);
      setReviewQuestions(null);
      if (prevIdRef.current !== "new") {
        setTextInput("");
        setFile(null);
      }
      prevIdRef.current = "new";
      setLoaded(true);
      return;
    }
    prevIdRef.current = id;
    const chat = getChat(id);
    if (chat) {
      setStreamResults(chat.streamResults || null);
      setStreamTotal(chat.streamResults?.length ?? 0);
      setAnswerOptions(chat.answerOptions || { length: "standard", style: "simple" });
      setReviewQuestions(null);
    } else {
      setStreamResults(null);
      setStreamTotal(0);
    }
    setLoaded(true);
  }, [id]);

  const handleGenerate = useCallback(async () => {
    setError(null);
    setStreamResults(null);
    setStreamTotal(0);
    setCurrentIndex(-1);
    setLoading(true);
    setLoadingMessage("");

    try {
      let response;

      if (inputMode === "file" && file) {
        if (isImageFile(file)) {
          setLoadingMessage("Extracting text from image…");
          const textForExtract = await extractTextFromImageInBrowser(file);
          setLoadingMessage("Connecting…");
          response = await fetch("/api/extract-questions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: textForExtract }),
          });
        } else if (isPdfFile(file)) {
          setLoadingMessage("Connecting…");
          const formData = new FormData();
          formData.append("file", file);
          response = await fetch("/api/extract-questions", { method: "POST", body: formData });
        } else {
          setError("Unsupported file type. Use PDF or an image (PNG, JPEG, WebP).");
          setLoading(false);
          return;
        }
      } else if (inputMode === "text" && textInput.trim()) {
        setLoadingMessage("Connecting…");
        response = await fetch("/api/extract-questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textInput.trim() }),
        });
      } else {
        setError("Please provide questions via text or file upload.");
        setLoading(false);
        return;
      }

      const extractData = await response.json();
      if (!response.ok) {
        setError(extractData.error || "Failed to detect questions.");
        setLoading(false);
        return;
      }

      const questions = extractData.questions || [];
      if (questions.length === 0) {
        setError("No questions detected.");
        setLoading(false);
        return;
      }

      setReviewQuestions(questions);
      setLoading(false);
      setLoadingMessage("");
    } catch (err) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
      setLoadingMessage("");
    }
  }, [inputMode, file, textInput]);

  const handleGenerateWithQuestions = useCallback(
    async (questionsToUse, options = {}) => {
      const length = options.length || "standard";
      const style = options.style || "simple";
      setAnswerOptions({ length, style });
      setError(null);
      setReviewQuestions(null);
      setStreamResults(null);
      setStreamTotal(0);
      setCurrentIndex(-1);
      setLoading(true);
      setLoadingMessage("");
      resultsRef.current = null;
      pendingNewIdRef.current = id === "new" ? createChatId() : null;

      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questions: questionsToUse, length, style }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || response.statusText || "Something went wrong.");
          setLoading(false);
          return;
        }

        setLoadingMessage("Starting…");

        await readStream(response, (event) => {
          switch (event.type) {
            case "start":
              totalRef.current = event.total;
              setStreamTotal(event.total);
              const initial = Array.from({ length: event.total }, () => ({
                question: "",
                answer: null,
                error: null,
              }));
              resultsRef.current = initial;
              setStreamResults(initial);
              setCurrentIndex(0);
              break;
            case "question":
              setStreamResults((prev) => {
                if (!prev) return prev;
                const next = [...prev];
                next[event.index] = { ...next[event.index], question: event.question };
                resultsRef.current = next;
                return next;
              });
              setCurrentIndex(event.index);
              setLoadingMessage(`Answering question ${event.index + 1} of ${totalRef.current}…`);
              break;
            case "answer":
              setStreamResults((prev) => {
                if (!prev) return prev;
                const next = [...prev];
                next[event.index] = {
                  question: event.question,
                  answer: event.answer,
                  error: null,
                };
                resultsRef.current = next;
                return next;
              });
              if (event.index + 2 <= totalRef.current) {
                setLoadingMessage(`Answering question ${event.index + 2} of ${totalRef.current}…`);
              }
              break;
            case "error":
              if (event.index !== undefined) {
                setStreamResults((prev) => {
                  if (!prev) return prev;
                  const next = [...prev];
                  next[event.index] = {
                    question: event.question,
                    answer: null,
                    error: event.error,
                  };
                  resultsRef.current = next;
                  return next;
                });
              } else {
                setError(event.error || "An error occurred.");
              }
              break;
            case "done":
              setLoading(false);
              setLoadingMessage("");
              setCurrentIndex(-1);
              break;
            default:
              break;
          }
        });
      } catch (err) {
        setError(err.message || "Network error. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMessage("");
        setCurrentIndex(-1);
        const newId = pendingNewIdRef.current;
        const results = resultsRef.current;
        if (newId && results && results.length > 0) {
          const firstQuestion = results[0]?.question;
          const title = firstQuestion
            ? firstQuestion.slice(0, 50) + (firstQuestion.length > 50 ? "…" : "")
            : "Assignment";
          saveChat({
            id: newId,
            title,
            questions: results.map((r) => r.question),
            streamResults: results,
            answerOptions: { length, style },
          });
          router.replace(`/chat/${newId}`);
        }
        pendingNewIdRef.current = null;
      }
    },
    [id, router]
  );

  useEffect(() => {
    if (!loaded || loading || id === "new") return;
    const results = streamResults;
    if (!results || results.length === 0) return;
    const firstQuestion = results[0]?.question;
    const title = firstQuestion
      ? firstQuestion.slice(0, 50) + (firstQuestion.length > 50 ? "…" : "")
      : "Assignment";
    saveChat({
      id,
      title,
      questions: results.map((r) => r.question),
      streamResults: results,
      answerOptions,
    });
  }, [loaded, id, streamResults, answerOptions, loading]);

  const handleRegenerateOne = useCallback(
    async (index) => {
      if (!streamResults || index < 0 || index >= streamResults.length) return;
      const question = streamResults[index].question;
      if (!question) return;
      setRegeneratingIndex(index);
      setError(null);
      try {
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questions: [question],
            length: answerOptions.length,
            style: answerOptions.style,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          setError(data.error || "Regenerate failed.");
          setRegeneratingIndex(-1);
          return;
        }
        await readStream(response, (event) => {
          if (event.type === "answer" && event.index === 0) {
            setStreamResults((prev) => {
              if (!prev) return prev;
              const next = [...prev];
              next[index] = {
                question: event.question,
                answer: event.answer,
                error: null,
              };
              return next;
            });
          }
          if (event.type === "error" && event.index === 0) {
            setStreamResults((prev) => {
              if (!prev) return prev;
              const next = [...prev];
              next[index] = {
                question: event.question,
                answer: null,
                error: event.error,
              };
              return next;
            });
          }
        });
      } catch (err) {
        setError(err.message || "Regenerate failed.");
      } finally {
        setRegeneratingIndex(-1);
      }
    },
    [streamResults, answerOptions]
  );

  const handlePrint = useCallback(() => {
    const printContent = document.getElementById("print-answers-content");
    if (!printContent) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head><title>Assignment Answers</title>
        <style>
          body { font-family: system-ui,sans-serif; max-width: 700px; margin: 24px auto; padding: 0 16px; }
          h1 { font-size: 1.25rem; margin-top: 24px; }
          .q { margin-bottom: 16px; }
          .a { white-space: pre-wrap; margin-top: 8px; color: #333; }
        </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
      win.close();
    }, 300);
  }, []);

  const handleDownloadPdf = useCallback(async (resultsToExport) => {
    const data = resultsToExport ?? streamResults;
    if (!data || data.length === 0) return;
    try {
      await downloadAnswersAsPdf([...data]);
    } catch (err) {
      setError(err.message || "Failed to create PDF.");
    }
  }, [streamResults]);

  const hasStreamResults = streamResults && streamTotal > 0;
  const completedCount = streamResults
    ? streamResults.filter((r) => r.answer !== null || r.error !== null).length
    : 0;

  const canGenerate =
    !loading &&
    ((inputMode === "text" && textInput.trim().length > 0) || (inputMode === "file" && file !== null));

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--background)" }}>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Loading…</p>
      </div>
    );
  }

  return (
    <main className="py-6 sm:py-8 px-4 sm:px-6 min-h-full flex flex-col">
      <div className="max-w-3xl mx-auto w-full space-y-6 sm:space-y-8 flex-1">
        <header className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
            Answer Engine
          </h1>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Upload assignment questions and get detailed, handwriting-ready answers
          </p>
        </header>

        {hasStreamResults && (
          <div
            className="rounded-xl border px-3 sm:px-4 py-3 text-sm"
            style={{
              background: "var(--primary-light)",
              borderColor: "var(--card-border)",
              color: "var(--foreground)",
            }}
          >
            You have answers below. To run a new set of questions without replacing these, use{" "}
            <strong>+ New chat</strong> in the sidebar. Or enter new input above and click Detect
            questions to replace the answers below.
          </div>
        )}

        <section
          className="rounded-2xl border p-4 sm:p-6 space-y-5 sm:space-y-6"
          style={{ background: "var(--card)", borderColor: "var(--card-border)" }}
        >
          <div className="flex gap-1 p-1 rounded-lg w-fit" style={{ background: "var(--background)" }}>
            {[
              { key: "text", label: "Text Input" },
              { key: "file", label: "File Upload" },
            ].map((mode) => (
              <button
                key={mode.key}
                onClick={() => setInputMode(mode.key)}
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  inputMode === mode.key ? "shadow-sm" : ""
                }`}
                style={{
                  background: inputMode === mode.key ? "var(--card)" : "transparent",
                  color: inputMode === mode.key ? "var(--primary)" : "var(--muted)",
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {inputMode === "text" ? (
            <TextInput value={textInput} onChange={setTextInput} disabled={loading} />
          ) : (
            <FileUpload onFileSelect={setFile} disabled={loading} />
          )}

          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canGenerate ? "var(--primary)" : "var(--muted)",
            }}
            onMouseEnter={(e) => {
              if (canGenerate) e.target.style.background = "var(--primary-hover)";
            }}
            onMouseLeave={(e) => {
              if (canGenerate) e.target.style.background = "var(--primary)";
            }}
          >
            {loading ? "Detecting…" : "Detect questions"}
          </button>
        </section>

        {reviewQuestions && (
          <QuestionReview
            questions={reviewQuestions}
            onGenerate={handleGenerateWithQuestions}
            onBack={() => setReviewQuestions(null)}
            loading={loading}
          />
        )}

        {error && (
          <div
            className="rounded-xl border px-5 py-4 text-sm"
            style={{
              background: "#fef2f2",
              borderColor: "var(--error)",
              color: "var(--error)",
            }}
          >
            {error}
          </div>
        )}

        {loading && !hasStreamResults && !reviewQuestions && (
          <LoadingSpinner message={loadingMessage || "Detecting questions…"} />
        )}

        {hasStreamResults && (
          <section className="space-y-5">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
                Generated Answers
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleDownloadPdf(streamResults)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "var(--primary)", color: "var(--primary)" }}
                >
                  Download PDF
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: "var(--card-border)", color: "var(--foreground)" }}
                >
                  Print
                </button>
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                  style={{ background: "var(--primary-light)", color: "var(--primary)" }}
                >
                  <span className="font-medium">
                    {completedCount} / {streamTotal}
                  </span>
                  <span>done</span>
                </div>
                {loading && (
                  <p className="text-xs font-medium animate-pulse" style={{ color: "var(--muted)" }}>
                    {loadingMessage || "Answering…"}
                  </p>
                )}
              </div>
            </div>

            {streamTotal > 0 && (
              <div
                className="h-2 rounded-full overflow-hidden shrink-0"
                style={{ background: "var(--card-border)" }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedCount / streamTotal) * 100}%`,
                    background: "var(--primary)",
                  }}
                />
              </div>
            )}

            <div className="space-y-4 min-h-0">
              {streamResults.map((r, i) => (
                <AnswerCard
                  key={i}
                  index={i}
                  question={r.question}
                  answer={r.answer}
                  error={r.error}
                  isPending={loading && currentIndex === i && !r.answer && !r.error}
                  onRegenerate={handleRegenerateOne}
                  onRetry={handleRegenerateOne}
                  isRegenerating={regeneratingIndex === i}
                />
              ))}
            </div>
          </section>
        )}

        {hasStreamResults && (
          <div id="print-answers-content" className="hidden print:block">
            {streamResults.map((r, i) => (
              <div key={i} className="q">
                <h1>Question {i + 1}</h1>
                <p>{r.question}</p>
                {r.answer && <div className="a">{r.answer}</div>}
                {r.error && <p style={{ color: "var(--error)" }}>Error: {r.error}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

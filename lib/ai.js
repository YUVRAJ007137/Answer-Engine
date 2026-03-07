/**
 * Groq AI provider — free tier: 30 RPM, 14,400 requests/day.
 * Get API key: https://console.groq.com
 */

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_MODEL = "llama-3.3-70b-versatile";

const LENGTH_SPEC = {
  short: "Keep the answer concise: about 150 words.",
  standard: "Write 250–300 words.",
  detailed: "Write a detailed answer: about 400–500 words.",
};

const STYLE_SPEC = {
  simple:
    "Use simple, clear language suitable for a college student. Avoid jargon; explain terms if needed.",
  technical:
    "Use precise, slightly more technical language appropriate for a college assignment. You may use standard subject terminology.",
};
const BASE_PROMPT = `You are a knowledgeable college student writing an assignment answer for handwritten submission.

Write a clear, natural, and academically correct answer. The response should feel human-written, focused on the question, and suitable for a college notebook.

Guidelines:
- {length}
- {style}
- Use simple but precise academic language.
- Stay directly relevant to the question. Do not add unrelated information.
- Avoid generic filler phrases like "In today's world" or "It is important to note".
- Prefer clear explanations instead of overly complex wording.
- Write in complete paragraphs that are easy to understand when handwritten.

Structure the answer using these labeled sections (no # headings):

Definition:
Provide a clear and accurate definition of the key concept or term mentioned in the question.

Explanation:
Explain the concept logically and in detail. Focus on how or why it works. Use clear reasoning and examples where helpful.

Example:
Give one practical or real-world example that helps understand the concept.

Conclusion:
Summarize the main idea in 2–3 concise sentences.

Tables and Diagrams Rules:
- If the question explicitly asks for a diagram, flowchart, architecture, or process, include one using a Mermaid code block.
- If the question explicitly asks for comparison or differences, include a Markdown table.
- Only use tables when comparing 2 or more items.
- Do NOT add diagrams or tables unless the question requires them.

Mermaid diagrams must use simple valid syntax such as:
flowchart
sequenceDiagram
erDiagram
stateDiagram
pie

Keep diagrams simple and readable.

Question:
{question}
`;

const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY_MS = 2000;
const DELAY_BETWEEN_QUESTIONS_MS = 1500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getApiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key || key === "your_groq_api_key_here") {
    throw new Error(
      "GROQ_API_KEY is not configured. Get a free key at https://console.groq.com and add it to .env.local"
    );
  }
  return key;
}

function isRateLimitError(err) {
  const msg = err?.message || "";
  return msg.includes("429") || msg.includes("Too Many Requests") || msg.includes("rate");
}

function buildPrompt(question, lengthKey, styleKey) {
  const length = LENGTH_SPEC[lengthKey] || LENGTH_SPEC.standard;
  const style = STYLE_SPEC[styleKey] || STYLE_SPEC.simple;
  return BASE_PROMPT.replace("{length}", length)
    .replace("{style}", style)
    .replace("{question}", question.trim());
}

export async function generateAnswer(question, options = {}) {
  const { retryCount = 0, length = "standard", style = "simple" } = options;
  const apiKey = getApiKey();
  const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
  const prompt = buildPrompt(question, length, style);

  const body = {
    model,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful assistant that writes clear, structured college assignment answers.",
      },
      { role: "user", content: prompt },
    ],
    temperature: 0.7,
    max_tokens: length === "detailed" ? 1536 : 1024,
  };

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const errMsg = data?.error?.message || data?.message || res.statusText;
      const err = new Error(errMsg);
      if (res.status === 429) Object.assign(err, { rateLimit: true });
      throw err;
    }

    const text = data?.choices?.[0]?.message?.content;
    if (text == null) {
      throw new Error("No response content from Groq");
    }
    return text.trim();
  } catch (err) {
    if (isRateLimitError(err) && retryCount < MAX_RETRIES) {
      const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, retryCount);
      await sleep(delayMs);
      return generateAnswer(question, { ...options, retryCount: retryCount + 1 });
    }
    throw err;
  }
}

export function getDelayBetweenQuestions() {
  return DELAY_BETWEEN_QUESTIONS_MS;
}

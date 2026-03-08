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

Mermaid diagrams – use ONLY these valid patterns (copy structure exactly):

For flowcharts/processes use "flowchart" with node IDs and arrows:
\`\`\`mermaid
flowchart LR
    A[Start] --> B[Step]
    B --> C[End]
\`\`\`

For client-server or request-response use "sequenceDiagram" (NOT flowchart):
\`\`\`mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    C->>S: Request
    S->>C: Response
\`\`\`

For entity-relationship (DBMS) use "erDiagram" with entities and relationships only (no class blocks):
\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ ITEM : contains
\`\`\`

For class-like structure use "classDiagram" (not erDiagram):
\`\`\`mermaid
classDiagram
    class Level {
        string storage
        string retrieval
    }
\`\`\`

CRITICAL: Use the exact keyword after the opening fence: flowchart, sequenceDiagram, erDiagram, or classDiagram. Do not mix them (e.g. flowchart with participant/->> is wrong; use sequenceDiagram for that).

Question:
{question}
`;

const MAX_RETRIES = 4;
const INITIAL_RETRY_DELAY_MS = 2000;
const DELAY_BETWEEN_QUESTIONS_MS = 1500;

/** Canned answer for meta-questions about the product / creator */
const ABOUT_ANSWER_ENGINE = `Definition:
Answer Engine is an AI-powered web application made by Tech Desk. It is designed to help students generate well-structured, handwriting-ready answers for their assignments.

Explanation:
Tech Desk is a team of engineering students led by Yuvraj Chaudhari. The team keeps innovating and building tools that help students and learners. Answer Engine is one such product: users can upload or paste assignment questions (as text, PDF, or images). The tool detects individual questions, lets them review and edit the list, then generates detailed answers using AI. Answers can include definitions, explanations, examples, and optional diagrams or tables. Results can be exported as PDF or printed.

Example:
A student pastes three questions about DBMS. Answer Engine detects them, the student clicks "Generate answers," and receives three formatted answers suitable for handwritten submission.

Conclusion:
Answer Engine is built by Tech Desk—a team of engineering students led by Yuvraj Chaudhari, focused on innovation. For more information, visit the About page in the app.`;

const ABOUT_PRODUCT_PATTERNS = [
  /\babout\s+(this\s+)?(project|answer\s*engine|this\s+app|this\s+tool)\b/i,
  /\bwhat\s+is\s+answer\s*engine\b/i,
  /\b(explain|describe)\s+answer\s*engine\b/i,
  /\babout\s+tech\s+desk\b/i,
  /\b(what|who)\s+is\s+tech\s+desk\b/i,
  /\b(explain|describe|tell\s+me\s+about)\s+tech\s+desk\b/i,
];

const PRODUCT_CONTEXT = /\b(answer\s*engine|this\s+app|this\s+application|this\s+project|this\s+tool|tech\s+desk)\b/i;
const WHO_PHRASE = /\bwho\s+(made|created|built|developed)\b/i;

function isMetaQuestionAboutProduct(question) {
  const q = question.trim();
  if (q.length < 10) return false;
  if (ABOUT_PRODUCT_PATTERNS.some((re) => re.test(q))) return true;
  if (WHO_PHRASE.test(q) && PRODUCT_CONTEXT.test(q)) return true;
  return false;
}

function getCannedAnswer() {
  return ABOUT_ANSWER_ENGINE;
}

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
  const q = question?.trim() || "";
  if (isMetaQuestionAboutProduct(q)) {
    return getCannedAnswer();
  }
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

# Answer Engine

AI-powered assignment solver. Upload questions (text, PDF, or image), review and edit them, then get detailed, handwriting-ready answers. Powered by **Groq** (free tier).

## How it works

1. **New chat** — Open the app (you’re on **New chat**). Use **+ New chat** in the sidebar anytime to start a fresh assignment.
2. **Detect questions** — Paste text, or upload a PDF or image. Click **Detect questions** to extract individual questions.
3. **Review & edit** — Review the detected list: edit, add, or remove questions. Choose **answer length** (Short / Standard / Detailed) and **language style** (Simpler / More technical). Click **Generate answers**.
4. **Streaming results** — Answers stream in one by one with a progress indicator. Use **Regenerate** on any card to re-run that question, or **Retry** if it failed.
5. **Chat history** — Each run is saved as a chat in the sidebar. Click a chat to reopen it; use the ⋮ menu to delete.
6. **Export** — **Download PDF** to save all Q&A, or **Print** to open a print-friendly view (e.g. save as PDF from the browser).

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Get a free API key from [Groq Console](https://console.groq.com) and add it to `.env.local`:
   ```
   GROQ_API_KEY=your_key_here
   ```
   Optional: `GROQ_MODEL=llama-3.1-8b-instant` (default is `llama-3.3-70b-versatile`).

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Features

- **New chat / Chat history:** Each assignment run is a “chat” with its own URL (`/chat/[id]`). The sidebar lists past chats (stored in `localStorage`); **+ New chat** starts a new one, and you can open or delete past chats from the list.
- **Input:** Text, PDF, or image (image OCR runs in the browser).
- **Edit before generating:** Detect questions, then review and edit the list.
- **Answer options:** Length (Short ~150 words / Standard 250–300 / Detailed 400–500) and style (Simpler language / More technical).
- **Tables, diagrams, charts:** Answers can include Markdown tables and Mermaid diagrams (flowcharts, ER diagrams, pie/xy charts) when they help explain the topic; the app renders them in the browser.
- **Streaming:** Answers appear as they’re generated, with progress (e.g. “Answering question 2 of 5”).
- **Regenerate / Retry:** Regenerate a single answer or retry a failed one without re-running all questions.
- **Export:** Download all answers as a PDF, or print (including “Save as PDF”).
- **Theme:** Light / Dark / System toggle (stored in `localStorage`).

## Deployment (Vercel)

1. Push to GitHub.
2. Import the repo at [vercel.com](https://vercel.com).
3. Add `GROQ_API_KEY` as an environment variable.
4. Deploy.

## Tech stack

- Next.js 15 (App Router)
- Tailwind CSS 4
- Groq API (Llama 3.3 — free tier: 30 RPM, 14,400 requests/day)
- pdf-parse (PDF text extraction)
- tesseract.js (client-side OCR for images)
- jspdf (client-side PDF export)
- react-markdown + remark-gfm (Markdown and table rendering)
- mermaid (diagram and chart rendering)

/**
 * Split raw text into individual questions.
 *
 * Handles patterns like:
 *   1. Question text          (numbered with dot)
 *   1) Question text          (numbered with paren)
 *   Q1. Question text         (Q-prefix)
 *   Q1) Question text
 *   Q.1 Question text
 *   - Question text           (bullet)
 *   • Question text
 *   Lines separated by blank lines
 */
export function detectQuestions(rawText) {
  if (!rawText || !rawText.trim()) return [];

  const text = rawText.trim();

  const numberedPattern =
    /(?:^|\n)\s*(?:Q\.?\s*)?(\d+)\s*[.):\-]\s*([\s\S]*?)(?=(?:\n\s*(?:Q\.?\s*)?\d+\s*[.):\-])|$)/gi;
  const matches = [...text.matchAll(numberedPattern)];

  if (matches.length >= 2) {
    return matches
      .map((m) => m[2].trim().replace(/\n+/g, " "))
      .filter((q) => q.length > 3);
  }

  const bulletPattern = /(?:^|\n)\s*[•\-\*]\s+([\s\S]*?)(?=(?:\n\s*[•\-\*]\s+)|$)/g;
  const bulletMatches = [...text.matchAll(bulletPattern)];

  if (bulletMatches.length >= 2) {
    return bulletMatches
      .map((m) => m[1].trim().replace(/\n+/g, " "))
      .filter((q) => q.length > 3);
  }

  const lines = text
    .split(/\n{2,}/)
    .map((l) => l.trim().replace(/\n+/g, " "))
    .filter((l) => l.length > 3);

  if (lines.length >= 2) {
    return lines;
  }

  const singleLines = text
    .split(/\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  if (singleLines.length >= 2) {
    return singleLines;
  }

  return [text.replace(/\n+/g, " ").trim()];
}

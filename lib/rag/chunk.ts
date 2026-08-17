// Splits text into overlapping chunks for embedding. Overlap keeps context
// from being severed at chunk boundaries, which improves retrieval quality
// for sentences/ideas that straddle a split point.
const DEFAULT_CHUNK_SIZE = 800;
const DEFAULT_CHUNK_OVERLAP = 150;

export function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkText(
  text: string,
  options: { chunkSize?: number; chunkOverlap?: number } = {}
): string[] {
  const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const chunkOverlap = options.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP;

  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    const end = Math.min(start + chunkSize, cleaned.length);
    let sliceEnd = end;

    // Prefer breaking on a sentence/paragraph boundary near the end of the
    // window so chunks read naturally instead of cutting mid-word.
    if (end < cleaned.length) {
      const boundary = cleaned.lastIndexOf(". ", end);
      if (boundary > start + chunkSize * 0.5) {
        sliceEnd = boundary + 1;
      }
    }

    const chunk = cleaned.slice(start, sliceEnd).trim();
    if (chunk) chunks.push(chunk);

    if (sliceEnd >= cleaned.length) break;
    start = sliceEnd - chunkOverlap;
    if (start < 0) start = 0;
  }

  return chunks;
}

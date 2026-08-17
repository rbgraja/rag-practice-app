import "server-only";
import type { RetrievedChunk } from "@/types";

// There is no reliable free LLM to call here: Supabase's Deno Edge Runtime
// can't initialize the ONNX/WASM backend that community text-generation
// libraries (e.g. Transformers.js) depend on (confirmed via a deployed
// "generate" function that threw "Unsupported device: cpu. Should be one
// of: ." — the runtime never registered any execution provider). Supabase's
// own built-in model support only covers the gte-small embedding model, not
// generation. So instead of paraphrasing an answer, this returns the most
// relevant retrieved chunk directly — still real retrieval, grounding, and
// citations, just without LLM-authored prose.
export function generateAnswer(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "I couldn't find enough information in the uploaded documents.";
  }

  const [best, ...rest] = chunks;
  const extra =
    rest.length > 0
      ? `\n\n_${rest.length} more relevant section${rest.length > 1 ? "s" : ""} found — see Sources below._`
      : "";

  return `Based on **${best.documentTitle}**:\n\n> ${best.content}${extra}`;
}

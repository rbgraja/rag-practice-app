import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";
import type { RetrievedChunk } from "@/types";

const MATCH_THRESHOLD = 0.3;
const MATCH_COUNT = 5;

interface MatchRow {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  similarity: number;
}

export async function retrieveRelevantChunks(question: string): Promise<RetrievedChunk[]> {
  const queryEmbedding = await generateEmbedding(question);
  const supabase = createServiceClient();

  const { data, error } = await supabase.rpc("match_document_chunks", {
    query_embedding: queryEmbedding,
    match_threshold: MATCH_THRESHOLD,
    match_count: MATCH_COUNT,
  });

  if (error) {
    throw new Error(`Similarity search failed: ${error.message}`);
  }

  const rows = (data ?? []) as MatchRow[];
  if (rows.length === 0) return [];

  const documentIds = [...new Set(rows.map((row) => row.document_id))];
  const { data: documents, error: documentsError } = await supabase
    .from("documents")
    .select("id, title")
    .in("id", documentIds);

  if (documentsError) {
    throw new Error(`Failed to load source documents: ${documentsError.message}`);
  }

  const titleById = new Map((documents ?? []).map((doc) => [doc.id, doc.title as string]));

  return rows.map((row) => ({
    chunkId: row.id,
    documentId: row.document_id,
    documentTitle: titleById.get(row.document_id) ?? "Untitled document",
    chunkIndex: row.chunk_index,
    content: row.content,
    similarity: row.similarity,
  }));
}

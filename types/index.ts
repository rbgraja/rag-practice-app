export type SourceType = "pdf" | "text";

export interface DocumentRecord {
  id: string;
  title: string;
  file_name: string | null;
  file_path: string | null;
  source_type: SourceType;
  created_at: string;
  chunk_count?: number;
}

export interface DocumentChunkRecord {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface RetrievedChunk {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface ChatSource {
  documentId: string;
  documentTitle: string;
  chunkId: string;
  chunkIndex: number;
  content: string;
  similarity: number;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: ChatSource[];
  error?: boolean;
}

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";
import { generateEmbeddings } from "@/lib/ai/embeddings";
import { chunkText } from "@/lib/rag/chunk";
import type { DocumentRecord, SourceType } from "@/types";

export interface IngestDocumentInput {
  title: string;
  sourceType: SourceType;
  text: string;
  fileName?: string;
  filePath?: string;
}

export async function ingestDocument(input: IngestDocumentInput): Promise<DocumentRecord> {
  const chunks = chunkText(input.text);

  if (chunks.length === 0) {
    throw new Error("No content could be extracted to chunk and embed.");
  }

  const supabase = createServiceClient();

  const { data: document, error: documentError } = await supabase
    .from("documents")
    .insert({
      title: input.title,
      file_name: input.fileName ?? null,
      file_path: input.filePath ?? null,
      source_type: input.sourceType,
    })
    .select()
    .single();

  if (documentError) {
    throw new Error(`Failed to save document: ${documentError.message}`);
  }

  try {
    const embeddings = await generateEmbeddings(chunks);

    const rows = chunks.map((content, index) => ({
      document_id: document.id,
      content,
      embedding: embeddings[index],
      chunk_index: index,
    }));

    const { error: chunksError } = await supabase.from("document_chunks").insert(rows);

    if (chunksError) {
      throw new Error(`Failed to save chunks: ${chunksError.message}`);
    }
  } catch (error) {
    // Roll back the document so we don't leave an empty/broken entry behind.
    await supabase.from("documents").delete().eq("id", document.id);
    throw error;
  }

  return { ...(document as DocumentRecord), chunk_count: chunks.length };
}

import "server-only";
import { createServiceClient } from "@/lib/supabase/server";

// Embeddings are produced by the Supabase Edge Function "embed", which runs
// the built-in gte-small model (384 dimensions) directly in the Edge Runtime.
// No external API or key is involved.

export async function generateEmbedding(text: string): Promise<number[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.functions.invoke("embed", {
    body: { text },
  });

  if (error) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }

  return data.embedding as number[];
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase.functions.invoke("embed", {
    body: { texts },
  });

  if (error) {
    throw new Error(`Embedding generation failed: ${error.message}`);
  }

  return data.embeddings as number[][];
}

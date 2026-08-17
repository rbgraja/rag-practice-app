import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data: documents, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: chunkCounts, error: countsError } = await supabase
      .from("document_chunks")
      .select("document_id");

    if (countsError) throw countsError;

    const counts = new Map<string, number>();
    for (const row of chunkCounts ?? []) {
      counts.set(row.document_id, (counts.get(row.document_id) ?? 0) + 1);
    }

    const withCounts = (documents ?? []).map((doc) => ({
      ...doc,
      chunk_count: counts.get(doc.id) ?? 0,
    }));

    return NextResponse.json({ documents: withCounts });
  } catch (error) {
    console.error("GET /api/documents failed", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

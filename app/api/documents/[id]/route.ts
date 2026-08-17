import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const STORAGE_BUCKET = "documents";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const supabase = createServiceClient();

    const { data: document, error: fetchError } = await supabase
      .from("documents")
      .select("file_path")
      .eq("id", id)
      .single();

    if (fetchError) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // document_chunks rows cascade-delete via the FK constraint.
    const { error: deleteError } = await supabase.from("documents").delete().eq("id", id);
    if (deleteError) throw deleteError;

    if (document?.file_path) {
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([document.file_path]);
      if (storageError) {
        console.error("Failed to remove file from storage", storageError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`DELETE /api/documents/${id} failed`, error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}

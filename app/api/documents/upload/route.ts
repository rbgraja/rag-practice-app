import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { extractPdfText } from "@/lib/rag/pdf";
import { ingestDocument } from "@/lib/rag/ingest";

export const runtime = "nodejs";

const STORAGE_BUCKET = "documents";
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: Request) {
  let uploadedPath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const title = formData.get("title");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large (20MB limit)" },
        { status: 400 }
      );
    }

    const resolvedTitle =
      typeof title === "string" && title.trim() ? title.trim() : file.name.replace(/\.pdf$/i, "");

    const buffer = Buffer.from(await file.arrayBuffer());
    const supabase = createServiceClient();

    const filePath = `${crypto.randomUUID()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, { contentType: "application/pdf" });

    if (uploadError) {
      throw new Error(`Failed to upload PDF to storage: ${uploadError.message}`);
    }
    uploadedPath = filePath;

    let text: string;
    try {
      text = await extractPdfText(buffer);
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Failed to extract text from PDF"
      );
    }

    const document = await ingestDocument({
      title: resolvedTitle,
      sourceType: "pdf",
      text,
      fileName: file.name,
      filePath,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("POST /api/documents/upload failed", error);

    if (uploadedPath) {
      const supabase = createServiceClient();
      await supabase.storage.from(STORAGE_BUCKET).remove([uploadedPath]);
    }

    const message = error instanceof Error ? error.message : "Failed to process PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

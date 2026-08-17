import { NextResponse } from "next/server";
import { ingestDocument } from "@/lib/rag/ingest";

const MAX_TEXT_LENGTH = 200_000;
const MIN_TEXT_LENGTH = 20;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const content = typeof body.content === "string" ? body.content.trim() : "";

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (content.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        { error: "Content is too short to process" },
        { status: 400 }
      );
    }

    if (content.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Content exceeds the ${MAX_TEXT_LENGTH.toLocaleString()} character limit` },
        { status: 400 }
      );
    }

    const document = await ingestDocument({
      title,
      sourceType: "text",
      text: content,
    });

    return NextResponse.json({ document });
  } catch (error) {
    console.error("POST /api/documents/text failed", error);
    return NextResponse.json({ error: "Failed to process text" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { retrieveRelevantChunks } from "@/lib/rag/retrieve";
import { generateAnswer } from "@/lib/ai/chat";
import type { ChatResponse } from "@/types";

const MAX_QUESTION_LENGTH = 1000;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = typeof body.question === "string" ? body.question.trim() : "";

    if (!question) {
      return NextResponse.json({ error: "Question must not be empty" }, { status: 400 });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json({ error: "Question is too long" }, { status: 400 });
    }

    // Real retrieval: embed the question and run vector similarity search in
    // Supabase — only the matching chunks are used to build the answer,
    // never the full document.
    const chunks = await retrieveRelevantChunks(question);
    const answer = generateAnswer(chunks);

    const response: ChatResponse = {
      answer,
      sources: chunks.map((chunk) => ({
        documentId: chunk.documentId,
        documentTitle: chunk.documentTitle,
        chunkId: chunk.chunkId,
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        similarity: chunk.similarity,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("POST /api/chat failed", error);
    return NextResponse.json(
      { error: "Failed to generate an answer. Please try again." },
      { status: 500 }
    );
  }
}

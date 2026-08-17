# RAG Practice App

A learning project for understanding Retrieval-Augmented Generation end-to-end: PDF/text ingestion, chunking, embeddings, pgvector similarity search, and grounded answers with citations.

**Backend:** Supabase only — Postgres, pgvector, Storage, and Edge Functions. **AI:** fully free, no external API key — embeddings run inside a Supabase Edge Function using its built-in model, and answers are extractive rather than LLM-generated (see [AI models](#ai-models--why-no-openai-key) below for why).

## Architecture

```text
PDF / Text → Supabase Storage (PDF only) → Text extraction → Chunking
  → Edge Function "embed" (gte-small) → Postgres + pgvector

Question → Edge Function "embed" → match_document_chunks() RPC
  → top chunks → best chunk returned as the grounded answer + sources
```

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com) (or run one locally with the Supabase CLI).
2. **Enable pgvector**: it's enabled automatically by the migration below (`create extension if not exists vector;`), or you can turn it on manually under Database → Extensions → `vector`.
3. **Run the migration**: apply [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) via the SQL Editor, or with the CLI:
   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
   This creates the `documents` and `document_chunks` tables, the `match_document_chunks()` similarity-search RPC, and the `documents` Storage bucket (private — accessed only via the server's service role key).
4. **Deploy the Edge Function**:
   ```bash
   supabase functions deploy embed
   ```
   Or run it locally for development: `supabase start && supabase functions serve`.

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase project values (Project Settings → API):

```env
NEXT_PUBLIC_SUPABASE_URL=       # safe for the browser
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # safe for the browser
SUPABASE_SERVICE_ROLE_KEY=      # server-only — never expose to the client
```

No OpenAI (or any other) API key is required.

## 3. Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## AI models — why no OpenAI key

This project stays 100% inside Supabase's free tier, with no external LLM API:

- **Embeddings** ([`supabase/functions/embed`](supabase/functions/embed/index.ts)): uses Supabase Edge Functions' built-in `Supabase.ai.Session("gte-small")` model — 384-dimensional vectors, runs in-process, genuinely free.
- **Answer generation** ([`lib/ai/chat.ts`](lib/ai/chat.ts)): there is no Supabase-hosted LLM. An earlier version of this project tried running a small open text2text model (`Xenova/flan-t5-small`) via Transformers.js inside a second Edge Function, but Supabase's Deno Edge Runtime couldn't initialize the ONNX/WASM backend that library depends on (it threw `Unsupported device: cpu. Should be one of: .` — no execution provider ever registered). Supabase's native model support only covers the `gte-small` embedding model, not text generation. So instead of paraphrasing, the "answer" is the most relevant retrieved chunk, returned directly with light formatting.

**Trade-off to know going in:** answers are extractive, not generated — you get the actual retrieved passage verbatim, not a paraphrased/synthesized response. This still demonstrates the full RAG mechanics (chunking, embeddings, similarity search, grounding, citations) for $0 and zero external dependencies. If you want LLM-generated prose later, swap `generateAnswer` in `lib/ai/chat.ts` to call a real LLM API (OpenAI, etc.) with the retrieved chunks as context — everything else in the pipeline stays the same.

## Project structure

```text
app/
  page.tsx                     Main UI (sidebar + chat)
  api/
    documents/route.ts         GET   list documents
    documents/upload/route.ts  POST  upload + process a PDF
    documents/text/route.ts    POST  process pasted text
    documents/[id]/route.ts    DELETE a document (+ chunks + storage file)
    chat/route.ts              POST  ask a question (retrieval + generation)
components/
  chat/        Chat UI: bubbles, input, sources, suggested questions
  documents/   Knowledge base UI: upload modal, list, processing steps
  layout/      Header, sidebar, mobile drawer
  ui/          Shared primitives: Button, Modal, background orbs
lib/
  ai/          embeddings.ts (wraps the embed Edge Function), chat.ts (extractive answers)
  rag/         chunk.ts, pdf.ts, ingest.ts, retrieve.ts — the RAG pipeline
  supabase/    server.ts (service role), client.ts (anon, browser-safe)
supabase/
  migrations/  SQL schema + RPC + storage bucket
  functions/   embed/ — the embeddings Edge Function
types/         Shared TypeScript types
```

## Security notes

- All Supabase and Edge Function calls happen server-side (API routes); the service role key never reaches the browser.
- PDF uploads are validated by MIME type and capped at 20MB; pasted text is capped at 200,000 characters.
- The `documents` and `document_chunks` tables have Row Level Security enabled with no client-facing policies — all access goes through the server using the service role key, which bypasses RLS by design.
- When retrieval finds nothing above the similarity threshold, the app says so explicitly rather than inventing an answer.

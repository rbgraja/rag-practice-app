-- RAG practice app: initial schema
-- Embeddings are produced by the Supabase Edge Function "embed", which uses the
-- built-in gte-small model (384 dimensions). If you swap embedding models later,
-- the `vector(384)` columns/RPC below must be updated to match the new dimension.

create extension if not exists vector;
create extension if not exists pgcrypto;

-- ── documents ────────────────────────────────────────────────────────────────
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  file_name text,
  file_path text,
  source_type text not null check (source_type in ('pdf', 'text')),
  created_at timestamptz not null default now()
);

-- ── document_chunks ──────────────────────────────────────────────────────────
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  content text not null,
  embedding vector(384),
  chunk_index int not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_chunks_document_id_idx on document_chunks (document_id);

-- ivfflat needs at least a handful of rows to build well, but is safe to create empty.
create index if not exists document_chunks_embedding_idx
  on document_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- ── similarity search RPC ────────────────────────────────────────────────────
create or replace function match_document_chunks (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  document_id uuid,
  content text,
  chunk_index int,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.document_id,
    document_chunks.content,
    document_chunks.chunk_index,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;

-- ── storage bucket for uploaded PDFs ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Row Level Security stays enabled with no permissive policies: this app only
-- talks to Postgres/Storage from server-side API routes using the Supabase
-- service role key, which bypasses RLS entirely. No client-side table/bucket
-- access is expected, so no policies are defined here.
alter table documents enable row level security;
alter table document_chunks enable row level security;

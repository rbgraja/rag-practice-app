// Supabase Edge Function: embed
//
// Generates text embeddings using Supabase's built-in gte-small model.
// This model runs directly inside the Edge Runtime (no external API, no key,
// completely free) and produces 384-dimensional vectors.
//
// Request:  { text: string } | { texts: string[] }
// Response: { embedding: number[] } | { embeddings: number[][] }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// @ts-ignore -- `Supabase` is a global provided by the Edge Runtime, not a module.
const model = new Supabase.ai.Session("gte-small");

async function embed(text: string): Promise<number[]> {
  const output = await model.run(text, { mean_pool: true, normalize: true });
  return Array.from(output as Iterable<number>);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { text, texts } = body ?? {};

    if (typeof text === "string") {
      if (!text.trim()) {
        return new Response(JSON.stringify({ error: "text must not be empty" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const embedding = await embed(text);
      return new Response(JSON.stringify({ embedding }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (Array.isArray(texts)) {
      if (texts.length === 0 || texts.some((t) => typeof t !== "string" || !t.trim())) {
        return new Response(JSON.stringify({ error: "texts must be a non-empty array of strings" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const embeddings: number[][] = [];
      for (const t of texts) {
        embeddings.push(await embed(t));
      }
      return new Response(JSON.stringify({ embeddings }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Provide either `text` or `texts`" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("embed function error", error);
    return new Response(JSON.stringify({ error: "Failed to generate embedding" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

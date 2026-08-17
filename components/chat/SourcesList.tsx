"use client";

import { useState } from "react";
import { FileStack } from "lucide-react";
import { SourceDetailModal } from "@/components/chat/SourceDetailModal";
import type { ChatSource } from "@/types";

interface SourcesListProps {
  sources: ChatSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  const [activeSource, setActiveSource] = useState<ChatSource | null>(null);

  if (sources.length === 0) return null;

  const grouped = new Map<string, ChatSource[]>();
  for (const source of sources) {
    grouped.set(source.documentTitle, [...(grouped.get(source.documentTitle) ?? []), source]);
  }

  return (
    <div className="mt-3 border-t border-current/10 pt-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider opacity-50">
        <FileStack size={12} /> Sources
      </p>
      <div className="space-y-2">
        {[...grouped.entries()].map(([title, docSources]) => (
          <div key={title} className="text-xs">
            <p className="mb-1 font-medium opacity-80">📄 {title}</p>
            <div className="flex flex-wrap gap-1.5">
              {docSources.map((source) => (
                <button
                  key={source.chunkId}
                  onClick={() => setActiveSource(source)}
                  className="glass-inset rounded-lg px-2 py-1 transition-colors hover:bg-black/[.05] dark:hover:bg-white/[.08]"
                >
                  Chunk {source.chunkIndex + 1}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {activeSource && (
        <SourceDetailModal source={activeSource} onClose={() => setActiveSource(null)} />
      )}
    </div>
  );
}

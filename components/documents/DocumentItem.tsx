"use client";

import { useState } from "react";
import { FileText, NotebookText, Trash2, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import type { DocumentRecord } from "@/types";

interface DocumentItemProps {
  document: DocumentRecord;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentItem({ document, onDelete }: DocumentItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setIsDeleting(true);
    await onDelete(document.id);
  };

  const Icon = document.source_type === "pdf" ? FileText : NotebookText;

  return (
    <div className="group glass-inset flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-black/[.03] dark:hover:bg-white/[.05]">
      <Icon size={18} className="mt-0.5 shrink-0 text-indigo-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{document.title}</p>
        <p className="text-xs opacity-50">
          {document.chunk_count ?? 0} chunks · {formatRelativeTime(document.created_at)}
        </p>
      </div>
      <button
        onClick={handleDelete}
        onBlur={() => setConfirming(false)}
        disabled={isDeleting}
        title={confirming ? "Click again to confirm" : "Delete document"}
        className="shrink-0 rounded-lg p-1.5 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-500/10 disabled:opacity-100"
      >
        {isDeleting ? (
          <Loader2 size={14} className="animate-spin opacity-60" />
        ) : (
          <Trash2 size={14} className={confirming ? "text-red-500" : "opacity-60"} />
        )}
      </button>
    </div>
  );
}

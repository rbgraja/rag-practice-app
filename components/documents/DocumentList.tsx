import { FolderOpen } from "lucide-react";
import { DocumentItem } from "@/components/documents/DocumentItem";
import type { DocumentRecord } from "@/types";

interface DocumentListProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export function DocumentList({ documents, isLoading, onDelete }: DocumentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass-inset h-14 animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl px-3 py-8 text-center opacity-50">
        <FolderOpen size={22} />
        <p className="text-sm">No documents yet</p>
        <p className="text-xs">Upload a PDF or add text to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} document={doc} onDelete={onDelete} />
      ))}
    </div>
  );
}

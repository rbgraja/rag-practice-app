import { Upload, FilePlus2 } from "lucide-react";
import { DocumentList } from "@/components/documents/DocumentList";
import type { DocumentRecord } from "@/types";

interface SidebarProps {
  documents: DocumentRecord[];
  isLoading: boolean;
  onOpenModal: (tab: "upload" | "text") => void;
  onDelete: (id: string) => Promise<void>;
}

export function Sidebar({ documents, isLoading, onOpenModal, onDelete }: SidebarProps) {
  return (
    <div className="glass-scrollbar flex h-full flex-col gap-5 overflow-y-auto p-5">
      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-50">
          Knowledge Base
        </h2>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenModal("upload")}
            className="glass-inset flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            <Upload size={15} />
            Upload PDF
          </button>
          <button
            onClick={() => onOpenModal("text")}
            className="glass-inset flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
          >
            <FilePlus2 size={15} />
            Add Text
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider opacity-50">
          Documents
        </h2>
        <DocumentList documents={documents} isLoading={isLoading} onDelete={onDelete} />
      </div>
    </div>
  );
}

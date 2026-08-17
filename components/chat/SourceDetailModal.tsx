import { Modal } from "@/components/ui/Modal";
import type { ChatSource } from "@/types";

interface SourceDetailModalProps {
  source: ChatSource;
  onClose: () => void;
}

export function SourceDetailModal({ source, onClose }: SourceDetailModalProps) {
  return (
    <Modal title="Retrieved Chunk" onClose={onClose} widthClassName="max-w-lg">
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-50">Document</p>
          <p className="font-medium">{source.documentTitle}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider opacity-50">Chunk</p>
          <p className="font-medium">
            #{source.chunkIndex + 1} · similarity {source.similarity.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider opacity-50">Content</p>
          <div className="glass-scrollbar glass-inset max-h-64 overflow-y-auto rounded-xl px-3 py-2.5 leading-relaxed whitespace-pre-wrap">
            {source.content}
          </div>
        </div>
      </div>
    </Modal>
  );
}

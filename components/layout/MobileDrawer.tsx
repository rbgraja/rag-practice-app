import { ReactNode } from "react";
import { X } from "lucide-react";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileDrawer({ open, onClose, children }: MobileDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel animate-drawer-in absolute left-0 top-0 h-full w-[85%] max-w-xs rounded-r-3xl">
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-black/[.06] dark:hover:bg-white/[.08]"
          >
            <X size={18} />
          </button>
        </div>
        <div className="h-[calc(100%-2.75rem)]">{children}</div>
      </div>
    </div>
  );
}

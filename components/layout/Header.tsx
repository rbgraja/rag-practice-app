import { Sparkles, PanelLeft } from "lucide-react";

interface HeaderProps {
  onOpenDrawer: () => void;
}

export function Header({ onOpenDrawer }: HeaderProps) {
  return (
    <header className="glass-panel z-10 flex items-center justify-between rounded-2xl px-4 py-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenDrawer}
          className="rounded-lg p-1.5 hover:bg-black/[.05] dark:hover:bg-white/[.08] lg:hidden"
          aria-label="Open knowledge base"
        >
          <PanelLeft size={18} />
        </button>
        <Sparkles size={18} className="text-indigo-400" />
        <span className="text-base font-semibold tracking-tight">RAG AI</span>
      </div>
      <span className="hidden text-xs opacity-40 sm:block">Supabase + pgvector</span>
    </header>
  );
}

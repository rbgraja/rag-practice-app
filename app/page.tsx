"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileDrawer } from "@/components/layout/MobileDrawer";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { AddKnowledgeModal } from "@/components/documents/AddKnowledgeModal";
import type { DocumentRecord } from "@/types";

export default function Home() {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [modalTab, setModalTab] = useState<"upload" | "text" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      if (response.ok) setDocuments(data.documents);
    } finally {
      setIsLoadingDocuments(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const handleCreated = (document: DocumentRecord) => {
    setDocuments((prev) => [document, ...prev]);
    setModalTab(null);
  };

  const handleDelete = async (id: string) => {
    const previous = documents;
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    const response = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (!response.ok) setDocuments(previous);
  };

  const sidebarProps = {
    documents,
    isLoading: isLoadingDocuments,
    onOpenModal: (tab: "upload" | "text") => {
      setModalTab(tab);
      setDrawerOpen(false);
    },
    onDelete: handleDelete,
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 p-4">
      <Header onOpenDrawer={() => setDrawerOpen(true)} />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-hidden lg:grid-cols-[300px_1fr]">
        <aside className="glass-panel hidden overflow-hidden rounded-2xl lg:block">
          <Sidebar {...sidebarProps} />
        </aside>

        <main className="glass-panel min-h-[70vh] overflow-hidden rounded-2xl">
          <ChatPanel />
        </main>
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Sidebar {...sidebarProps} />
      </MobileDrawer>

      {modalTab && (
        <AddKnowledgeModal
          initialTab={modalTab}
          onClose={() => setModalTab(null)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}

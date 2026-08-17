"use client";

import { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { ProcessingSteps } from "@/components/documents/ProcessingSteps";
import { cn } from "@/lib/utils";
import type { DocumentRecord } from "@/types";

const PDF_STEPS = [
  "Uploading PDF...",
  "Extracting text...",
  "Creating chunks...",
  "Generating embeddings...",
  "Saving vectors...",
  "Completed ✓",
];

const TEXT_STEPS = ["Creating chunks...", "Generating embeddings...", "Saving vectors...", "Completed ✓"];

interface AddKnowledgeModalProps {
  initialTab: "upload" | "text";
  onClose: () => void;
  onCreated: (document: DocumentRecord) => void;
}

export function AddKnowledgeModal({ initialTab, onClose, onCreated }: AddKnowledgeModalProps) {
  const [tab, setTab] = useState(initialTab);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const steps = tab === "upload" ? PDF_STEPS : TEXT_STEPS;

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startStepAnimation = () => {
    setActiveStep(0);
    let step = 0;
    intervalRef.current = setInterval(() => {
      step = Math.min(step + 1, steps.length - 2);
      setActiveStep(step);
    }, 900);
  };

  const stopStepAnimation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSubmit = async () => {
    setError(null);

    if (tab === "upload" && !file) {
      setError("Please choose a PDF file");
      return;
    }
    if (tab === "text" && (!title.trim() || content.trim().length < 20)) {
      setError("Please add a title and at least 20 characters of content");
      return;
    }

    setIsProcessing(true);
    startStepAnimation();

    try {
      let response: Response;

      if (tab === "upload") {
        const formData = new FormData();
        formData.append("file", file as File);
        formData.append("title", title);
        response = await fetch("/api/documents/upload", { method: "POST", body: formData });
      } else {
        response = await fetch("/api/documents/text", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, content }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      stopStepAnimation();
      setActiveStep(steps.length);
      setTimeout(() => onCreated(data.document as DocumentRecord), 500);
    } catch (err) {
      stopStepAnimation();
      setIsProcessing(false);
      setActiveStep(0);
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Modal title="Add Knowledge" onClose={onClose} widthClassName="max-w-md">
      {!isProcessing ? (
        <>
          <div className="mb-5 flex gap-1 rounded-full glass-inset p-1">
            {(["upload", "text"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === t ? "bg-gradient-to-br from-[rgb(99,91,255)] to-[rgb(56,189,248)] text-white" : "opacity-70 hover:opacity-100"
                )}
              >
                {t === "upload" ? "Upload PDF" : "Add Text"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {tab === "upload" ? (
              <UploadDropzone file={file} onFileSelected={setFile} />
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-medium opacity-70">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your test/document text here..."
                  rows={6}
                  className="glass-inset w-full resize-none rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-40 focus:ring-2 focus:ring-indigo-400/50"
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium opacity-70">Document Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. University Fee Policy"
                className="glass-inset w-full rounded-xl px-3 py-2 text-sm outline-none placeholder:opacity-40 focus:ring-2 focus:ring-indigo-400/50"
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button onClick={handleSubmit} className="w-full">
              {tab === "upload" ? "Process Document" : "Process Text"}
            </Button>
          </div>
        </>
      ) : (
        <div className="py-2">
          <ProcessingSteps steps={steps} activeIndex={activeStep} />
        </div>
      )}
    </Modal>
  );
}

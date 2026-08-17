"use client";

import { DragEvent, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadDropzoneProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
}

export function UploadDropzone({ file, onFileSelected }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) onFileSelected(dropped);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "glass-inset flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed px-6 py-10 text-center transition-colors",
        isDragging
          ? "border-indigo-400 bg-indigo-400/10"
          : "border-current/15 hover:border-current/25"
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => onFileSelected(e.target.files?.[0] ?? null)}
      />
      {file ? (
        <>
          <FileText size={28} className="text-indigo-400" />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs opacity-60">{(file.size / 1024 / 1024).toFixed(2)} MB — click to replace</p>
        </>
      ) : (
        <>
          <UploadCloud size={28} className="opacity-70" />
          <p className="text-sm font-medium">Drop PDF here</p>
          <p className="text-xs opacity-60">or browse files</p>
          <p className="text-[11px] opacity-40">PDF documents only, up to 20MB</p>
        </>
      )}
    </div>
  );
}

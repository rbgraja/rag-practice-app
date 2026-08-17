"use client";

import { KeyboardEvent, useState } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="glass-panel flex items-end gap-2 rounded-2xl p-2">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your documents..."
        rows={1}
        className="max-h-32 flex-1 resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:opacity-40"
      />
      <button
        onClick={submit}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[rgb(99,91,255)] to-[rgb(56,189,248)] text-white transition-all hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
      >
        <ArrowUp size={16} />
      </button>
    </div>
  );
}

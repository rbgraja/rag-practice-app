"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, AlertTriangle, Sparkles } from "lucide-react";
import { SourcesList } from "@/components/chat/SourcesList";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/types";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <div className="animate-fade-in-up flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-gradient-to-br from-[rgb(99,91,255)] to-[rgb(56,189,248)] px-4 py-2.5 text-sm text-white shadow-lg shadow-indigo-500/20">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up flex justify-start">
      <div
        className={cn(
          "group glass-inset relative max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 text-sm",
          message.error && "border-red-500/30"
        )}
      >
        <div className="mb-1 flex items-center gap-1.5 text-xs font-medium opacity-50">
          {message.error ? (
            <AlertTriangle size={12} className="text-red-500" />
          ) : (
            <Sparkles size={12} className="text-indigo-400" />
          )}
          Assistant
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-headings:my-2">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
        </div>

        {!message.error && (
          <button
            onClick={handleCopy}
            className="absolute right-2 top-2 rounded-lg p-1 opacity-0 transition-opacity hover:bg-black/[.06] group-hover:opacity-100 dark:hover:bg-white/[.08]"
            aria-label="Copy response"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="opacity-60" />}
          </button>
        )}

        {message.sources && <SourcesList sources={message.sources} />}
      </div>
    </div>
  );
}

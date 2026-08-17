"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Trash2 } from "lucide-react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { SuggestedQuestions } from "@/components/chat/SuggestedQuestions";
import type { ChatMessage, ChatResponse } from "@/types";

function randomId() {
  return Math.random().toString(36).slice(2);
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const sendMessage = async (question: string) => {
    const userMessage: ChatMessage = { id: randomId(), role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      const { answer, sources } = data as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { id: randomId(), role: "assistant", content: answer, sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: randomId(),
          role: "assistant",
          content: err instanceof Error ? err.message : "Something went wrong. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">AI Assistant</h2>
          <p className="text-xs opacity-50">Ask anything about your documents</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium opacity-60 transition-colors hover:bg-black/[.05] hover:opacity-100 dark:hover:bg-white/[.08]"
          >
            <Trash2 size={13} /> Clear chat
          </button>
        )}
      </div>

      <div ref={scrollRef} className="glass-scrollbar flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="glass-inset flex h-14 w-14 items-center justify-center rounded-full">
              <Sparkles size={22} className="text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-medium">Ask your first question</p>
              <p className="text-xs opacity-50">
                Answers are grounded in your uploaded documents, with sources cited.
              </p>
            </div>
            <SuggestedQuestions onSelect={sendMessage} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && <TypingIndicator />}
          </>
        )}
      </div>

      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}

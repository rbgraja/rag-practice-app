const QUESTIONS = [
  "What is this document about?",
  "Summarize the main points",
  "What are the important rules?",
  "Explain this in simple words",
];

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
}

export function SuggestedQuestions({ onSelect }: SuggestedQuestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {QUESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="glass-inset rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors hover:bg-black/[.04] dark:hover:bg-white/[.06]"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

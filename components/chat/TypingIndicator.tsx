export function TypingIndicator() {
  return (
    <div className="glass-inset flex w-fit items-center gap-1.5 rounded-2xl px-4 py-3">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="animate-typing-bounce h-1.5 w-1.5 rounded-full bg-current opacity-60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

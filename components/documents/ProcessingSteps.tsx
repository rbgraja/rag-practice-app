import { Check, Loader2 } from "lucide-react";

interface ProcessingStepsProps {
  steps: string[];
  activeIndex: number;
}

export function ProcessingSteps({ steps, activeIndex }: ProcessingStepsProps) {
  return (
    <ul className="space-y-2.5">
      {steps.map((step, index) => {
        const isDone = index < activeIndex;
        const isActive = index === activeIndex;

        return (
          <li key={step} className="flex items-center gap-3 text-sm">
            <span
              className={
                isDone
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white"
                  : isActive
                    ? "flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-white"
                    : "flex h-5 w-5 items-center justify-center rounded-full border border-current/20 opacity-40"
              }
            >
              {isDone ? (
                <Check size={12} />
              ) : isActive ? (
                <Loader2 size={12} className="animate-spin" />
              ) : null}
            </span>
            <span className={isDone || isActive ? "opacity-100" : "opacity-40"}>{step}</span>
          </li>
        );
      })}
    </ul>
  );
}

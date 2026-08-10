import { ArrowRight, RefreshCw } from "lucide-react";

interface FailureSuggestionsProps {
  suggestions: readonly string[];
}

export function FailureSuggestions({ suggestions }: FailureSuggestionsProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-brand-teal/15 bg-primary-soft">
      <div className="flex items-center gap-2 border-brand-teal/10 border-b px-3.5 py-3">
        <RefreshCw size={14} className="text-foreground" />
        <p className="font-semibold text-foreground text-xs">
          Try these adjustments
        </p>
      </div>
      <div className="divide-y divide-brand-teal/10">
        {suggestions.map((suggestion) => (
          <div key={suggestion} className="flex items-center gap-3 px-3.5 py-3">
            <ArrowRight size={13} className="shrink-0 text-foreground" />
            <p className="font-semibold text-foreground text-xs leading-snug">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

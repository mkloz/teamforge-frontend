import { ArrowRight, RefreshCw } from "lucide-react";

interface FailureSuggestionsProps {
  suggestions: readonly string[];
}

export function FailureSuggestions({ suggestions }: FailureSuggestionsProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-forge-teal/15 bg-forge-teal/5">
      <div className="flex items-center gap-2 border-b border-forge-teal/10 px-3.5 py-3">
        <RefreshCw size={14} className="text-forge-teal" />
        <p className="text-xs font-semibold text-forge-teal">
          Try these adjustments
        </p>
      </div>
      <div className="divide-y divide-forge-teal/10">
        {suggestions.map((suggestion) => (
          <div key={suggestion} className="flex items-center gap-3 px-3.5 py-3">
            <ArrowRight size={13} className="shrink-0 text-forge-teal" />
            <p className="text-xs font-semibold leading-snug text-foreground">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

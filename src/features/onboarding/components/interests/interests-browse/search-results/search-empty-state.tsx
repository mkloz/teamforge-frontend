import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-muted/5 flex items-center justify-center mb-3 border border-slate-muted/10">
        <Search size={20} className="text-slate-muted/30" strokeWidth={1.5} />
      </div>
      <p className="font-sans text-sm font-bold text-slate-muted">
        No results for &ldquo;{query}&rdquo;
      </p>
      <p className="font-sans text-xs text-slate-muted/50 mt-1">
        Try a different word
      </p>
    </div>
  );
}

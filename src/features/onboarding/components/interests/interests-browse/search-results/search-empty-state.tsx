import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-lg border border-forge-teal/15 bg-forge-teal/5">
        <Search size={20} className="text-forge-teal/70" strokeWidth={2} />
      </div>
      <p className="font-black font-sans text-base text-ink tracking-tight">
        No exact interest for &ldquo;{query}&rdquo;
      </p>
      <p className="mt-2 text-pretty font-medium font-sans text-slate-muted text-sm leading-relaxed">
        Try a broader word, or pick the closest thing from the catalog. The
        point is honest signal, not perfect wording.
      </p>
    </div>
  );
}

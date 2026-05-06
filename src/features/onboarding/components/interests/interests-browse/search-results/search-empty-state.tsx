import { Search } from "lucide-react";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-forge-teal/15 bg-forge-teal/5">
        <Search size={20} className="text-forge-teal/70" strokeWidth={2} />
      </div>
      <p className="font-sans text-base font-black tracking-tight text-ink">
        No exact interest for &ldquo;{query}&rdquo;
      </p>
      <p className="mt-2 font-sans text-sm font-medium leading-relaxed text-slate-muted text-pretty">
        Try a broader word, or pick the closest thing from the catalog. The
        point is honest signal, not perfect wording.
      </p>
    </div>
  );
}

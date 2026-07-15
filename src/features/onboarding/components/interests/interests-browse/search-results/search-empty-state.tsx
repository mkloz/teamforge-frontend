import { EmptyInterestSearchVisual } from "@/features/onboarding/assets/empty-interest-search";

interface SearchEmptyStateProps {
  query: string;
}

export function SearchEmptyState({ query }: SearchEmptyStateProps) {
  return (
    <div className="mx-auto flex min-h-[min(24rem,60dvh)] max-w-sm flex-col items-center justify-center py-12 text-center">
      <EmptyInterestSearchVisual className="mb-4 h-28 w-auto text-foreground" />
      <p className="font-black font-sans text-base text-ink tracking-tight">
        No exact interest for &ldquo;{query}&rdquo;
      </p>
      <p className="mt-2 text-pretty font-medium font-sans text-slate-muted text-sm leading-relaxed">
        Try a broader word or choose the closest option from the catalog.
      </p>
    </div>
  );
}

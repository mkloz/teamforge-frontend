import { PageErrorState } from "@/shared/components/page-error-state";

interface ProfilePageErrorProps {
  onRetry: () => void;
}

export function ProfilePageError({ onRetry }: ProfilePageErrorProps) {
  return (
    <main className="min-h-full bg-canvas px-4 py-10 md:px-8">
      <PageErrorState
        className="mx-auto max-w-3xl"
        title="Profile could not load"
        description="Your profile data could not be refreshed right now."
        onRetry={onRetry}
      />
    </main>
  );
}

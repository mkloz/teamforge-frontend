import { PageErrorState } from "@/shared/components/page-error-state";

interface ProfilePageErrorProps {
  description?: string;
  onRetry: () => void;
  title?: string;
}

export function ProfilePageError({
  description = "Your profile data could not be refreshed right now.",
  onRetry,
  title = "Profile could not load",
}: ProfilePageErrorProps) {
  return (
    <div className="min-h-full bg-canvas px-4 py-10 md:px-8">
      <PageErrorState
        className="mx-auto max-w-3xl"
        title={title}
        description={description}
        onRetry={onRetry}
      />
    </div>
  );
}

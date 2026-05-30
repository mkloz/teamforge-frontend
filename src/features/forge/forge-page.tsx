import { lazy, Suspense } from "react";
import { ForgeIntroContent, ForgePageShell } from "./forge-page-content";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

const InlineForgeWizard = lazy(() =>
  import("./components/inline-forge-wizard/index").then((module) => ({
    default: module.InlineForgeWizard,
  })),
);

function ForgeWizardFallback() {
  return (
    <div
      aria-label="Loading Forge"
      role="status"
      className="flex size-full min-h-[60vh] items-center justify-center px-4"
    >
      <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-forge-teal/70" />
      </div>
    </div>
  );
}

export function ForgePage() {
  const { isOpen, openWizard, closeWizard } = useForgeRouteState();

  return (
    <ForgePageShell isOpen={isOpen}>
      {!isOpen ? (
        <ForgeIntroContent onForgeClick={openWizard} />
      ) : (
        <Suspense fallback={<ForgeWizardFallback />}>
          <InlineForgeWizard onCancel={closeWizard} />
        </Suspense>
      )}
    </ForgePageShell>
  );
}

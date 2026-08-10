import { useEffect } from "react";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createFindafewPageMetadata } from "@/shared/lib/findafew-page-metadata";
import { useUiStore } from "@/shared/store/ui.store";
import { InlinePlanBuilder } from "./components/inline-plan-builder";
import { usePlanCreationRouteState } from "./hooks/use-plan-creation-route-state";
import {
  PlanCreationIntroContent,
  PlanCreationPageShell,
} from "./plan-creation-page-content";

const PLAN_CREATION_PAGE_METADATA = createFindafewPageMetadata({
  title: "Start a plan",
  description: "Create a Findafew group around one activity plan.",
});

export function PlanCreationPage() {
  usePageMetadata(PLAN_CREATION_PAGE_METADATA);

  const { isOpen, openWizard, closeWizard } = usePlanCreationRouteState();
  const setBottomNavHidden = useUiStore((state) => state.setBottomNavHidden);

  useEffect(() => {
    setBottomNavHidden(isOpen);

    return () => setBottomNavHidden(false);
  }, [isOpen, setBottomNavHidden]);

  return (
    <PlanCreationPageShell isOpen={isOpen}>
      {!isOpen ? (
        <PlanCreationIntroContent onPlanCreationClick={openWizard} />
      ) : (
        <InlinePlanBuilder onCancel={closeWizard} />
      )}
    </PlanCreationPageShell>
  );
}

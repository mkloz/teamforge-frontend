import { useEffect } from "react";
import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { useUiStore } from "@/shared/store/ui.store";
import { InlineForgeWizard } from "./components/inline-forge-wizard";
import { ForgeIntroContent, ForgePageShell } from "./forge-page-content";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

const FORGE_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Forge",
  description: "Create a TeamForge group around one activity plan.",
});

export function ForgePage() {
  usePageMetadata(FORGE_PAGE_METADATA);

  const { isOpen, openWizard, closeWizard } = useForgeRouteState();
  const setBottomNavHidden = useUiStore((state) => state.setBottomNavHidden);

  useEffect(() => {
    setBottomNavHidden(isOpen);

    return () => setBottomNavHidden(false);
  }, [isOpen, setBottomNavHidden]);

  return (
    <ForgePageShell isOpen={isOpen}>
      {!isOpen ? (
        <ForgeIntroContent onForgeClick={openWizard} />
      ) : (
        <InlineForgeWizard onCancel={closeWizard} />
      )}
    </ForgePageShell>
  );
}

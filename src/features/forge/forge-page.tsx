import { usePageMetadata } from "@/shared/hooks/use-page-metadata";
import { createTeamForgePageMetadata } from "@/shared/lib/teamforge-page-metadata";
import { InlineForgeWizard } from "./components/inline-forge-wizard";
import { ForgeIntroContent, ForgePageShell } from "./forge-page-content";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

const FORGE_PAGE_METADATA = createTeamForgePageMetadata({
  title: "Forge",
  description:
    "Forge a compatible TeamForge group around one clear activity plan.",
});

export function ForgePage() {
  usePageMetadata(FORGE_PAGE_METADATA);

  const { isOpen, openWizard, closeWizard } = useForgeRouteState();

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

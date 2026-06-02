import { InlineForgeWizard } from "./components/inline-forge-wizard";
import { ForgeIntroContent, ForgePageShell } from "./forge-page-content";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

export function ForgePage() {
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

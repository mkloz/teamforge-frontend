import { AnimatePresence } from "framer-motion";
import { InlineForgeWizard } from "./components/inline-forge-wizard/index";
import { ForgeIntroContent, ForgePageShell } from "./forge-page-content";
import { useForgeRouteState } from "./hooks/use-forge-route-state";

export function ForgePage() {
  const { isOpen, openWizard, closeWizard } = useForgeRouteState();

  return (
    <ForgePageShell isOpen={isOpen}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <ForgeIntroContent onForgeClick={openWizard} />
        ) : (
          <InlineForgeWizard key="forge-wizard" onCancel={closeWizard} />
        )}
      </AnimatePresence>
    </ForgePageShell>
  );
}

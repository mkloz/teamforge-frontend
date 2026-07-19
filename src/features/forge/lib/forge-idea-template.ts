import { selectForgeIdeaTemplate } from "@/features/forge/lib/forge-idea-template/template-selection";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

export { selectForgeIdeaTemplate };

export function buildForgeIdeaTemplate(idea: ForgeIdeaLaunch) {
  return selectForgeIdeaTemplate(idea)?.template ?? null;
}

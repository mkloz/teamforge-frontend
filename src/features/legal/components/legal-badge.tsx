import { Scale, ShieldCheck } from "lucide-react";
import type { LegalPageKind } from "@/features/legal/types/legal-page";
import { StatusPill } from "@/shared/components/ui/status-pill";

interface LegalBadgeProps {
  kind: LegalPageKind;
}

export function LegalBadge({ kind }: LegalBadgeProps) {
  const Icon = kind === "privacy" ? ShieldCheck : Scale;

  return (
    <StatusPill icon={Icon} tone="teal" size="sm">
      {kind === "privacy" ? "Privacy" : "Terms"}
    </StatusPill>
  );
}

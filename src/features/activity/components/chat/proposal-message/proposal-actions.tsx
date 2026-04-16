import { Button } from "@/shared/components/ui/button";
import { memo } from "react";

export const ProposalActions = memo(() => (
  <>
    <Button
      variant="secondary"
      size="sm"
      className="flex-1 h-9 text-micro font-black uppercase tracking-wider text-ink border-amber-500/20"
    >
      Approve
    </Button>
    <Button
      variant="subtle"
      size="sm"
      className="flex-1 h-9 text-micro font-black uppercase tracking-wider border-slate-muted/20"
    >
      Oppose
    </Button>
  </>
));

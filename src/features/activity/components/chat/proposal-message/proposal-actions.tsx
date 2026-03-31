import { Button } from "@/shared/components/ui/button";
import { memo } from "react";

export const ProposalActions = memo(() => (
  <>
    <Button className="flex-1 h-9 text-micro font-black uppercase tracking-wider bg-spark-amber hover:bg-spark-amber/90 text-ink rounded-xl shadow-lg shadow-spark-amber/20 transition active:scale-95">
      Approve
    </Button>
    <Button
      variant="destructive"
      className="flex-1 h-9 text-micro font-bold hover:bg-destructive/5 rounded-xl transition-colors"
    >
      Oppose
    </Button>
  </>
));

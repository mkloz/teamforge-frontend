import { Button } from "@/shared/components/ui/button";
import { buildForgeLaunchNavigation } from "@/features/forge/lib/forge-route";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function ForgeCTA() {
  return (
    <div className="group/card relative overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-sm transition-all duration-200 hover:border-forge-teal/30 hover:shadow-[0_10px_24px_rgba(13,148,136,0.08)]">
      <div className="relative z-10 space-y-3">
        <div className="space-y-1.5">
          <h3 className="text-lg font-black leading-tight tracking-tighter text-foreground">
            Forge your own
            <br />
            <span className="text-forge-teal italic">perfect group.</span>
          </h3>
          <p className="text-[11px] font-medium leading-relaxed text-muted-foreground">
            Take the lead. The algorithm will find compatible people to fill the
            remaining spots.
          </p>
        </div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button asChild className="h-9 w-full rounded-xl text-xs font-bold">
            <Link {...buildForgeLaunchNavigation()}>
              <Plus className="size-3.5 mr-2 transition-transform group-hover:rotate-90" />
              Forge My Group
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

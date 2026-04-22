import { Button } from "@/shared/components/ui/button";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export function ForgeCTA() {
  return (
    <div className="relative overflow-hidden bg-ink text-background p-5 rounded-4xl shadow-2xl border-thick border-white/5 group/card">
      <div className="relative z-10 space-y-5">
        <div className="space-y-2">
          <h3 className="text-2xl font-black leading-tight tracking-tighter">
            Forge your own
            <br />
            <span className="text-forge-teal italic drop-shadow-sm">
              perfect group.
            </span>
          </h3>
          <p className="text-xs text-background/60 font-medium leading-relaxed">
            Take the lead. The algorithm will find compatible people to fill the
            remaining spots.
          </p>
        </div>

        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
          <Button className="w-full h-11 group text-xs font-bold rounded-2xl bg-forge-teal hover:bg-forge-teal/90 text-white border-none shadow-button-primary active:shadow-none active:translate-y-0.5 transition-all">
            <Plus className="size-4 mr-2 transition-transform group-hover:rotate-90" />
            Forge My Group
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

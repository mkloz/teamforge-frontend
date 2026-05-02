import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { memo } from "react";

interface LightboxHeaderProps {
  count: number;
  currentMedia: UnifiedAttachment | null;
  selectedIndex: number | null;
}

export const LightboxHeader = memo(function LightboxHeader({
  count,
  currentMedia,
  selectedIndex,
}: LightboxHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute top-0 inset-x-0 h-20 pl-8 pr-28 flex items-center justify-between z-50 bg-linear-to-b from-black/60 to-transparent pointer-events-none"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white font-black text-micro tracking-wide">
            {selectedIndex !== null ? selectedIndex + 1 : 0} / {count}
          </span>
          <span className="text-white/80 font-bold text-sm tracking-tight truncate max-w-40 sm:max-w-80 uppercase">
            {currentMedia?.name || "Shared memory"}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4 pointer-events-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="text-white/60 hover:text-white hover:bg-white/10 rounded-full transition active:scale-90 pointer-events-auto"
              >
                <a
                  href={currentMedia?.url ?? "#"}
                  download={currentMedia?.name || true}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Download media"
                  onClick={(event) => {
                    if (!currentMedia) {
                      event.preventDefault();
                    }
                  }}
                >
                  <Download size={20} />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-white/10 backdrop-blur-md border-white/10 text-white font-bold text-xs"
            >
              Download file
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
});

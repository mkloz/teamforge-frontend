import { motion } from "framer-motion";
import { Download } from "lucide-react";
import { memo } from "react";
import type { UnifiedAttachment } from "@/features/activity/lib/activity-contract";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

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
      className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-20 items-center justify-between bg-linear-to-b from-black/60 to-transparent pr-28 pl-8"
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/10 px-2 py-0.5 font-black text-white text-xs tracking-wide">
            {selectedIndex !== null ? selectedIndex + 1 : 0} / {count}
          </span>
          <span className="max-w-40 truncate font-bold text-sm text-white/80 tracking-tight sm:max-w-80">
            {currentMedia?.name || "Shared memory"}
          </span>
        </div>
      </div>
      <div className="pointer-events-auto flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="pointer-events-auto rounded-full text-white/60 transition hover:bg-white/10 hover:text-white active:scale-90"
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
                  <Download className="size-5" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="border-white/10 bg-white/10 font-bold text-white text-xs backdrop-blur-md"
            >
              Download file
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </motion.div>
  );
});

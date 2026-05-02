import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

import { FooterAction } from "./footer-action";
import { FooterValidationHints } from "./footer-validation-hints";
import type { ForgeFooterChildProps } from "./types";

interface FooterActionAreaProps extends ForgeFooterChildProps {
  continuePulse: boolean;
  onDisabledStep1Continue: () => void;
}

export function FooterActionArea({
  continuePulse,
  fw,
  onDisabledStep1Continue,
}: FooterActionAreaProps) {
  return (
    <div className="px-4 md:px-12 pt-5 pb-8 md:pb-12">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {fw.canGoBack && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -10 }}
                className="shrink-0"
              >
                <Button
                  variant="outline"
                  size="icon"
                  onClick={fw.goBack}
                  className="size-14 rounded-2xl border-border/60 text-slate-muted hover:text-ink hover:border-ink shadow-button-outline/10"
                  aria-label="Go back"
                >
                  <ChevronLeft size={20} />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <FooterAction
                continuePulse={continuePulse}
                fw={fw}
                onDisabledStep1Continue={onDisabledStep1Continue}
              />
            </AnimatePresence>
          </div>
        </div>

        <FooterValidationHints fw={fw} />
      </div>
    </div>
  );
}

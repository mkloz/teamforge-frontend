import { domAnimation, LazyMotion } from "framer-motion";

import { FooterActionArea } from "./footer-action-area";
import { HintStrip } from "./hint-strip";
import type { ForgeFooterProps } from "./types";
import { useContinueButtonPulse } from "./use-continue-button-pulse";

export function ForgeFooter({ fw, onDisabledStep1Continue }: ForgeFooterProps) {
  const continuePulse = useContinueButtonPulse(fw);

  return (
    <LazyMotion features={domAnimation}>
      <div className="-mx-4 mt-auto md:-mx-12">
        <HintStrip fw={fw} />
        <FooterActionArea
          continuePulse={continuePulse}
          fw={fw}
          onDisabledStep1Continue={onDisabledStep1Continue}
        />
      </div>
    </LazyMotion>
  );
}

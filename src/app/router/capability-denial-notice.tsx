import { useLocation } from "@tanstack/react-router";
import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

import {
  type CapabilityDenialNotice as CapabilityDenialNoticeValue,
  consumeCapabilityDenialNotice,
  getCapabilityDenialCopy,
} from "@/app/router/route-guards/capability-denial";
import { Button } from "@/shared/components/ui/button";

export function CapabilityDenialNotice() {
  const pathname = useLocation({ select: (location) => location.pathname });

  return <RouteCapabilityDenialNotice key={pathname} />;
}

function RouteCapabilityDenialNotice() {
  const [notice, setNotice] = useState<CapabilityDenialNoticeValue | null>(() =>
    consumeCapabilityDenialNotice(),
  );

  if (!notice) return null;

  const copy = getCapabilityDenialCopy(notice);

  return (
    <div
      className="fixed inset-x-3 top-3 z-90 mx-auto flex max-w-xl items-start gap-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-xl backdrop-blur-md"
      role="status"
    >
      <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="font-bold text-sm">{copy.title}</p>
        <p className="mt-1 text-muted-foreground text-sm">{copy.description}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Dismiss explanation"
        onClick={() => setNotice(null)}
      >
        <X className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

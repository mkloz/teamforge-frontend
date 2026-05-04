import { ArrowRight } from "lucide-react";

import { Button } from "@/shared/components/ui/button";

interface OpenGroupHubButtonProps {
  onEnterGroupHub: () => Promise<void>;
}

export function OpenGroupHubButton({
  onEnterGroupHub,
}: OpenGroupHubButtonProps) {
  return (
    <Button
      variant="primary"
      size="lg"
      onClick={() => void onEnterGroupHub()}
      className="h-14 w-full rounded-lg text-base font-bold"
    >
      Open group hub
      <ArrowRight size={17} />
    </Button>
  );
}

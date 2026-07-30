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
      className="h-11 w-full rounded-lg px-6 sm:h-12 sm:w-auto"
    >
      Open group workspace
      <ArrowRight size={17} />
    </Button>
  );
}

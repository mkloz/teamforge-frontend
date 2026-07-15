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
      className="h-14 w-full rounded-lg"
    >
      Open group workspace
      <ArrowRight size={17} />
    </Button>
  );
}

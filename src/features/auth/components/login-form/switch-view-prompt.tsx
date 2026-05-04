import { Button } from "@/shared/components/ui/button";

interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="font-sans text-sm text-slate-muted text-center mt-6">
      New around here?{" "}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={onClick}
        className="h-auto p-0 font-semibold"
      >
        Join the forge
      </Button>
    </p>
  );
}

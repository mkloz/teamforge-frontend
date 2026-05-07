import { Button } from "@/shared/components/ui/button";

interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="mt-6 text-center font-sans text-sm text-slate-muted">
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

import { Button } from "@/shared/components/ui/button";

interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="mt-6 text-center font-sans text-slate-muted text-sm">
      New around here?{" "}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={onClick}
        className="min-h-11 p-0 font-semibold"
      >
        Create an account
      </Button>
    </p>
  );
}

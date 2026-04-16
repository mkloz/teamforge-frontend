import { Button } from "@/shared/components/ui/button";

interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="font-sans text-sm text-slate-muted text-center mt-6 flex items-center justify-center gap-1">
      Already have an account?{" "}
      <Button
        variant="link"
        size="sm"
        onClick={onClick}
        className="h-auto p-0 font-bold"
      >
        Log in here
      </Button>
    </p>
  );
}

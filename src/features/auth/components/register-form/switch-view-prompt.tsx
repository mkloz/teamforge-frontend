import { Button } from "@/shared/components/ui/button";

interface SwitchViewPromptProps {
  onClick: () => void;
}

export function SwitchViewPrompt({ onClick }: SwitchViewPromptProps) {
  return (
    <p className="mt-6 flex items-center justify-center gap-1 text-center font-sans text-slate-muted text-sm">
      Already have an account?{" "}
      <Button variant="link" size="sm" onClick={onClick} className="h-auto p-0">
        Log in here
      </Button>
    </p>
  );
}

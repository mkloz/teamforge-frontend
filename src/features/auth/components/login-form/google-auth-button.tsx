import { GoogleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";

interface GoogleAuthButtonProps {
  loading: boolean;
}

export function GoogleAuthButton({ loading }: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      disabled={loading}
      className="w-full h-12 rounded-xl border-border bg-white font-sans text-sm font-semibold text-ink flex items-center justify-center gap-2.5 hover:border-slate-muted hover:bg-slate-50 transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-xs"
    >
      <GoogleIcon />
      <span>Google</span>
    </Button>
  );
}

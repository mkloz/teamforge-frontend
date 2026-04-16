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
      size="lg"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2.5"
    >
      <GoogleIcon />
      <span>Continue with Google</span>
    </Button>
  );
}

import { GoogleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";

interface GoogleAuthButtonProps {
  disabled?: boolean;
  loading: boolean;
  onClick: () => void;
  onIntent?: () => void;
  title?: string;
}

export function GoogleAuthButton({
  disabled = false,
  loading,
  onClick,
  onIntent,
  title,
}: GoogleAuthButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      disabled={disabled || loading}
      title={title}
      onClick={onClick}
      onFocus={onIntent}
      onPointerEnter={onIntent}
      className="w-full gap-2.5"
    >
      <GoogleIcon />
      <span>Continue with Google</span>
    </Button>
  );
}

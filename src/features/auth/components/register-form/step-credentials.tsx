import { FormLevelError } from "@/features/auth/components/form-level-error";
import { useGoogleAuth } from "@/features/auth/hooks/use-google-auth";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { GoogleIcon } from "@/shared/components/icons";
import { Button } from "@/shared/components/ui/button";
import { RegisterIdentityFields } from "./register-identity-fields";
import { RegisterPasswordField } from "./register-password-field";

interface StepCredentialsProps {
  onNext: () => void;
  onGoogleSuccess?: () => void | Promise<void>;
}

export function StepCredentials({
  onNext,
  onGoogleSuccess,
}: StepCredentialsProps) {
  const {
    loading: googleLoading,
    rootError: googleError,
    startGoogleAuth,
  } = useGoogleAuth({
    intent: "register",
    onSuccess: onGoogleSuccess,
  });

  return (
    <div className="flex flex-col gap-4">
      <RegisterIdentityFields />
      <RegisterPasswordField />

      <Button type="button" onClick={onNext} size="lg" className="mt-2 w-full">
        Next step
        <ArrowRightAnimated />
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="font-sans text-xs font-medium text-slate-muted">
          or use
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={startGoogleAuth}
        disabled={googleLoading}
      >
        <GoogleIcon />
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </Button>

      {googleError ? <FormLevelError message={googleError} /> : null}
    </div>
  );
}

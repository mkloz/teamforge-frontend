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
  onNextIntent?: () => void;
}

interface GoogleRegisterButtonViewState {
  disabled: boolean;
  label: string;
  title: string | undefined;
}

export function StepCredentials({
  onNext,
  onGoogleSuccess,
  onNextIntent,
}: StepCredentialsProps) {
  const {
    isOnline: isGoogleOnline,
    loading: googleLoading,
    preloadGoogleAuth,
    rootError: googleError,
    startGoogleAuth,
  } = useGoogleAuth({
    intent: "register",
    onSuccess: onGoogleSuccess,
  });
  const googleButtonState = getGoogleRegisterButtonViewState({
    isGoogleOnline,
    googleLoading,
  });

  return (
    <div className="flex flex-col gap-4">
      <RegisterIdentityFields />
      <RegisterPasswordField />

      <NextStepButton onNext={onNext} onNextIntent={onNextIntent} />

      <RegisterSocialDivider />

      <GoogleRegisterButton
        onIntent={preloadGoogleAuth}
        onStartGoogleAuth={startGoogleAuth}
        viewState={googleButtonState}
      />

      <GoogleRegisterError message={googleError} />
    </div>
  );
}

function NextStepButton({
  onNext,
  onNextIntent,
}: Pick<StepCredentialsProps, "onNext" | "onNextIntent">) {
  return (
    <Button
      type="button"
      onClick={onNext}
      onFocus={onNextIntent}
      onPointerEnter={onNextIntent}
      size="lg"
      className="mt-2 w-full"
    >
      Next step
      <ArrowRightAnimated />
    </Button>
  );
}

function RegisterSocialDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="font-medium font-sans text-slate-muted text-xs">
        or use
      </span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleRegisterButton({
  onIntent,
  onStartGoogleAuth,
  viewState,
}: {
  onIntent: () => void;
  onStartGoogleAuth: () => void;
  viewState: GoogleRegisterButtonViewState;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="lg"
      className="w-full"
      onClick={onStartGoogleAuth}
      onFocus={onIntent}
      onPointerEnter={onIntent}
      disabled={viewState.disabled}
      title={viewState.title}
    >
      <GoogleIcon />
      {viewState.label}
    </Button>
  );
}

function GoogleRegisterError({ message }: { message?: string | null }) {
  return message ? <FormLevelError message={message} /> : null;
}

function getGoogleRegisterButtonViewState({
  isGoogleOnline,
  googleLoading,
}: {
  isGoogleOnline: boolean;
  googleLoading: boolean;
}): GoogleRegisterButtonViewState {
  return {
    disabled: !isGoogleOnline || googleLoading,
    label: getGoogleRegisterButtonLabel({ isGoogleOnline, googleLoading }),
    title: isGoogleOnline
      ? undefined
      : "Reconnect before continuing with Google.",
  };
}

function getGoogleRegisterButtonLabel({
  isGoogleOnline,
  googleLoading,
}: {
  isGoogleOnline: boolean;
  googleLoading: boolean;
}) {
  if (googleLoading) {
    return "Connecting to Google...";
  }

  return isGoogleOnline ? "Continue with Google" : "Reconnect for Google";
}

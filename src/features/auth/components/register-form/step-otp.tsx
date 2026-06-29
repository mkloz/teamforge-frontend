import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useFormContext } from "react-hook-form";
import type { RegisterValues } from "@/features/auth/schemas/auth-schemas";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/shared/components/ui/input-otp";

interface StepOtpProps {
  onBack: () => void;
  loading: boolean;
  resendLoading: boolean;
  email: string;
  isOnline: boolean;
  otpMessage?: string | null;
  onResend: () => void;
}

const OTP_SLOT_CLASS =
  "h-12 w-10 max-w-12 rounded-xl border border-border bg-card font-mono text-lg transition-all duration-200 hover:border-forge-teal/40 focus-within:border-forge-teal focus-within:ring-2 focus-within:ring-forge-teal/15 sm:w-12";

const OTP_SLOT_GROUPS = [
  [0, 1, 2],
  [3, 4, 5],
] as const;

function getSubmitTitle(isOnline: boolean) {
  return isOnline ? undefined : "Reconnect before verifying your email.";
}

function getSubmitLabel(isOnline: boolean) {
  return isOnline ? "I'm ready to forge" : "Reconnect to continue";
}

function getResendTitle(isOnline: boolean) {
  return isOnline
    ? undefined
    : "Reconnect before resending your verification code.";
}

function getResendLabel(resendLoading: boolean) {
  return resendLoading ? "Sending a fresh code..." : "Resend code";
}

function OtpSlotGroup({ slots }: { slots: readonly number[] }) {
  return (
    <InputOTPGroup className="flex-1 justify-between gap-1 sm:gap-2">
      {slots.map((slotIndex) => (
        <InputOTPSlot
          key={`otp-slot-${slotIndex}`}
          index={slotIndex}
          className={OTP_SLOT_CLASS}
        />
      ))}
    </InputOTPGroup>
  );
}

export function StepOtp({
  onBack,
  loading,
  resendLoading,
  email,
  isOnline,
  otpMessage,
  onResend,
}: StepOtpProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border border-border bg-card px-4 py-3 text-foreground text-sm">
        <p className="font-medium text-foreground">Check your inbox</p>
        <p className="mt-1 text-slate-muted">
          {otpMessage ??
            `We sent a 6-digit code to ${email}. Enter it below to finish your account.`}
        </p>
      </div>

      <FormField
        control={control}
        name="otp"
        render={({ field }) => (
          <FormItem className="mx-auto w-full gap-3 py-2">
            <FormLabel className="flex w-full justify-center text-center font-sans font-semibold text-ink text-sm">
              Verification Code
            </FormLabel>
            <FormControl>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="w-full justify-between"
                className="flex w-full"
                {...field}
              >
                <OtpSlotGroup slots={OTP_SLOT_GROUPS[0]} />

                <div className="flex items-center justify-center px-2 font-medium text-slate-muted/70">
                  -
                </div>

                <OtpSlotGroup slots={OTP_SLOT_GROUPS[1]} />
              </InputOTP>
            </FormControl>
            <FormMessage className="text-center font-medium text-destructive text-xs" />
          </FormItem>
        )}
      />

      <Button
        type="submit"
        disabled={!isOnline}
        loading={loading}
        title={getSubmitTitle(isOnline)}
        size="lg"
        className="mt-4 w-full"
      >
        {getSubmitLabel(isOnline)}
        <ArrowRightAnimated />
      </Button>

      <Button
        type="button"
        variant="outline"
        disabled={!isOnline || loading || resendLoading}
        title={getResendTitle(isOnline)}
        onClick={onResend}
        size="sm"
        className="w-full"
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        {getResendLabel(resendLoading)}
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={loading || resendLoading}
        onClick={onBack}
        size="sm"
        className="mt-2 text-slate-muted hover:bg-transparent hover:text-ink"
      >
        <ArrowLeft size={14} />
        Go back
      </Button>
    </div>
  );
}

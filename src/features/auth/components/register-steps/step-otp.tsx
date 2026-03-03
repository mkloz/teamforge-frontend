import { REGEXP_ONLY_DIGITS } from "input-otp";
import { ArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

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
import type { RegisterValues } from "../../schemas/auth-schemas";

import { Loader2 } from "lucide-react";

interface StepOtpProps {
  onBack: () => void;
  loading: boolean;
}

export function StepOtp({ onBack, loading }: StepOtpProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      <FormField
        control={control}
        name="otp"
        render={({ field }) => (
          <FormItem className="space-y-3 mx-auto py-2 w-full">
            <FormLabel className="font-sans text-sm font-semibold text-ink text-center flex w-full justify-center">
              Verification Code
            </FormLabel>
            <FormControl>
              <InputOTP
                maxLength={6}
                pattern={REGEXP_ONLY_DIGITS}
                containerClassName="w-full justify-between"
                className="w-full flex"
                {...field}
              >
                <InputOTPGroup className="flex-1 justify-between gap-1 sm:gap-2">
                  {[0, 1, 2].map((idx) => (
                    <InputOTPSlot
                      key={idx}
                      index={idx}
                      className="h-12 flex-1 rounded-xl border border-[#E5E7EB] font-mono text-lg transition-all focus-within:border-forge-teal focus-within:ring-2 focus-within:ring-[rgba(13,148,136,0.12)]"
                    />
                  ))}
                </InputOTPGroup>

                <div className="flex items-center justify-center px-2 text-slate-400 font-medium">
                  -
                </div>

                <InputOTPGroup className="flex-1 justify-between gap-1 sm:gap-2">
                  {[3, 4, 5].map((idx) => (
                    <InputOTPSlot
                      key={idx}
                      index={idx}
                      className="h-12 flex-1 rounded-xl border border-[#E5E7EB] font-mono text-lg transition-all focus-within:border-forge-teal focus-within:ring-2 focus-within:ring-[rgba(13,148,136,0.12)]"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </FormControl>
            <FormMessage className="text-xs font-medium text-red-500 text-center" />
          </FormItem>
        )}
      />

      <Button
        type="submit"
        disabled={loading}
        className={`w-full h-12 rounded-xl mt-4 text-sm sm:text-base font-semibold group transition-all active:scale-[0.98] ${
          !loading
            ? "shadow-lg shadow-forge-teal/20 hover:shadow-forge-teal/40 hover:-translate-y-0.5 bg-forge-teal text-white hover:bg-teal-500"
            : ""
        }`}
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Creating account...
          </>
        ) : (
          <>
            Verify & Create
            <svg
              className="w-4 h-4 ml-1.5 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </>
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        disabled={loading}
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 font-sans text-sm font-medium text-slate-muted hover:text-ink hover:bg-transparent mt-2 border-0"
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </div>
  );
}

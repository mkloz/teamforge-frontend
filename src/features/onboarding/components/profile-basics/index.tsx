import { motion } from "framer-motion";
import { ShieldCheck, UserRound } from "lucide-react";
import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";

import { ProfileBasicsFormFields } from "./profile-basics-form-fields";

interface ProfileBasicsCardProps {
  form: UseFormReturn<ProfileBasicsValues>;
  isSaving: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  saveError: string | null;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsCard({
  form,
  isSaving,
  onSubmit,
  saveError,
  watchedValues,
}: ProfileBasicsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-2xl border border-border bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-8"
    >
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-forge-teal/10 text-forge-teal">
          <UserRound size={22} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-normal text-ink">
            Finish your profile basics
          </h1>
          <p className="text-sm leading-6 text-slate-muted">
            Google gave us your sign-in. TeamForge still needs the basics that
            make local groups work.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <ProfileBasicsFormFields form={form} watchedValues={watchedValues} />

          <div className="flex items-start gap-3 rounded-2xl border border-forge-teal/15 bg-forge-teal/5 p-4 text-sm leading-6 text-slate-muted">
            <ShieldCheck
              size={18}
              strokeWidth={1.5}
              className="mt-0.5 shrink-0 text-forge-teal"
            />
            <p>
              Age and city help us form groups that make sense in real life.
              Gender stays on your profile and does not affect group
              compatibility.
            </p>
          </div>

          {saveError ? (
            <p className="text-sm font-medium text-destructive">{saveError}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" loading={isSaving}>
            Continue
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

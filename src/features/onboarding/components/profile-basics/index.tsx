import { motion } from "framer-motion";
import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
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
      className="flex w-full flex-col"
    >
      <div className="mb-6 flex flex-col items-center sm:mb-8">
        <h1 className="text-center font-sans text-2xl leading-tight font-extrabold tracking-tight text-balance text-ink sm:text-4xl">
          Tell us about yourself
          <span className="text-forge-teal">.</span>
        </h1>
        <p className="mt-1 max-w-sm text-center font-sans text-xs text-slate-muted sm:mt-2 sm:text-base">
          Google handled sign-in. These details help us forge better groups.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ProfileBasicsFormFields form={form} watchedValues={watchedValues} />

          {saveError ? (
            <p className="text-sm font-medium text-destructive">{saveError}</p>
          ) : null}

          <Button
            type="submit"
            size="md"
            className="group mt-4 w-full"
            loading={isSaving}
          >
            Looks good
            <ArrowRightAnimated />
          </Button>
        </form>
      </Form>
    </motion.div>
  );
}

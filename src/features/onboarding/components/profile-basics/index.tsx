import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import { ErrorProfileSaveVisual } from "@/assets/error-state/error-profile-save";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";

import { ProfileBasicsFormFields } from "./profile-basics-form-fields";

interface ProfileBasicsCardProps {
  form: UseFormReturn<ProfileBasicsValues>;
  isOnline: boolean;
  isSaving: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  saveError: string | null;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsCard({
  form,
  isOnline,
  isSaving,
  onSubmit,
  saveError,
  watchedValues,
}: ProfileBasicsCardProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex flex-col items-center sm:mb-8">
        <h1 className="text-balance text-center font-extrabold font-sans text-2xl text-ink leading-tight tracking-tight sm:text-4xl">
          Tell us about yourself
          <span className="text-forge-teal">.</span>
        </h1>
        <p className="mt-1 max-w-sm text-center font-sans text-slate-muted text-xs sm:mt-2 sm:text-base">
          Google handled sign-in. These details help us forge better groups.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ProfileBasicsFormFields form={form} watchedValues={watchedValues} />

          {saveError ? (
            <div className="flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-3">
              <ErrorProfileSaveVisual className="h-6 w-auto shrink-0 text-foreground" />
              <p className="font-medium text-destructive text-sm">
                {saveError}
              </p>
            </div>
          ) : null}

          <Button
            type="submit"
            size="md"
            className="group mt-4 w-full"
            disabled={!isOnline || isSaving}
            loading={isSaving}
            title={isOnline ? undefined : "Reconnect before saving details."}
          >
            {isOnline ? "Looks good" : "Reconnect to continue"}
            <ArrowRightAnimated />
          </Button>
        </form>
      </Form>
    </div>
  );
}

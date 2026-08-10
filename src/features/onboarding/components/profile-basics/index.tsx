import type { FormEventHandler } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { ProfileBasicsValues } from "@/features/onboarding/schemas/profile-basics.schema";
import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import { Form } from "@/shared/components/ui/form";
import { Notice } from "@/shared/components/ui/notice";

import { ProfileBasicsFormFields } from "./profile-basics-form-fields";

interface ProfileBasicsCardProps {
  form: UseFormReturn<ProfileBasicsValues>;
  isOnline: boolean;
  isSaving: boolean;
  onSubmit: FormEventHandler<HTMLFormElement>;
  requiresDateOfBirth: boolean;
  saveError: string | null;
  watchedValues: Partial<ProfileBasicsValues>;
}

export function ProfileBasicsCard({
  form,
  isOnline,
  isSaving,
  onSubmit,
  requiresDateOfBirth,
  saveError,
  watchedValues,
}: ProfileBasicsCardProps) {
  return (
    <div className="flex w-full flex-col">
      <div className="mb-6 flex flex-col items-center sm:mb-8">
        <h1 className="text-balance text-center font-display font-extrabold text-2xl text-ink leading-tight tracking-tight sm:text-4xl">
          Tell us about yourself
          <span className="text-foreground">.</span>
        </h1>
        <p className="mt-1 max-w-sm text-center font-sans text-slate-muted text-xs sm:mt-2 sm:text-base">
          Add the details Findafew uses to check eligibility, shape nearby
          groups, and complete your profile.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <ProfileBasicsFormFields
            form={form}
            requiresDateOfBirth={requiresDateOfBirth}
            watchedValues={watchedValues}
          />

          {saveError ? (
            <Notice role="alert" tone="danger" size="md" statusIcon>
              {saveError}
            </Notice>
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

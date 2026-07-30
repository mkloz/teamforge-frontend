import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import type { User } from "@/shared/schemas";

interface ProfileIdentityFieldsProps {
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
}

export function ProfileIdentityFields({
  currentUser,
  form,
}: ProfileIdentityFieldsProps) {
  return (
    <>
      <div className="grid gap-x-5 gap-y-2 md:grid-cols-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="gap-2 md:contents">
              <FormLabel className="min-h-4 md:col-start-1 md:row-start-1">
                Full name
              </FormLabel>
              <FormControl className="md:col-start-1 md:row-start-2">
                <Input {...field} placeholder="Avery Johnson" />
              </FormControl>
              <FormMessage className="md:col-start-1 md:row-start-3" />
            </FormItem>
          )}
        />

        <div className="grid gap-2 md:contents">
          <Label
            htmlFor="settings-profile-email"
            className="min-h-4 font-medium text-ink text-sm md:col-start-2 md:row-start-1"
          >
            Email
          </Label>
          <Input
            id="settings-profile-email"
            value={currentUser?.email ?? ""}
            disabled
            readOnly
            className="md:col-start-2 md:row-start-2"
          />
          <p className="text-slate-muted text-xs md:col-start-2 md:row-start-3">
            Email editing is not available in TeamForge yet.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  placeholder="A quick intro people will see on your profile."
                  className="text-ink text-sm"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}

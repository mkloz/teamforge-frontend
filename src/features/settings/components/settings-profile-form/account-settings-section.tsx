import { Link } from "@tanstack/react-router";

import { Avatar } from "@/shared/components/common/avatar";
import { FileDropzone } from "@/shared/components/common/file-dropzone";
import { AddressAutocomplete } from "@/shared/components/maps/address-autocomplete";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { buildProfileNavigation } from "@/shared/lib/app-route";
import type { User } from "@/shared/schemas";
import { StatPill } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { unspecifiedGenderValue } from "@/features/settings/schemas/settings-profile.schema";
import type { SettingsProfileValues } from "@/features/settings/schemas/settings-profile.schema";
import type { UseFormReturn } from "react-hook-form";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
] as const;

interface AccountSettingsSectionProps {
  currentUser: User | undefined;
  form: UseFormReturn<SettingsProfileValues>;
  onSubmit: () => void;
  onAvatarSelect: (file: File) => Promise<unknown>;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  saveMessage: string | null;
  saveError: string | null;
  avatarMessage: string | null;
  avatarError: string | null;
  profileSummary: Array<{ label: string; value: string }>;
}

export function AccountSettingsSection({
  currentUser,
  form,
  onSubmit,
  onAvatarSelect,
  isSaving,
  isUploadingAvatar,
  saveMessage,
  saveError,
  avatarMessage,
  avatarError,
  profileSummary,
}: AccountSettingsSectionProps) {
  const locationLat = form.watch("locationLat");
  const locationLng = form.watch("locationLng");

  return (
    <>
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={currentUser?.avatar}
              name={currentUser?.name}
              className="h-18 w-18 border border-border bg-canvas text-lg"
              loading="eager"
            />

            <div>
              <h2 className="text-xl font-bold text-ink">Account Snapshot</h2>
              <p className="mt-1 text-sm text-slate-muted">
                Keep your profile accurate with the same backend data the rest
                of the app reads.
              </p>
            </div>
          </div>

          <FileDropzone
            variant="inline"
            accept="image/*"
            title="Update photo"
            description="Drop a new profile image here."
            helper="PNG, JPG, WEBP up to 5 MB"
            actionLabel="Browse"
            disabled={isUploadingAvatar}
            isUploading={isUploadingAvatar}
            error={avatarError}
            className="w-full lg:max-w-80"
            onFiles={(files) => {
              const file = files[0];
              if (file) {
                void onAvatarSelect(file);
              }
            }}
          />
        </div>

        {avatarMessage && !avatarError && (
          <p className="mt-4 text-sm text-forge-teal">{avatarMessage}</p>
        )}

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {profileSummary.map((item) => (
            <StatPill key={item.label} label={item.label} value={item.value} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex flex-col gap-2">
          <h2 className="text-xl font-bold text-ink">Profile Details</h2>
          <p className="text-sm text-slate-muted">
            These fields map directly to your backend user profile.
          </p>
        </div>

        <Form {...form}>
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Avery Johnson" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-2">
                <label className="text-sm font-medium text-ink">Email</label>
                <Input value={currentUser?.email ?? ""} disabled readOnly />
                <p className="text-xs text-slate-muted">
                  Email changes are not exposed by the current API.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" placeholder="24" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Gender</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={unspecifiedGenderValue}>
                          Prefer not to say
                        </SelectItem>
                        {GENDER_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <AddressAutocomplete
                        label="City"
                        placeholder="Search your city or area..."
                        value={
                          field.value
                            ? {
                                address: field.value,
                                city: field.value,
                                lat: locationLat,
                                lng: locationLng,
                              }
                            : null
                        }
                        onLocationSelect={(location) => {
                          field.onChange(location?.city ?? "");
                          form.setValue("locationLat", location?.lat ?? null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                          form.setValue("locationLng", location?.lng ?? null, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="locationLat"
                render={({ field }) => (
                  <input type="hidden" value={field.value ?? ""} readOnly />
                )}
              />
              <FormField
                control={form.control}
                name="locationLng"
                render={({ field }) => (
                  <input type="hidden" value={field.value ?? ""} readOnly />
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="A quick intro people will see on your profile."
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-ink shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-thick focus-visible:ring-ring/50"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(saveMessage || saveError) && (
              <p
                className={`text-sm ${saveError ? "text-destructive" : "text-forge-teal"}`}
              >
                {saveError ?? saveMessage}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-border/70 pt-5 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-muted">
                Save your backend-backed profile changes here.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link {...buildProfileNavigation()}>View Profile</Link>
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </section>
    </>
  );
}

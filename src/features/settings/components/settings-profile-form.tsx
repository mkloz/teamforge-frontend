import { Link } from "@tanstack/react-router";

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
import type { User } from "@/shared/schemas";
import type { UseFormReturn } from "react-hook-form";
import type { SettingsProfileValues } from "../schemas/settings-profile.schema";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Other" },
] as const;

function normalizeTrustScore(score: number) {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

interface SettingsProfileFormProps {
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

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined | null;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-canvas px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        {value ?? "Not set"}
      </p>
    </div>
  );
}

export function SettingsProfileForm({
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
}: SettingsProfileFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-18 w-18 items-center justify-center overflow-hidden rounded-full border border-border bg-canvas text-lg font-bold text-forge-teal">
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                currentUser?.name
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((part) => part[0]?.toUpperCase())
                  .join("") || "TF"
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold text-ink">Account Snapshot</h2>
              <p className="mt-1 text-sm text-slate-muted">
                Keep your profile accurate before backend integration expands
                the rest of settings.
              </p>
            </div>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-ink">
            Update photo
            <Input
              type="file"
              accept="image/*"
              className="max-w-72 cursor-pointer"
              disabled={isUploadingAvatar}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) {
                  return;
                }

                void onAvatarSelect(file).finally(() => {
                  event.target.value = "";
                });
              }}
            />
          </label>
        </div>

        {(avatarMessage || avatarError) && (
          <p
            className={`mt-4 text-sm ${avatarError ? "text-destructive" : "text-forge-teal"}`}
          >
            {avatarError ?? avatarMessage}
          </p>
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
                        <SelectItem value="">Prefer not to say</SelectItem>
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
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="London" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
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
                Personality type and interests are still sourced from your
                onboarding and profile data.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline">
                  <Link to="/profile">View Profile</Link>
                </Button>
                <Button type="submit" variant="primary" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-ink">
              Matching Preferences Snapshot
            </h2>
            <p className="mt-1 text-sm text-slate-muted">
              This reflects what the compatibility engine already knows about
              you.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatPill
              label="Personality Type"
              value={currentUser?.personalityType ?? "Not set"}
            />
            <StatPill
              label="Trust Score"
              value={
                currentUser
                  ? `${normalizeTrustScore(currentUser.trustScore)}%`
                  : "0%"
              }
            />
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-muted">
            Interests
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {currentUser?.interests?.length ? (
              currentUser.interests.slice(0, 12).map((interest) => (
                <span
                  key={interest.id}
                  className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-3 py-1 text-xs font-semibold text-forge-teal"
                >
                  {interest.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-muted">
                No interests have been saved yet.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

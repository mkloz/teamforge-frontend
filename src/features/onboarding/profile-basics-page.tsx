import { motion } from "framer-motion";
import { ShieldCheck, UserRound } from "lucide-react";
import { useRef } from "react";

import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { TopProgressBar } from "@/shared/components/common/top-progress-bar";
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
import { useProfileBasicsForm } from "@/features/onboarding/hooks/use-profile-basics-form";
import { useScrollToTop } from "@/shared/hooks/use-scroll-to-top";

const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "NON_BINARY", label: "Non-binary" },
  { value: "OTHER", label: "Prefer not to say" },
] as const;

export function ProfileBasicsPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { form, watchedValues, progress, saveError, isSaving, onSubmit } =
    useProfileBasicsForm();

  useScrollToTop(["profile-basics"], scrollContainerRef);

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden">
      <div className="flex-1 relative flex flex-col h-full overflow-hidden">
        <BackgroundTexture />

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative h-full scroll-smooth"
        >
          <TopProgressBar progress={progress} />

          <main className="relative z-10 flex min-h-full items-center justify-center px-4 py-12 sm:px-6">
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
                    Google gave us your sign-in. TeamForge still needs the
                    basics that make local groups work.
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={onSubmit} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-ink">
                            Age
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              inputMode="numeric"
                              placeholder="22"
                              className="h-11 rounded-xl bg-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage className="text-xs font-medium" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-ink">
                            Gender
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl bg-white">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent
                              position="popper"
                              className="rounded-xl border-border bg-white shadow-lg shadow-black/5"
                            >
                              {GENDER_OPTIONS.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  className="rounded-lg"
                                >
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs font-medium" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <AddressAutocomplete
                            label="City"
                            required
                            placeholder="Search your city or area..."
                            value={
                              field.value
                                ? {
                                    address: field.value,
                                    city: field.value,
                                    lat: watchedValues.locationLat ?? null,
                                    lng: watchedValues.locationLng ?? null,
                                  }
                                : null
                            }
                            onLocationSelect={(location) => {
                              field.onChange(location?.city ?? "");
                              form.setValue(
                                "locationLat",
                                location?.lat ?? null,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                },
                              );
                              form.setValue(
                                "locationLng",
                                location?.lng ?? null,
                                {
                                  shouldDirty: true,
                                  shouldValidate: true,
                                },
                              );
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs font-medium" />
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

                  <div className="flex items-start gap-3 rounded-2xl border border-forge-teal/15 bg-forge-teal/5 p-4 text-sm leading-6 text-slate-muted">
                    <ShieldCheck
                      size={18}
                      strokeWidth={1.5}
                      className="mt-0.5 shrink-0 text-forge-teal"
                    />
                    <p>
                      Age and city help us form groups that make sense in real
                      life. Gender stays on your profile and does not affect
                      group compatibility.
                    </p>
                  </div>

                  {saveError ? (
                    <p className="text-sm font-medium text-destructive">
                      {saveError}
                    </p>
                  ) : null}

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    loading={isSaving}
                  >
                    Continue
                  </Button>
                </form>
              </Form>
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}

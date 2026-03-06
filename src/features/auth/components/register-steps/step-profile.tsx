import { ArrowLeft } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { ArrowRightAnimated } from "@/shared/components/common/arrow-right-animated";
import { Button } from "@/shared/components/ui/button";
import {
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
import type { RegisterValues } from "../../schemas/auth-schemas";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "non_binary", label: "Non-binary" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
] as const;

interface StepProfileProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepProfile({ onNext, onBack }: StepProfileProps) {
  const { control } = useFormContext<RegisterValues>();

  return (
    <div className="flex flex-col gap-4">
      {/* Age and Gender Row */}
      <div className="flex flex-row gap-4 w-full">
        {/* Age */}
        <div className="flex-1">
          <FormField
            control={control}
            name="age"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Age
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    className="h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                    placeholder="22"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />
        </div>

        {/* Gender */}
        <div className="flex-1">
          <FormField
            control={control}
            name="gender"
            render={({ field }) => (
              <FormItem className="space-y-0 flex flex-col justify-start">
                <FormLabel className="font-sans text-sm font-semibold text-ink">
                  Gender
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm outline-none focus:border-forge-teal aria-invalid:border-destructive transition-colors duration-200">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position="popper"
                    className="w-full min-w-(--radix-select-trigger-width) rounded-xl border-border shadow-lg shadow-black/5 bg-white"
                  >
                    {GENDER_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="rounded-lg cursor-pointer font-sans text-sm hover:bg-slate-50 transition-colors"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs font-medium text-red-500" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <p className="text-xs text-slate-muted mt-0 text-center">
        Gender is used for your profile only – not part of matching.
      </p>

      {/* City full-width */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem className="space-y-0">
            <FormLabel className="font-sans text-sm font-semibold text-ink">
              City
            </FormLabel>
            <FormControl>
              <Input
                className="h-11 px-3.5 rounded-xl border-border bg-white font-sans text-sm text-ink placeholder:text-slate-muted focus-visible:border-forge-teal transition-colors duration-200"
                placeholder="Kyiv"
                {...field}
              />
            </FormControl>
            <FormMessage className="text-xs font-medium text-red-500" />
          </FormItem>
        )}
      />

      <Button
        type="button"
        onClick={onNext}
        className="w-full h-12 rounded-xl mt-4 text-sm sm:text-base font-semibold group transition-[transform,box-shadow,background-color] duration-200 active:scale-[0.98] shadow-lg shadow-forge-teal/20 hover:shadow-forge-teal/40 hover:-translate-y-0.5 bg-forge-teal text-white hover:bg-teal-500"
      >
        Continue
        <ArrowRightAnimated />
      </Button>

      <Button
        type="button"
        variant="ghost"
        onClick={onBack}
        className="flex items-center justify-center gap-1.5 font-sans text-sm font-medium text-slate-muted hover:text-ink hover:bg-transparent border-0"
      >
        <ArrowLeft size={14} />
        Back
      </Button>
    </div>
  );
}

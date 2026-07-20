import { Flame, UsersRound } from "lucide-react";

import type { ForgeMode } from "@/features/forge/lib/forge-contract";
import { cn } from "@/shared/lib/utils";

interface FormationMethodSectionProps {
  onChange: (value: ForgeMode) => void;
  value: ForgeMode;
}

const FORMATION_METHODS = [
  {
    value: "AUTO",
    label: "TeamForge finds people",
    description: "Keep searching until a group can be proposed.",
    Icon: Flame,
  },
  {
    value: "MANUAL",
    label: "Invite people I know",
    description: "Choose friends and set visibility yourself.",
    Icon: UsersRound,
  },
] as const satisfies ReadonlyArray<{
  description: string;
  Icon: typeof Flame;
  label: string;
  value: ForgeMode;
}>;

export function FormationMethodSection({
  onChange,
  value,
}: FormationMethodSectionProps) {
  return (
    <fieldset className="grid gap-2 border-border/25 border-b pb-4">
      <legend className="font-semibold text-foreground text-sm">
        Who should fill the group?
      </legend>
      <div className="grid max-w-xl gap-2 sm:grid-cols-2">
        {FORMATION_METHODS.map((method) => (
          <FormationMethodOption
            key={method.value}
            checked={value === method.value}
            method={method}
            onChange={onChange}
          />
        ))}
      </div>
    </fieldset>
  );
}

function FormationMethodOption({
  checked,
  method,
  onChange,
}: {
  checked: boolean;
  method: (typeof FORMATION_METHODS)[number];
  onChange: FormationMethodSectionProps["onChange"];
}) {
  const { description, Icon, label, value } = method;

  return (
    <label
      className={cn(
        "grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-2.5 rounded-xl border px-3 py-2.5 transition-colors focus-within:ring-2 focus-within:ring-primary/35",
        checked
          ? "border-forge-teal/55 bg-forge-teal/8 text-forge-teal"
          : "border-border/50 bg-card/60 text-foreground hover:border-forge-teal/30 hover:bg-forge-teal/5",
      )}
    >
      <input
        type="radio"
        name="forge-formation-method"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      <span
        className={cn(
          "mt-0.5 flex size-7 items-center justify-center rounded-full",
          checked ? "bg-forge-teal text-white" : "bg-muted text-slate-muted",
        )}
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-sm leading-5">{label}</span>
        <span className="mt-0.5 block text-muted-foreground text-xs leading-snug">
          {description}
        </span>
      </span>
    </label>
  );
}

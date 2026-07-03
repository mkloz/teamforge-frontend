import type { StepData } from "@/features/download/data/download-install-steps";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

interface InstallStepProps {
  index: number;
  step: StepData;
}

export function InstallStep({ index, step }: InstallStepProps) {
  const StepIcon = step.icon;

  return (
    <li
      className={cn(
        "group flex items-start gap-6 py-9 sm:gap-10",
        step.isAlternative && "opacity-80",
      )}
    >
      <span
        className="shrink-0 select-none font-extrabold text-5xl text-forge-teal/20 tabular-nums leading-none transition-colors duration-200 group-hover:text-forge-teal/40 sm:text-7xl"
        aria-hidden="true"
      >
        {step.isAlternative ? "↳" : index}
      </span>

      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 font-bold text-ink text-lg leading-tight">
          <IconTile
            bordered
            icon={StepIcon}
            shape="circle"
            size="sm"
            tone="teal"
            className="size-6 bg-forge-teal/8"
          />
          <span>{step.title}</span>
        </h3>
        <p className="mt-2 max-w-xl text-pretty text-slate-muted leading-relaxed">
          {step.body}
        </p>
        {step.tip && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-forge-teal/8 px-3 py-1.5 font-medium text-forge-teal text-sm">
            {step.tip}
          </p>
        )}
      </div>
    </li>
  );
}

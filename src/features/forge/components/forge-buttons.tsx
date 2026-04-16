import { Button } from "@/shared/components/ui/button";
import { Cpu, RefreshCw, Sparkles, Zap } from "lucide-react";

interface PrimaryButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

export function PrimaryButton({
  label,
  icon,
  onClick,
  disabled = false,
}: PrimaryButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="primary"
      size="lg"
      className="w-full h-14 rounded-2xl font-bold group shadow-button-primary/20"
    >
      <span className="relative z-10 flex items-center gap-2.5">
        {label}
        {icon && (
          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
            {icon}
          </span>
        )}
      </span>
    </Button>
  );
}

export function ManualForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onClick}
        variant="secondary"
        size="lg"
        aria-label="Forge this group"
        className="w-full h-14 rounded-2xl font-bold group shadow-button-secondary/30"
      >
        <Zap
          size={18}
          aria-hidden="true"
          className="fill-current group-hover:scale-110 transition-transform"
        />
        <span>Forge group</span>
        <Sparkles size={14} className="opacity-60" />
      </Button>
    </div>
  );
}

export function AutoForgeButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="space-y-4">
      <Button
        onClick={onClick}
        variant="primary"
        size="lg"
        aria-label="Auto-forge with algorithm"
        className="w-full h-14 rounded-2xl font-bold group shadow-button-primary/20"
      >
        <Cpu
          size={18}
          aria-hidden="true"
          className="shrink-0 group-hover:rotate-12 transition-transform"
        />
        <span className="truncate">
          <span className="sm:hidden">Auto-forge</span>
          <span className="hidden sm:inline">Auto-forge with algorithm</span>
        </span>
        <Sparkles
          size={14}
          aria-hidden="true"
          className="shrink-0 opacity-80 animate-pulse"
        />
      </Button>
    </div>
  );
}

export function ReforgeButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="secondary"
      size="lg"
      className="w-full h-14 rounded-2xl font-bold group shadow-button-secondary/30"
    >
      <RefreshCw
        size={15}
        className="group-hover:rotate-180 transition-transform duration-500"
      />
      Try again
    </Button>
  );
}

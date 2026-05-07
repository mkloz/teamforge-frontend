import { Button } from "@/shared/components/ui/button";
import { ArrowRight, Cpu, Network, RefreshCw, UsersRound } from "lucide-react";

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
      className="h-14 w-full rounded-xl font-bold"
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
        className="h-14 w-full rounded-xl font-bold"
      >
        <UsersRound
          size={18}
          aria-hidden="true"
          className="transition-transform group-hover:scale-110"
        />
        <span>Forge group</span>
        <ArrowRight size={14} className="opacity-70" />
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
        className="h-14 w-full rounded-xl font-bold"
      >
        <Cpu
          size={18}
          aria-hidden="true"
          className="shrink-0 transition-transform group-hover:rotate-12"
        />
        <span className="truncate">
          <span className="sm:hidden">Auto-forge</span>
          <span className="hidden sm:inline">Auto-forge with algorithm</span>
        </span>
        <Network size={14} aria-hidden="true" className="shrink-0 opacity-80" />
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
      className="h-14 w-full rounded-xl font-bold"
    >
      <RefreshCw
        size={15}
        className="transition-transform duration-500 group-hover:rotate-180"
      />
      Try again
    </Button>
  );
}

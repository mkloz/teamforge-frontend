import {
  ArrowRight,
  Flame,
  Network,
  RefreshCw,
  UsersRound,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";

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
      className="h-14 w-full"
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

export function ManualForgeButton({
  disabled = false,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="secondary"
        size="lg"
        aria-label="Forge this group"
        className="h-14 w-full"
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

export function AutoForgeButton({
  disabled = false,
  label = "Forge my group",
  onClick,
}: {
  disabled?: boolean;
  label?: string;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <Button
        onClick={onClick}
        disabled={disabled}
        variant="primary"
        size="lg"
        aria-label={label}
        className="h-14 w-full"
      >
        <Flame
          size={18}
          aria-hidden="true"
          className="shrink-0 transition-transform group-hover:rotate-12"
        />
        <span className="truncate">
          <span>{label}</span>
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
      className="h-14 w-full"
    >
      <RefreshCw
        size={15}
        className="transition-transform duration-500 group-hover:rotate-180"
      />
      Try again
    </Button>
  );
}

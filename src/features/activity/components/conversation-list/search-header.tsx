import { Search } from "lucide-react";
import { Input } from "@/shared/components/ui/input";

interface SearchHeaderProps {
  opacity: number;
  isEnabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
}

export function SearchHeader({
  opacity,
  isEnabled,
  placeholder = "Search conversations...",
  value,
  onChange,
}: SearchHeaderProps) {
  return (
    <div
      className="px-4 pt-2.5 pb-0.5 transition-opacity duration-75"
      style={{
        opacity,
        pointerEvents: isEnabled ? "auto" : "none",
      }}
    >
      <div>
        <Input
          type="search"
          name="activity-conversation-search"
          aria-label="Search conversations"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          leftIcon={<Search size={15} />}
        />
      </div>
    </div>
  );
}

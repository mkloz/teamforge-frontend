import { Search } from "lucide-react";
import { memo } from "react";
import { Input } from "@/shared/components/ui/input";

interface SearchHeaderProps {
  opacity: number;
  isEnabled: boolean;
  value: string;
  onChange: (val: string) => void;
}

export const SearchHeader = memo(function SearchHeader({
  opacity,
  isEnabled,
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
          placeholder="Search conversations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          leftIcon={<Search size={15} />}
        />
      </div>
    </div>
  );
});

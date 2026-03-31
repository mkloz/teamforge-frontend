import { Input } from "@/shared/components/ui/input";
import { Search } from "lucide-react";
import { memo } from "react";

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
      className="px-4 pt-3 pb-2 transition-opacity duration-75"
      style={{
        opacity,
        pointerEvents: isEnabled ? "auto" : "none",
      }}
    >
      <div className="relative group">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 transition-colors duration-300 pointer-events-none z-10 group-focus-within:text-forge-teal"
        />
        <Input
          type="search"
          placeholder="Search conversations..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 bg-muted/40 border-transparent focus:bg-background focus:border-border transition-colors rounded-xl h-9"
        />
      </div>
    </div>
  );
});

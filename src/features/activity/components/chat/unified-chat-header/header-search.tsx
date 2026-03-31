import { Search } from "lucide-react";
import { forwardRef } from "react";

interface HeaderSearchProps {
  query: string;
  setQuery: (query: string) => void;
}

export const HeaderSearch = forwardRef<HTMLInputElement, HeaderSearchProps>(
  ({ query, setQuery }, ref) => (
    <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
      <Search size={16} className="text-forge-teal shrink-0 ml-1" />
      <input
        ref={ref}
        type="text"
        placeholder="Search in conversation..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-muted/60 text-ink"
      />
    </div>
  ),
);

HeaderSearch.displayName = "HeaderSearch";

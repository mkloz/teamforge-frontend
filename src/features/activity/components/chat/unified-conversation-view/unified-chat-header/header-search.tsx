import { Search } from "lucide-react";
import type { Ref } from "react";

interface HeaderSearchProps {
  query: string;
  setQuery: (query: string) => void;
  ref?: Ref<HTMLInputElement>;
}

export function HeaderSearch({ query, setQuery, ref }: HeaderSearchProps) {
  return (
    <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
      <Search size={16} className="text-forge-teal shrink-0 ml-1" />
      <input
        ref={ref}
        type="text"
        placeholder="Search in conversation..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-slate-muted/60 text-ink"
      />
    </div>
  );
}

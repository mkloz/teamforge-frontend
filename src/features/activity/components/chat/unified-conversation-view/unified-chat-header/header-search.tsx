import { Search } from "lucide-react";
import type { Ref } from "react";

import { Input } from "@/shared/components/ui/input";

interface HeaderSearchProps {
  query: string;
  setQuery: (query: string) => void;
  ref?: Ref<HTMLInputElement>;
}

export function HeaderSearch({ query, setQuery, ref }: HeaderSearchProps) {
  return (
    <div className="fade-in slide-in-from-left-2 flex flex-1 animate-in items-center gap-2 duration-300">
      <Input
        ref={ref}
        type="text"
        placeholder="Search in conversation..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        leftIcon={<Search size={16} />}
      />
    </div>
  );
}

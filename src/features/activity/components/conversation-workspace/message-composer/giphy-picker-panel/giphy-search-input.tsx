import { Search } from "lucide-react";

export function GiphySearchInput({
  search,
  onSearchChange,
}: {
  search: string;
  onSearchChange: (value: string) => void;
}) {
  return (
    <div className="border-border/50 border-b px-2 py-1.5">
      <label className="relative block">
        <span className="sr-only">Search GIFs</span>
        <Search className="absolute top-1/2 left-1.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search GIFs"
          className="h-8 w-full border-0 bg-transparent pr-2 pl-7 font-semibold text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus-visible:ring-0 [@media(pointer:coarse)]:text-base!"
        />
      </label>
    </div>
  );
}

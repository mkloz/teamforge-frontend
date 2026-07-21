import { Search } from "lucide-react";
import { type ChangeEvent, use, useState } from "react";

import { cn } from "@/shared/lib/utils";

import {
  chunkReactionEmojis,
  getFilteredReactionGroups,
  getSuggestedReactionEmojis,
  type ReactionEmoji,
  type ReactionEmojiGroup,
} from "./reaction-emojis";
import { SelectedEmojiContext } from "./selected-emoji-context";

const EMOJI_PICKER_ROOT_COMPACT_CLASS =
  "w-full overflow-hidden rounded-lg bg-transparent font-sans text-ink shadow-none";

export function CompactReactionEmojiPicker({
  onSelect,
  suggestedEmojis,
}: {
  onSelect: (emoji: string) => void;
  suggestedEmojis: readonly string[];
}) {
  const [search, setSearch] = useState("");
  const suggestedReactionEmojis = getSuggestedReactionEmojis(suggestedEmojis);
  const reactionGroups = getFilteredReactionGroups(
    search,
    suggestedReactionEmojis,
  );

  return (
    <div className={EMOJI_PICKER_ROOT_COMPACT_CLASS}>
      <CompactReactionSearch search={search} onSearchChange={setSearch} />
      <CompactReactionResults
        reactionGroups={reactionGroups}
        onSelect={onSelect}
      />
    </div>
  );
}

function CompactReactionSearch({
  onSearchChange,
  search,
}: {
  onSearchChange: (search: string) => void;
  search: string;
}) {
  return (
    <div className="flex items-center gap-1.5 border-border/55 border-b px-2 pt-1.5 pb-0">
      <div className="relative min-w-0 flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-1.5 size-3.5 -translate-y-1/2 text-slate-muted"
          aria-hidden="true"
          strokeWidth={2}
        />
        <input
          type="search"
          name="emoji-search"
          aria-label="Search emoji"
          value={search}
          className="h-8 w-full border-0 bg-transparent pr-2 pl-7 font-bold text-ink text-xs outline-none transition-colors placeholder:text-slate-muted/70 focus-visible:ring-0"
          placeholder="Search emoji"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onSearchChange(event.target.value)
          }
        />
      </div>
    </div>
  );
}

function CompactReactionResults({
  onSelect,
  reactionGroups,
}: {
  onSelect: (emoji: string) => void;
  reactionGroups: ReactionEmojiGroup[];
}) {
  return (
    <div
      className={cn(
        "scrollbar-hide snap-y snap-mandatory scroll-pt-5 overflow-y-auto px-1 py-0",
        "h-40",
      )}
    >
      {reactionGroups.length > 0 ? (
        reactionGroups.map((group) => (
          <CompactReactionEmojiGroup
            key={group.title}
            group={group}
            onSelect={onSelect}
          />
        ))
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center font-semibold text-slate-muted text-xs">
          No emoji found.
        </div>
      )}
    </div>
  );
}

function CompactReactionEmojiGroup({
  group,
  onSelect,
}: {
  group: ReactionEmojiGroup;
  onSelect: (emoji: string) => void;
}) {
  const selectedEmojis = use(SelectedEmojiContext);

  return (
    <section>
      <div className="sticky -top-px z-10 flex h-6 snap-start items-center bg-popover/97 px-2 font-black text-slate-muted text-xs backdrop-blur-md">
        {group.title}
      </div>
      <div>
        {chunkReactionEmojis(group.emojis).map((row) => (
          <CompactReactionEmojiRow
            key={`${group.title}-${row.map((emoji) => emoji.emoji).join("")}`}
            groupTitle={group.title}
            onSelect={onSelect}
            row={row}
            selectedEmojis={selectedEmojis}
          />
        ))}
      </div>
    </section>
  );
}

function CompactReactionEmojiRow({
  groupTitle,
  onSelect,
  row,
  selectedEmojis,
}: {
  groupTitle: string;
  onSelect: (emoji: string) => void;
  row: readonly ReactionEmoji[];
  selectedEmojis: readonly string[];
}) {
  return (
    <div className="grid h-8 snap-start grid-cols-8 gap-0.5 px-1">
      {row.map((emoji) => (
        <CompactReactionEmojiButton
          key={`${groupTitle}-${emoji.emoji}-${emoji.label}`}
          emoji={emoji}
          isSelected={selectedEmojis.includes(emoji.emoji)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function CompactReactionEmojiButton({
  emoji,
  isSelected,
  onSelect,
}: {
  emoji: ReactionEmoji;
  isSelected: boolean;
  onSelect: (emoji: string) => void;
}) {
  return (
    <button
      type="button"
      aria-label={`Use ${emoji.label}`}
      aria-pressed={isSelected}
      className={cn(
        "flex size-7 min-w-0 items-center justify-center self-center justify-self-center rounded-md text-base leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/18",
        isSelected
          ? "bg-accent/18 shadow-sm ring-1 ring-accent/45 hover:bg-accent/22"
          : "hover:bg-primary/10",
      )}
      title={emoji.label}
      onClick={() => onSelect(emoji.emoji)}
    >
      <span aria-hidden="true">{emoji.emoji}</span>
    </button>
  );
}

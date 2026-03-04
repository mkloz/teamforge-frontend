import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Info,
  Lock,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { TeamForgeLogo } from "@/assets/logo";
import { BackgroundTexture } from "@/shared/components/common/background-texture";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { VoronoiCatalyst } from "./auth/components/voronoi-catalyst";
import { staggerContainer, fadeUpItem } from "./constants/motion";
import { InterestCategorySection } from "./components/interest-category-section";
import { InterestChip } from "./components/interest-chip";
import {
  ALL_INTERESTS_BY_ID,
  INTEREST_CATEGORIES,
  MBTI_SUGGESTIONS,
  MIN_INTERESTS,
  MAX_INTERESTS,
} from "./data/interests-data";

// ─── Max-limit nudge toast ────────────────────────────────────────────────────

function MaxNudge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1C1C1A] text-white rounded-full px-4 py-2.5 shadow-xl font-sans text-xs font-medium pointer-events-none"
        >
          <Info size={13} strokeWidth={2} className="text-amber-400 shrink-0" />
          You&apos;ve reached the maximum of {MAX_INTERESTS} interests. Remove
          one to add another.
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Selection tray (selected chips above footer) ─────────────────────────────

function SelectionTray({
  selected,
  onRemove,
}: {
  selected: Set<string>;
  onRemove: (id: string) => void;
}) {
  if (selected.size === 0) return null;
  const items = [...selected]
    .map((id) => ALL_INTERESTS_BY_ID[id])
    .filter(Boolean);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm"
    >
      <div className="max-w-lg mx-auto px-4 py-2.5 flex flex-col gap-1.5">
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
          Selected
        </p>
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <motion.button
              key={item.id}
              layout
              type="button"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => onRemove(item.id)}
              className="inline-flex items-center gap-1.5 rounded-full bg-forge-teal/10 text-forge-teal border border-forge-teal/20 px-2.5 py-1 font-sans text-[11px] font-medium hover:bg-forge-teal/20 transition-colors"
              aria-label={`Remove ${item.label}`}
            >
              <span aria-hidden="true">{item.emoji}</span>
              {item.label}
              <X size={9} strokeWidth={3} className="opacity-60" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Footer with progress bar + CTA ──────────────────────────────────────────

function SelectionFooter({
  count,
  onContinue,
}: {
  count: number;
  onContinue: () => void;
}) {
  const pct = Math.min((count / MIN_INTERESTS) * 100, 100);
  const ready = count >= MIN_INTERESTS;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-lg mx-auto px-4 pt-2.5 pb-5 flex flex-col gap-2.5">
        {/* Progress track */}
        <div className="flex items-center justify-between">
          <span className="font-sans text-xs text-slate-500">
            {count < MIN_INTERESTS ? (
              <>
                Select{" "}
                <span className="font-semibold text-[#1C1C1A]">
                  {MIN_INTERESTS - count} more
                </span>{" "}
                to continue
              </>
            ) : (
              <span className="font-semibold text-forge-teal">
                {count} selected — looking good
              </span>
            )}
          </span>
          <span className="font-sans text-xs text-slate-400">
            {count}/{MAX_INTERESTS}
          </span>
        </div>

        <div className="relative w-full h-1 rounded-full bg-slate-100 overflow-hidden">
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className={cn(
              "absolute top-0 left-0 h-full rounded-full",
              ready ? "bg-forge-teal" : "bg-forge-teal/40",
            )}
          />
        </div>

        <Button
          size="lg"
          disabled={!ready}
          onClick={onContinue}
          className={cn(
            "w-full flex items-center justify-center gap-2 font-sans text-sm font-semibold rounded-xl h-12 transition-all duration-200 active:scale-[0.98]",
            ready
              ? "bg-forge-teal text-white hover:bg-forge-teal/90 shadow-[0_4px_16px_rgba(13,148,136,0.25)] hover:shadow-[0_8px_24px_rgba(13,148,136,0.35)]"
              : "bg-slate-100 text-slate-400 cursor-not-allowed",
          )}
        >
          Continue
          <ArrowRight size={16} strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}

// ─── Category filter tabs ─────────────────────────────────────────────────────

function CategoryTabs({
  activeId,
  onSelect,
  selectedCounts,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
  selectedCounts: Record<string, number>;
}) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "shrink-0 inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold font-sans transition-colors duration-150",
          activeId === null
            ? "bg-forge-teal text-white"
            : "bg-slate-100 text-slate-600 hover:bg-slate-200",
        )}
      >
        All
      </button>
      {INTEREST_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id === activeId ? null : cat.id)}
          className={cn(
            "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-sans transition-colors duration-150",
            activeId === cat.id
              ? "bg-forge-teal text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200",
          )}
        >
          {cat.label}
          {selectedCounts[cat.id] > 0 && (
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-full w-4 h-4 text-[9px] font-bold leading-none",
                activeId === cat.id
                  ? "bg-white/25 text-white"
                  : "bg-forge-teal text-white",
              )}
            >
              {selectedCounts[cat.id]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Suggested section ────────────────────────────────────────────────────────

function SuggestedSection({
  suggestedIds,
  selected,
  atMax,
  onToggle,
}: {
  suggestedIds: string[];
  selected: Set<string>;
  atMax: boolean;
  onToggle: (id: string) => void;
}) {
  const items = suggestedIds
    .map((id) => ALL_INTERESTS_BY_ID[id])
    .filter(Boolean);

  if (items.length === 0) return null;

  return (
    <motion.div variants={fadeUpItem} className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400/15">
          <Sparkles size={11} className="text-amber-500" strokeWidth={2} />
        </div>
        <h3 className="font-sans text-sm font-semibold text-[#1C1C1A] leading-none">
          Suggested for you
        </h3>
        <span className="font-sans text-xs text-slate-400 leading-none">
          based on your personality result
        </span>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <InterestChip
            key={item.id}
            item={item}
            selected={selected.has(item.id)}
            disabled={atMax}
            onToggle={onToggle}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-200 my-1" />
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function InterestsPage() {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [showMaxNudge, setShowMaxNudge] = useState(false);
  const nudgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read MBTI type from sessionStorage (set after personality test)
  const mbtiType =
    typeof window !== "undefined"
      ? (sessionStorage.getItem("tf_personality_type") ?? "")
      : "";
  const suggestedIds: string[] = MBTI_SUGGESTIONS[mbtiType] ?? [];

  const atMax = selected.size >= MAX_INTERESTS;

  const handleToggle = useCallback(
    (id: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (atMax) {
          // Show nudge toast instead of silently doing nothing
          if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
          setShowMaxNudge(true);
          nudgeTimerRef.current = setTimeout(() => setShowMaxNudge(false), 2800);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [atMax],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (nudgeTimerRef.current) clearTimeout(nudgeTimerRef.current);
    };
  }, []);

  const handleContinue = () => {
    // TODO: persist selected interests, then navigate
    window.location.href = "/onboarding/location";
  };

  // Filtered categories by search + active tab
  const visibleCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return INTEREST_CATEGORIES.filter((cat) => {
      if (activeCategoryId && cat.id !== activeCategoryId) return false;
      if (!q) return true;
      return cat.items.some((item) => item.label.toLowerCase().includes(q));
    }).map((cat) => ({
      ...cat,
      items: q
        ? cat.items.filter((item) => item.label.toLowerCase().includes(q))
        : cat.items,
    }));
  }, [searchQuery, activeCategoryId]);

  // Per-category selected counts for tab badges
  const selectedCounts = useMemo<Record<string, number>>(
    () =>
      INTEREST_CATEGORIES.reduce(
        (acc, cat) => ({
          ...acc,
          [cat.id]: cat.items.filter((i) => selected.has(i.id)).length,
        }),
        {},
      ),
    [selected],
  );

  const progress = Math.min(selected.size / MIN_INTERESTS, 1);

  return (
    <div className="h-screen w-full max-h-dvh flex flex-col lg:flex-row relative overflow-hidden bg-canvas lg:bg-white">
      {/* Max-limit nudge toast */}
      <MaxNudge visible={showMaxNudge} />

      {/* ── Left / form side ── */}
      <div className="flex-1 relative h-full flex flex-col overflow-hidden">
        <BackgroundTexture />

        {/* Top accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] bg-forge-teal z-10"
          aria-hidden="true"
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pt-8 pb-0">
          <div className="max-w-lg mx-auto w-full">
            {/* Header */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-0 mb-6"
            >
              <motion.div variants={fadeUpItem}>
                <TeamForgeLogo
                  className="w-8 h-8 mb-5 mx-auto"
                  showBackground={false}
                />
              </motion.div>

              <motion.p
                variants={fadeUpItem}
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] mb-3 text-forge-teal text-center"
              >
                Step 2 of 3 · Interests
              </motion.p>

              <motion.h1
                variants={fadeUpItem}
                className="font-sans text-2xl md:text-3xl font-extrabold leading-tight text-balance mb-2 text-[#1C1C1A] text-center"
              >
                What do you love doing?
              </motion.h1>

              <motion.p
                variants={fadeUpItem}
                className="font-sans text-sm leading-relaxed text-pretty text-slate-500 text-center mb-3"
              >
                Pick at least {MIN_INTERESTS} things you genuinely enjoy. These
                shape every group you get matched into — so be honest, not
                aspirational.
              </motion.p>

              {/* Privacy note */}
              <motion.div
                variants={fadeUpItem}
                className="flex items-center justify-center gap-1.5 mb-5"
              >
                <Lock size={11} strokeWidth={2} className="text-slate-400 shrink-0" />
                <p className="font-sans text-[11px] text-slate-400">
                  Used only for matching. Never shared with other users.
                </p>
              </motion.div>

              {/* Search */}
              <motion.div variants={fadeUpItem} className="relative mb-3.5">
                <Search
                  size={15}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  strokeWidth={2}
                />
                <input
                  type="text"
                  placeholder="Search interests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full font-sans text-sm rounded-xl border border-slate-200 bg-white pl-9 pr-9 py-2.5 text-[#1C1C1A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forge-teal/30 focus:border-forge-teal/60 transition-shadow duration-150"
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.1 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label="Clear search"
                    >
                      <X size={14} strokeWidth={2} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Category filter tabs */}
              <motion.div variants={fadeUpItem}>
                <CategoryTabs
                  activeId={activeCategoryId}
                  onSelect={setActiveCategoryId}
                  selectedCounts={selectedCounts}
                />
              </motion.div>
            </motion.div>

            {/* Content area */}
            <AnimatePresence mode="wait">
              {visibleCategories.length > 0 ? (
                <motion.div
                  key={`${activeCategoryId}-${searchQuery}`}
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-6 pb-4"
                >
                  {/* Suggested section — only show when no filter/search active */}
                  {!searchQuery && !activeCategoryId && suggestedIds.length > 0 && (
                    <SuggestedSection
                      suggestedIds={suggestedIds}
                      selected={selected}
                      atMax={atMax}
                      onToggle={handleToggle}
                    />
                  )}

                  {visibleCategories.map((cat) => (
                    <InterestCategorySection
                      key={cat.id}
                      category={cat}
                      selected={selected}
                      atMax={atMax}
                      onToggle={handleToggle}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 py-16 text-center"
                >
                  <Search size={32} className="text-slate-300" strokeWidth={1.5} />
                  <p className="font-sans text-sm text-slate-400">
                    No interests found for{" "}
                    <span className="font-medium text-slate-500">
                      &ldquo;{searchQuery}&rdquo;
                    </span>
                  </p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="font-sans text-xs text-forge-teal hover:underline"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Selection tray + sticky footer */}
        <AnimatePresence>
          {selected.size > 0 && (
            <SelectionTray selected={selected} onRemove={handleToggle} />
          )}
        </AnimatePresence>
        <SelectionFooter count={selected.size} onContinue={handleContinue} />
      </div>

      {/* ── Right / animation side (desktop only) ── */}
      <div className="hidden lg:flex flex-1 relative bg-hero-bg border-l border-slate-200 items-center justify-center overflow-hidden h-full">
        <VoronoiCatalyst progress={progress} isTyping={false} />
      </div>
    </div>
  );
}

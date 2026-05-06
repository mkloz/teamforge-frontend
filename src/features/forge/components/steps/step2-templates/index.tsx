import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate, Tag } from "lucide-react";

import { buildTemplateSuggestions } from "@/features/forge/lib/forge-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";

import { StartBlankTemplateButton } from "./start-blank-template-button";
import { TemplatePaginationControls } from "./template-pagination-controls";
import { TemplateSuggestionCard } from "./template-suggestion-card";
import type { Step2TemplatesProps } from "./types";
import { useTemplatePagination } from "./use-template-pagination";

export function Step2Templates({
  appliedTemplateId,
  selectedActivity,
  onStartBlank,
  onTemplateToggle,
}: Step2TemplatesProps) {
  const { data: currentUser, isPending: isCurrentUserPending } = useQuery(
    currentUserQueryOptions(),
  );
  const suggestions = isCurrentUserPending
    ? []
    : buildTemplateSuggestions(selectedActivity, currentUser);
  const {
    canPage,
    showNextPage,
    showPreviousPage,
    visibleItems: visibleSuggestions,
  } = useTemplatePagination({
    items: suggestions,
    selectedActivity,
  });

  return (
    <div className="flex flex-col gap-4 pb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-forge-teal/10 text-forge-teal">
            <LayoutTemplate size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="text-sm font-semibold leading-tight text-foreground">
                Start from a template
              </p>
              {selectedActivity && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border/45 bg-card px-2 py-0.5 text-micro font-bold text-muted-foreground">
                  <Tag size={10} />
                  <span className="truncate">{selectedActivity}</span>
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-snug text-muted-foreground/65">
              Sorted for your profile inside this category.
            </p>
          </div>
        </div>

        <TemplatePaginationControls
          canPage={canPage}
          onNext={showNextPage}
          onPrevious={showPreviousPage}
        />
      </div>

      {isCurrentUserPending ? (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              className="h-24 rounded-lg border border-border/35 bg-card/70"
            >
              <div className="h-full animate-pulse bg-muted/25" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {visibleSuggestions.map((suggestion) => (
            <TemplateSuggestionCard
              key={suggestion.id}
              active={appliedTemplateId === suggestion.id}
              onTemplateToggle={onTemplateToggle}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}

      <StartBlankTemplateButton onStartBlank={onStartBlank} />
    </div>
  );
}

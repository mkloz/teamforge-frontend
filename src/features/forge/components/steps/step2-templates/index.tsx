import { useQuery } from "@tanstack/react-query";
import { LayoutTemplate, Tag } from "lucide-react";

import { buildTemplateSuggestions } from "@/features/forge/lib/forge-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";

import { StartBlankTemplateButton } from "./start-blank-template-button";
import { TemplatePaginationControls } from "./template-pagination-controls";
import { TemplateSuggestionCard } from "./template-suggestion-card";
import { TemplateSuggestionsSkeleton } from "./template-suggestions-skeleton";
import type { Step2TemplatesProps } from "./types";
import { useTemplatePagination } from "./use-template-pagination";

export function Step2Templates({
  appliedTemplateId,
  selectedActivity,
  onStartBlank,
  onTemplateSelect,
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
    <div className="flex flex-col gap-4 pb-6">
      <div className="flex items-start justify-between gap-3 px-0.5">
        <div className="flex min-w-0 items-start gap-3">
          <IconTile icon={LayoutTemplate} size="md" tone="teal" />
          <div className="min-w-0">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <p className="font-semibold text-foreground text-sm leading-tight">
                Start from a template
              </p>
              {selectedActivity && (
                <StatusPill
                  icon={Tag}
                  size="xs"
                  tone="neutral"
                  className="max-w-full border-border/45 bg-card px-2 py-0.5 text-micro"
                >
                  <span className="truncate">{selectedActivity}</span>
                </StatusPill>
              )}
            </div>
            <p className="mt-1 text-muted-foreground/65 text-xs leading-snug">
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
        <TemplateSuggestionsSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {visibleSuggestions.map((suggestion) => (
            <TemplateSuggestionCard
              key={suggestion.id}
              active={appliedTemplateId === suggestion.id}
              onTemplateSelect={onTemplateSelect}
              suggestion={suggestion}
            />
          ))}
        </div>
      )}

      <StartBlankTemplateButton onStartBlank={onStartBlank} />
    </div>
  );
}

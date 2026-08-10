import { useQuery } from "@tanstack/react-query";
import { buildTemplateSuggestions } from "@/features/plan-creation/lib/plan-template-suggestions";
import { currentUserQueryOptions } from "@/shared/api/current-user-query";
import {
  CompactBentoGrid,
  CompactBentoItem,
  getCompactBentoSlot,
} from "@/shared/components/ui/bento-grid";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/shared/components/ui/carousel";
import { IconTile } from "@/shared/components/ui/icon-tile";

import { ICON_MAP } from "../step1-activity/activity-icon-map";
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
    options,
    page,
    pageCount,
    pages,
    setApi,
    showNextPage,
    showPreviousPage,
  } = useTemplatePagination({
    items: suggestions,
    selectedActivity,
  });
  const visibleSuggestions = pages[page] ?? [];
  const CategoryIcon =
    ICON_MAP[visibleSuggestions[0]?.categoryId ?? "fallback"] ??
    ICON_MAP.fallback;

  return (
    <section
      aria-labelledby="template-suggestions-heading"
      className="flex flex-col gap-4 pb-6"
    >
      <div className="relative px-0.5 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <div className="flex min-w-0 items-start gap-3 pr-22 sm:pr-0">
          <IconTile icon={CategoryIcon} size="md" tone="teal" />
          <div className="min-w-0">
            <h3
              id="template-suggestions-heading"
              className="truncate font-semibold text-foreground text-sm leading-tight"
            >
              Start from a template
            </h3>
            <p className="mt-1 text-muted-foreground/65 text-xs leading-snug">
              <span className="sm:hidden">Profile-ranked templates.</span>
              <span className="hidden sm:inline">
                Sorted for your profile inside this category.
              </span>
            </p>
          </div>
        </div>

        <TemplatePaginationControls
          canPage={canPage}
          className="absolute top-0 right-0 sm:static"
          onNext={showNextPage}
          onPrevious={showPreviousPage}
          page={page}
          pageCount={pageCount}
        />
      </div>

      {isCurrentUserPending ? (
        <TemplateSuggestionsSkeleton />
      ) : (
        <Carousel
          aria-label="Profile-ranked templates"
          className="min-w-0"
          key={selectedActivity ?? "all-templates"}
          opts={options}
          setApi={setApi}
        >
          <CarouselContent className="-ml-2.5">
            {pages.map((templatePage, pageIndex) => (
              <CarouselItem
                aria-label={`Template page ${pageIndex + 1} of ${pageCount}`}
                className={
                  canPage
                    ? "basis-[calc(100%-1.5rem)] pl-2.5 sm:basis-full"
                    : "pl-2.5"
                }
                key={
                  templatePage.map((suggestion) => suggestion.id).join(":") ||
                  "empty-template-page"
                }
              >
                <CompactBentoGrid>
                  {templatePage.map((suggestion, index) => {
                    const slot = getCompactBentoSlot(index);

                    return (
                      <CompactBentoItem key={suggestion.id} slot={slot}>
                        <TemplateSuggestionCard
                          active={appliedTemplateId === suggestion.id}
                          onTemplateSelect={onTemplateSelect}
                          slot={slot}
                          suggestion={suggestion}
                        />
                      </CompactBentoItem>
                    );
                  })}
                </CompactBentoGrid>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      )}

      <StartBlankTemplateButton onStartBlank={onStartBlank} />
    </section>
  );
}

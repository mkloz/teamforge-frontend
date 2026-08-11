"use client";

import { AnimatePresence, m } from "framer-motion";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PlanPreview } from "@/features/plan-creation/components/steps/step2-plan/plan-preview";
import type { PlanBuilderState } from "@/features/plan-creation/hooks/use-plan-builder";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/shared/components/ui/drawer";
import { scrollElementIntoView } from "@/shared/lib/browser-scroll";
import { cn } from "@/shared/lib/utils";

import {
  getMobilePlanReviewState,
  type MissingPlanDetail,
  type PlanSectionTarget,
} from "./mobile-plan-review-state";

interface MobilePlanReviewProps {
  fw: PlanBuilderState;
}

export function MobilePlanReview({ fw }: MobilePlanReviewProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showPeek, setShowPeek] = useState(false);
  const hasPeekedRef = useRef(false);
  const hasUserScrolledRef = useRef(false);
  const pendingSectionNavigationRef = useRef<Exclude<
    PlanSectionTarget,
    "previous-step"
  > | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const reviewState = getMobilePlanReviewState(fw);
  const isReady = fw.canAdvanceStep2;
  const title = fw.planName.trim() || "Your plan";

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    function updatePeek(isVisible: boolean) {
      if (isVisible && !hasPeekedRef.current) {
        hasPeekedRef.current = true;
        setShowPeek(true);
        return;
      }

      if (!isVisible && hasPeekedRef.current) {
        setShowPeek(false);
      }
    }

    function handleScroll() {
      hasUserScrolledRef.current = true;
      const bounds = sentinel?.getBoundingClientRect();
      updatePeek(
        Boolean(bounds && bounds.top < window.innerHeight && bounds.bottom > 0),
      );
    }

    if (typeof IntersectionObserver === "function") {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (hasUserScrolledRef.current) {
            updatePeek(entry?.isIntersecting ?? false);
          }
        },
        { threshold: 0.5 },
      );

      observer.observe(sentinel);
      addScrollListeners(handleScroll);
      return () => {
        observer.disconnect();
        removeScrollListeners(handleScroll);
      };
    }

    addScrollListeners(handleScroll);
    return () => removeScrollListeners(handleScroll);
  }, []);

  function openReview() {
    setShowPeek(false);
    setDrawerOpen(true);
  }

  function handleMissingDetail(detail: MissingPlanDetail) {
    if (detail.target === "previous-step") {
      pendingSectionNavigationRef.current = null;
      fw.goBack();
      return;
    }

    pendingSectionNavigationRef.current = detail.target;
  }

  function handleDrawerCloseAutoFocus(event: Event) {
    const target = pendingSectionNavigationRef.current;
    if (!target) {
      return;
    }

    pendingSectionNavigationRef.current = null;
    const navigation = preparePlanSection(target);
    if (!navigation) {
      return;
    }

    event.preventDefault();
    navigation.trigger.focus({ preventScroll: true });
    scrollElementIntoView(navigation.section, {
      intent: "locate",
      block: "start",
    });
  }

  return (
    <>
      <div aria-hidden="true" className="h-28 md:hidden" />
      <div ref={sentinelRef} aria-hidden="true" className="h-px md:hidden" />

      <div className="fixed inset-x-0 bottom-0 z-40 border-border/60 border-t bg-background/95 shadow-2xl backdrop-blur-xl md:hidden">
        <AnimatePresence initial={false}>
          {showPeek ? (
            <m.button
              type="button"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="block w-full overflow-hidden border-border/40 border-b text-left"
              onClick={openReview}
            >
              <span className="mx-auto flex max-w-208 items-center justify-between gap-4 px-4 py-2.5">
                <span className="font-semibold text-foreground text-sm">
                  {getPeekLabel(isReady, reviewState.missingDetails)}
                </span>
                <span className="shrink-0 text-foreground text-xs">
                  {isReady ? "Open preview" : "See details"}
                </span>
              </span>
            </m.button>
          ) : null}
        </AnimatePresence>

        <div className="mx-auto grid max-w-208 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-4 pt-3 pb-safe-bottom">
          <Button
            aria-label="Go back"
            className="size-12 rounded-xl"
            onClick={fw.goBack}
            size="icon"
            variant="outline"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Button>

          <button
            type="button"
            className="flex min-w-0 items-center gap-2.5 rounded-xl text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground"
            onClick={openReview}
          >
            <PlanThumbnail coverImage={fw.coverImage} />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold text-foreground text-sm">
                {title}
              </span>
              <span className="mt-1 flex gap-1" aria-hidden="true">
                {PLAN_SECTION_IDS.map((sectionId, index) => (
                  <span
                    className={cn(
                      "h-1 flex-1 rounded-full",
                      reviewState.readySections[index]
                        ? "bg-brand-teal"
                        : "bg-border",
                    )}
                    key={sectionId}
                  />
                ))}
              </span>
              <span className="mt-1 block text-muted-foreground text-xs">
                {reviewState.readyCount} of 4 ready
              </span>
            </span>
          </button>

          <Button
            aria-label={
              isReady
                ? "Review the completed plan"
                : "Review missing plan details"
            }
            className="h-12 px-4"
            onClick={openReview}
            variant="primary"
          >
            Review
          </Button>
        </div>
      </div>

      <MobilePlanDrawer
        fw={fw}
        isReady={isReady}
        missingDetails={reviewState.missingDetails}
        onCloseAutoFocus={handleDrawerCloseAutoFocus}
        onMissingDetail={handleMissingDetail}
        onOpenChange={setDrawerOpen}
        open={drawerOpen}
      />
    </>
  );
}

function MobilePlanDrawer({
  fw,
  isReady,
  missingDetails,
  onCloseAutoFocus,
  onMissingDetail,
  onOpenChange,
  open,
}: {
  fw: PlanBuilderState;
  isReady: boolean;
  missingDetails: MissingPlanDetail[];
  onCloseAutoFocus: (event: Event) => void;
  onMissingDetail: (detail: MissingPlanDetail) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="max-h-[88dvh] overflow-hidden rounded-t-2xl border-border/50 bg-canvas md:hidden"
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {isReady ? (
          <ReadyPlanReview fw={fw} onOpenChange={onOpenChange} />
        ) : (
          <MissingPlanChecklist
            details={missingDetails}
            onSelect={onMissingDetail}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
}

function MissingPlanChecklist({
  details,
  onSelect,
}: {
  details: MissingPlanDetail[];
  onSelect: (detail: MissingPlanDetail) => void;
}) {
  return (
    <div className="overflow-y-auto px-4 pb-safe-bottom">
      <DrawerHeader className="px-0 pt-3 text-left">
        <DrawerTitle className="text-xl">Finish your plan</DrawerTitle>
        <DrawerDescription>
          {details.length === 1
            ? "One detail needs your attention."
            : `${details.length} details need your attention.`}
        </DrawerDescription>
      </DrawerHeader>

      <div className="border-border/45 border-y">
        {details.map((detail, index) => (
          <DrawerClose asChild key={detail.id}>
            <button
              type="button"
              className="group flex w-full items-center gap-3 border-border/35 border-b py-4 text-left last:border-b-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-foreground focus-visible:ring-inset"
              onClick={() => onSelect(detail)}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border/60 font-semibold text-muted-foreground text-xs group-hover:border-foreground/45 group-hover:text-foreground">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-foreground text-sm">
                  {detail.label}
                </span>
                <span className="mt-0.5 block text-muted-foreground text-xs">
                  {detail.supportingText}
                </span>
              </span>
              <ChevronRight
                aria-hidden="true"
                className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
              />
            </button>
          </DrawerClose>
        ))}
      </div>
    </div>
  );
}

function ReadyPlanReview({
  fw,
  onOpenChange,
}: {
  fw: PlanBuilderState;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <>
      <DrawerHeader className="sr-only">
        <DrawerTitle>Ready to review</DrawerTitle>
        <DrawerDescription>
          Preview the completed plan before continuing.
        </DrawerDescription>
      </DrawerHeader>

      <div className="overflow-y-auto px-4 pt-3">
        <PlanPreview
          activeSection={null}
          className="pb-5"
          coverImage={fw.coverImage}
          groupFormationMode={fw.groupFormationMode}
          groupFormationScope={fw.groupFormationScope}
          locationType={fw.locationType}
          planDate={fw.planDate}
          planDescription={fw.planDescription}
          planLocation={fw.planLocation}
          planName={fw.planName}
          planScheduleMode={fw.planScheduleMode}
          planTime={fw.planTime}
          selectedActivity={fw.selectedActivity}
          variant="drawer"
        />
      </div>

      <div className="grid grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] gap-2 border-border/45 border-t bg-canvas px-4 pt-3 pb-safe-bottom">
        <Button
          className="h-12"
          onClick={() => onOpenChange(false)}
          variant="outline"
        >
          Keep editing
        </Button>
        <Button className="h-12" onClick={fw.goNext} variant="primary">
          {fw.groupFormationMode === "AUTO" ? "Review request" : "Continue"}
          <ChevronRight aria-hidden="true" className="size-4" />
        </Button>
      </div>
    </>
  );
}

function PlanThumbnail({ coverImage }: { coverImage: string | null }) {
  return (
    <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg bg-card text-muted-foreground">
      {coverImage ? (
        <PlanCover
          alt=""
          className="absolute inset-0 size-full"
          imageClassName="size-full object-cover"
          value={coverImage}
        />
      ) : (
        <FileText aria-hidden="true" className="size-4" />
      )}
    </span>
  );
}

function getPeekLabel(isReady: boolean, missingDetails: MissingPlanDetail[]) {
  if (isReady) return "Ready to review";

  if (missingDetails.length === 1) {
    return missingDetails[0]?.label ?? "One detail left";
  }

  return `${missingDetails.length} details left`;
}

interface PlanSectionNavigation {
  section: HTMLElement;
  trigger: HTMLButtonElement;
}

function preparePlanSection(
  target: Exclude<PlanSectionTarget, "previous-step">,
): PlanSectionNavigation | null {
  const section = document.getElementById(target);
  const trigger = section?.querySelector<HTMLButtonElement>(
    "button[aria-expanded]",
  );

  if (!section || !trigger) {
    return null;
  }

  if (trigger.getAttribute("aria-expanded") !== "true") {
    trigger.click();
  }

  return { section, trigger };
}

function addScrollListeners(listener: () => void) {
  window.addEventListener("scroll", listener, { passive: true });
  document.addEventListener("scroll", listener, {
    capture: true,
    passive: true,
  });
}

function removeScrollListeners(listener: () => void) {
  window.removeEventListener("scroll", listener);
  document.removeEventListener("scroll", listener, { capture: true });
}

const PLAN_SECTION_IDS = ["basics", "group", "place", "time"] as const;

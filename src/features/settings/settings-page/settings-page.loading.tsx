import type { SettingsSection } from "@/features/settings/lib/settings-route";
import type { PageLoadingProps } from "@/shared/components/loading/page-loading";
import {
  SkeletonButton,
  SkeletonText,
} from "@/shared/components/loading/skeleton-patterns";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

interface SettingsPageLoadingProps extends PageLoadingProps {
  activeSection?: SettingsSection;
  isMobileDetailOpen?: boolean;
}

export function SettingsPageLoading({
  activeSection = "account",
  isMobileDetailOpen = false,
}: SettingsPageLoadingProps = {}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading settings"
      className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-5 md:px-8 lg:grid-cols-[14rem_minmax(0,56rem)] lg:gap-12 lg:py-10 xl:gap-18"
      role="status"
    >
      <span className="sr-only">Loading settings</span>
      <aside
        className={cn(
          "lg:sticky lg:top-10 lg:block lg:self-start",
          isMobileDetailOpen && "hidden",
        )}
      >
        <div className="mb-5 border-border border-b pb-5 lg:border-b-0 lg:pb-0">
          <SkeletonText lines={2} widths={["w-32", "w-64"]} />
        </div>
        <div className="flex flex-col overflow-hidden">
          {[
            "account",
            "appearance",
            "matching",
            "privacy",
            "security",
            "safety",
            "notifications",
          ].map((item, index) => (
            <div
              key={item}
              className="flex items-center gap-3 border-border border-b px-1 py-2 last:border-b-0 lg:border-b-0 lg:px-4"
            >
              <Skeleton
                shape="circle"
                className="size-8"
                tone={index === 0 ? "teal" : "default"}
              />
              <SkeletonText
                className="flex-1"
                lines={2}
                widths={index === 2 ? ["w-20", "w-48"] : ["w-24", "w-36"]}
              />
              <Skeleton shape="circle" className="size-4 shrink-0 lg:hidden" />
            </div>
          ))}
        </div>
        <div className="mt-5 border-border border-y py-1 lg:border-x-0 lg:border-t lg:border-b-0 lg:py-4">
          <SkeletonButton className="h-10 w-full" />
        </div>
      </aside>

      <section
        className={cn(
          "w-full min-w-0 border-border/70 pt-11 lg:block lg:max-w-4xl lg:border-l lg:pt-0 lg:pl-10 xl:pl-12",
          !isMobileDetailOpen && "hidden",
        )}
      >
        <div className="mb-7 border-border border-b pb-5 lg:mb-9 lg:pb-7">
          <SkeletonText lines={3} widths={["w-24", "w-3/5", "w-full"]} />
        </div>
        <SettingsSectionSkeleton activeSection={activeSection} />
      </section>
    </div>
  );
}

function SettingsSectionSkeleton({
  activeSection,
}: {
  activeSection: SettingsSection;
}) {
  if (activeSection === "account") {
    return <AccountSectionSkeleton />;
  }

  if (activeSection === "security") {
    return <SecuritySectionSkeleton />;
  }

  if (activeSection === "matching") {
    return <MatchingSectionSkeleton />;
  }

  if (activeSection === "safety") {
    return <BlockedUsersSectionSkeleton />;
  }

  return <PreferenceSectionSkeleton />;
}

function AccountSectionSkeleton() {
  return (
    <div className="flex flex-col gap-9">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
        <div className="flex flex-col gap-5">
          <div className="flex items-start gap-5">
            <Skeleton
              shape="circle"
              className="size-24 sm:size-28"
              tone="teal"
            />
            <div className="min-w-0 flex-1 pt-2">
              <Skeleton className="h-3 w-32" tone="teal" />
              <Skeleton className="mt-3 h-8 w-56 max-w-full" />
              <SkeletonText
                className="mt-3 max-w-md"
                lines={3}
                size="sm"
                widths={["w-full", "w-11/12", "w-3/4"]}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border border-dashed bg-card/35 p-4">
            <div className="flex items-center gap-4">
              <Skeleton shape="circle" className="size-10" tone="teal" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-64 max-w-full" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Skeleton shape="pill" className="h-6 w-20" />
                  <Skeleton shape="pill" className="h-6 w-40" />
                </div>
              </div>
              <SkeletonButton className="hidden h-8 w-20 sm:block" />
            </div>
          </div>

          <Skeleton className="h-4 w-80 max-w-full" />

          <div className="grid gap-3 sm:grid-cols-2">
            <SkeletonButton className="h-11 w-full" tone="teal" />
            <SkeletonButton className="h-11 w-full" tone="amber" />
          </div>
        </div>

        <div className="border-border border-y lg:border-y-0 lg:border-l lg:pl-6">
          {["email", "sign-in", "verification", "member-since"].map(
            (item, index) => (
              <div
                key={item}
                className="flex gap-3 border-border border-b py-4 last:border-b-0"
              >
                <Skeleton
                  shape="circle"
                  className="mt-0.5 size-8 shrink-0"
                  tone={index === 0 ? "teal" : "default"}
                />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton
                    className={
                      index === 0 ? "mt-2 h-4 w-full max-w-48" : "mt-2 h-4 w-28"
                    }
                  />
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-5 grid gap-x-5 gap-y-2 md:grid-cols-2">
          <SettingsInputSkeleton />
          <SettingsInputSkeleton />
          <SettingsInputSkeleton
            className="md:col-span-2"
            inputClassName="h-28"
          />
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="mt-2 h-4 w-full max-w-xl" />
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <SettingsInputSkeleton />
          <SettingsInputSkeleton />
        </div>
      </section>

      <section className="border-border border-t pt-6">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
        <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start">
          <div>
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3 w-20" />
              <Skeleton shape="pill" className="h-5 w-28" />
            </div>
            <Skeleton className="mt-2 h-11 w-full rounded-xl" />
            <Skeleton className="mt-2 h-3 w-96 max-w-full" />
          </div>
          <div className="flex min-h-10 gap-3 border-border border-t pt-4 lg:mt-7 lg:items-center lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
            <Skeleton shape="circle" className="size-8 shrink-0" tone="teal" />
            <SkeletonText lines={2} size="sm" widths={["w-24", "w-20"]} />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-4 w-80 max-w-full" />
        <div className="responsive-action-grid grid w-full gap-3 md:max-w-92">
          <SkeletonButton className="h-11 w-full" />
          <SkeletonButton className="h-11 w-full" tone="teal" />
        </div>
      </div>
    </div>
  );
}

function MatchingSectionSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <SectionHeadingSkeleton />
        <div className="grid gap-5 sm:grid-cols-2">
          <StatPillSkeleton />
          <StatPillSkeleton />
        </div>
      </div>

      <div className="grid gap-0 border-border border-t lg:grid-cols-[1fr_1.4fr] lg:gap-8">
        <PreferenceRowSkeleton tone="teal" />
        <div className="border-border border-b py-5 lg:border-b-0">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-2 w-full" tone="teal" />
          <div className="mt-3 flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>

      <div className="border-border border-t pt-6">
        <Skeleton className="h-3 w-20" />
        <div className="mt-3 flex flex-wrap gap-2">
          {["one", "two", "three", "four", "five"].map((item, index) => (
            <Skeleton
              key={item}
              shape="pill"
              className="h-7 w-24"
              tone={index === 0 ? "teal" : "default"}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PreferenceSectionSkeleton() {
  return (
    <section className="flex flex-col gap-8">
      <SectionHeadingSkeleton />
      <div className="grid gap-0 border-border border-t lg:grid-cols-3 lg:gap-8">
        <PreferenceRowSkeleton tone="teal" />
        <PreferenceRowSkeleton />
        <PreferenceRowSkeleton />
      </div>
      <div className="border-forge-teal/35 border-l pl-4">
        <SkeletonText lines={2} widths={["w-full", "w-3/4"]} />
      </div>
    </section>
  );
}

function SecuritySectionSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <SectionHeadingSkeleton />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <StatPillSkeleton />
          <StatPillSkeleton />
          <StatPillSkeleton />
        </div>
        <div className="mt-6 flex flex-col gap-3 border-border border-t pt-5 md:flex-row md:items-center md:justify-between">
          <SkeletonText lines={2} widths={["w-48", "w-72"]} />
          <SkeletonButton className="h-10 w-full md:w-44" tone="teal" />
        </div>
      </section>

      <section>
        <Skeleton className="h-5 w-40" />
        <div className="mt-4 border-border border-t">
          {["current", "other"].map((item, index) => (
            <div
              key={item}
              className="md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton
                  shape="square"
                  className="size-10"
                  tone={index === 0 ? "teal" : "default"}
                />
                <SkeletonText
                  className="min-w-0 flex-1"
                  lines={2}
                  widths={["w-44", "w-64"]}
                />
              </div>
              <SkeletonButton className="h-10 w-24" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function BlockedUsersSectionSkeleton() {
  return (
    <section>
      <SectionHeadingSkeleton />
      <div className="mt-6 border-border border-t">
        {["first", "second"].map((item) => (
          <div
            key={item}
            className="flex items-center gap-3 border-border border-b py-5 last:border-b-0"
          >
            <Skeleton shape="circle" className="size-11" />
            <SkeletonText
              className="flex-1"
              lines={2}
              widths={["w-36", "w-48"]}
            />
            <SkeletonButton className="h-10 w-24" />
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeadingSkeleton() {
  return (
    <div className="max-w-2xl">
      <Skeleton className="h-5 w-44" />
      <SkeletonText className="mt-2" lines={2} widths={["w-full", "w-3/4"]} />
    </div>
  );
}

function SettingsInputSkeleton({
  className,
  inputClassName = "h-11",
}: {
  className?: string;
  inputClassName?: string;
}) {
  return (
    <div className={className}>
      <Skeleton className="h-3 w-20" />
      <Skeleton className={`mt-2 w-full ${inputClassName}`} />
    </div>
  );
}

function StatPillSkeleton() {
  return (
    <div className="rounded-full border border-border px-4 py-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-2 h-5 w-24" />
    </div>
  );
}

function PreferenceRowSkeleton({
  tone = "default",
}: {
  tone?: "default" | "teal";
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-border border-b py-5 lg:border-b-0">
      <SkeletonText
        className="min-w-0 flex-1"
        lines={2}
        widths={["w-40", "w-full"]}
      />
      <Skeleton shape="pill" className="h-7 w-12 shrink-0" tone={tone} />
    </div>
  );
}

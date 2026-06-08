import {
  Bell,
  Bookmark,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Eye,
  MapPin,
  MessageSquare,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type { ReactNode } from "react";

import { ActivityMenuIcon } from "@/features/activity/components/activity-menu-icon";
import { Button } from "@/shared/components/ui/button";
import { CountBadge } from "@/shared/components/ui/count-badge";
import { FactItem, type FactItemProps } from "@/shared/components/ui/fact-item";
import {
  IconTile,
  type IconTileShape,
  type IconTileSize,
  type IconTileTone,
} from "@/shared/components/ui/icon-tile";
import { Notice } from "@/shared/components/ui/notice";
import { OfflineNotice } from "@/shared/components/ui/offline-notice";
import {
  StatusPill,
  type StatusPillSize,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";

const iconTones: IconTileTone[] = [
  "teal",
  "amber",
  "destructive",
  "muted",
  "neutral",
  "none",
];

const iconSizes: IconTileSize[] = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"];

const iconShapes: IconTileShape[] = ["square", "circle"];

const statusTones: StatusPillTone[] = [
  "teal",
  "amber",
  "destructive",
  "muted",
  "neutral",
  "none",
];

const statusSizes: StatusPillSize[] = ["2xs", "signature", "xs", "sm", "md"];

const noticeTones = [
  "info",
  "success",
  "warning",
  "danger",
  "neutral",
] as const;

const noticeSizes = ["xs", "sm", "md", "lg"] as const;

const factExamples: Array<
  Pick<FactItemProps, "icon" | "iconTone" | "label" | "value" | "meta"> & {
    id: string;
  }
> = [
  {
    id: "location",
    icon: MapPin,
    iconTone: "teal",
    label: "Location",
    value: "Camden Market",
    meta: "public",
  },
  {
    id: "plan",
    icon: CalendarClock,
    iconTone: "amber",
    label: "Plan",
    value: "Today, 19:30",
  },
  {
    id: "access",
    icon: ShieldCheck,
    iconTone: "neutral",
    label: "Access",
    value: "Friends only",
  },
];

export function IconNoticeVariantsPage() {
  return (
    <main className="min-h-dvh bg-canvas px-5 py-6 text-ink sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header>
          <p className="font-semibold text-slate-muted text-xs">
            Temporary review page
          </p>
          <h1 className="mt-1 font-black text-2xl leading-tight">
            Icon and Notice Variants
          </h1>
          <p className="mt-2 max-w-2xl text-slate-muted text-sm">
            Plain matrix for approving the shared icon, badge, notice, and
            offline warning components.
          </p>
        </header>

        <ShowcaseSection title="IconTile: tone x shape">
          <div className="grid gap-4">
            {iconTones.map((tone) => (
              <div
                key={tone}
                className="grid gap-3 border-border border-b pb-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center"
              >
                <VariantLabel>{tone}</VariantLabel>
                <div className="flex flex-wrap items-center gap-3">
                  {iconShapes.map((shape) => (
                    <IconTile
                      key={shape}
                      icon={SlidersHorizontal}
                      shape={shape}
                      tone={tone}
                      size="lg"
                    />
                  ))}
                  {iconShapes.map((shape) => (
                    <IconTile
                      key={`${shape}-bordered`}
                      bordered
                      icon={SlidersHorizontal}
                      shape={shape}
                      tone={tone}
                      size="lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="IconTile: sizes">
          <div className="flex flex-wrap items-center gap-4">
            {iconSizes.map((size) => (
              <LabeledSample key={size} label={size}>
                <IconTile
                  bordered
                  icon={MessageSquare}
                  size={size}
                  tone="teal"
                />
              </LabeledSample>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="ActivityMenuIcon">
          <div className="flex flex-wrap items-center gap-4">
            <LabeledSample label="default">
              <ActivityMenuIcon>
                <Eye className="size-4" aria-hidden="true" />
              </ActivityMenuIcon>
            </LabeledSample>
            <LabeledSample label="active">
              <ActivityMenuIcon tone="active">
                <Bookmark className="size-4" aria-hidden="true" />
              </ActivityMenuIcon>
            </LabeledSample>
            <LabeledSample label="danger">
              <ActivityMenuIcon tone="danger">
                <CircleAlert className="size-4" aria-hidden="true" />
              </ActivityMenuIcon>
            </LabeledSample>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="StatusPill: tones and surfaces">
          <div className="grid gap-4">
            {statusTones.map((tone) => (
              <div
                key={tone}
                className="grid gap-3 border-border border-b pb-4 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-center"
              >
                <VariantLabel>{tone}</VariantLabel>
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill icon={Bookmark} tone={tone}>
                    Outline
                  </StatusPill>
                  <StatusPill icon={Bookmark} tone={tone} surface="soft">
                    Soft
                  </StatusPill>
                  <StatusPill icon={Bookmark} tone={tone} surface="solid">
                    Solid
                  </StatusPill>
                  <StatusPill icon={Bookmark} tone={tone} surface="ghost">
                    Ghost
                  </StatusPill>
                </div>
              </div>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="StatusPill: sizes">
          <div className="flex flex-wrap items-center gap-4">
            {statusSizes.map((size) => (
              <LabeledSample key={size} label={size}>
                <StatusPill icon={Bookmark} size={size} tone="teal">
                  5
                </StatusPill>
              </LabeledSample>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="CountBadge">
          <div className="flex flex-wrap items-center gap-4">
            {(["teal", "amber", "muted", "none"] as const).map((tone) => (
              <LabeledSample key={tone} label={tone}>
                <div className="flex items-center gap-2">
                  <CountBadge count={1} tone={tone} size="xs" />
                  <CountBadge count={5} tone={tone} size="sm" />
                  <CountBadge count={128} tone={tone} size="md" max={99} />
                </div>
              </LabeledSample>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="FactItem">
          <dl className="grid gap-4 sm:grid-cols-3">
            {factExamples.map(({ id, ...fact }) => (
              <FactItem
                key={id}
                {...fact}
                iconShape="square"
                iconSize="lg"
                className="items-start"
                labelClassName="font-semibold"
                valueClassName="mt-1"
              />
            ))}
          </dl>
        </ShowcaseSection>

        <ShowcaseSection title="Notice: tones">
          <div className="grid gap-3">
            {noticeTones.map((tone) => (
              <Notice
                key={tone}
                tone={tone}
                size="md"
                icon={
                  tone === "danger" ? (
                    <CircleAlert className="size-4" aria-hidden="true" />
                  ) : (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  )
                }
              >
                <p>
                  <span className="font-black capitalize">{tone}.</span> This is
                  a shared inline notice using the standard tone treatment.
                </p>
              </Notice>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Notice: sizes and action">
          <div className="grid gap-3">
            {noticeSizes.map((size) => (
              <Notice
                key={size}
                tone="warning"
                size={size}
                icon={<Bell className="size-4" aria-hidden="true" />}
                action={
                  size === "lg" ? (
                    <Button size="xs" variant="accentGhost">
                      Retry
                    </Button>
                  ) : null
                }
              >
                <p>
                  Size <span className="font-black">{size}</span> notice with
                  normal content wrapping.
                </p>
              </Notice>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="OfflineNotice">
          <div className="grid gap-3">
            <OfflineNotice size="md">
              <p>
                <span className="font-black text-spark-amber">Offline.</span>{" "}
                Cached content remains visible until the network returns.
              </p>
            </OfflineNotice>
            <OfflineNotice
              withIcon={false}
              size="md"
              className="text-spark-amber"
            >
              Reconnect before changing notification delivery.
            </OfflineNotice>
            <OfflineNotice
              withIcon={false}
              tone="neutral"
              size="xs"
              className="rounded-lg border-border/70 bg-muted/30 text-slate-muted"
            >
              Reconnect before changing this plan.
            </OfflineNotice>
            <OfflineNotice
              size="xs"
              iconClassName="mt-0"
              className="items-center border-0 bg-transparent p-0 text-spark-amber"
              contentClassName="font-medium"
            >
              Reconnect before sending invites.
            </OfflineNotice>
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}

function ShowcaseSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section className="border-border border-t pt-5">
      <h2 className="mb-4 font-black text-base">{title}</h2>
      {children}
    </section>
  );
}

function VariantLabel({ children }: { children: ReactNode }) {
  return (
    <p className="font-semibold text-slate-muted text-xs uppercase">
      {children}
    </p>
  );
}

function LabeledSample({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-18 flex-col gap-2">
      <VariantLabel>{label}</VariantLabel>
      <div className="flex min-h-10 items-center">{children}</div>
    </div>
  );
}

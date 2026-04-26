"use client";

import { cn } from "@/shared/lib/utils";
import { Check, Copy, Calendar, MapPin, Users, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

// Mirror the preset gradient map from step5 so the cover thumbnail renders correctly
const PRESET_GRADIENTS: Record<string, string> = {
  teal: "from-teal-500 to-teal-700",
  ember: "from-amber-400 to-orange-500",
  forest: "from-emerald-500 to-green-700",
  rose: "from-rose-400 to-rose-600",
  midnight: "from-slate-700 to-slate-900",
  sky: "from-sky-400 to-blue-600",
};

import type { Group } from "@/shared/schemas/group";

export interface Step6InviteProps {
  group: Partial<Group>;
  participantCount: number;
  coverImage: string | null;
  inviteCopied: boolean;
  onCopyLink: () => void;
}

export function Step6Invite({
  group,
  participantCount,
  coverImage,
  inviteCopied,
  onCopyLink,
}: Step6InviteProps) {
  const planName = group.plan?.title || "";
  const activity = group.activity?.title || null;
  const planDate = group.plan?.dateTime || "";
  const planLocation = group.plan?.location || "";
  const gradientClass = coverImage ? PRESET_GRADIENTS[coverImage] : null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* ── Group summary card ── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {/* Cover strip */}
        <div
          className={cn(
            "h-20 w-full transition-colors duration-300",
            coverImage === "uploaded"
              ? "bg-primary/20"
              : gradientClass
                ? `bg-linear-to-br ${gradientClass}`
                : "bg-linear-to-br from-muted/60 to-muted/20",
          )}
        />

        {/* Body */}
        <div className="px-4 pb-4">
          {/* Avatar + name row */}
          <div className="flex items-end gap-3 -mt-6 mb-3">
            <div
              className={cn(
                "w-14 h-14 rounded-xl border-4 border-card shrink-0 shadow-md flex items-center justify-center",
                coverImage === "uploaded"
                  ? "bg-primary/15"
                  : gradientClass
                    ? `bg-linear-to-br ${gradientClass}`
                    : "bg-muted",
              )}
            >
              <Zap size={20} className="text-white/80" />
            </div>
            <div className="min-w-0 pb-0.5">
              <h4 className="text-base font-bold text-foreground truncate leading-tight">
                {planName || "Untitled Group"}
              </h4>
              {activity && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activity}
                </p>
              )}
            </div>
          </div>

          {/* Detail pills */}
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
              <Users size={12} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">
                {participantCount} member{participantCount !== 1 ? "s" : ""}
              </span>
            </div>
            {planDate && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
                <Calendar size={12} className="text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground">
                  {planDate}
                </span>
              </div>
            )}
            {planLocation && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/60 border border-border/40">
                <MapPin size={12} className="text-primary shrink-0" />
                <span className="text-xs font-semibold text-foreground truncate max-w-28">
                  {planLocation}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Member avatar stack footer */}
        <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {/* Host */}
              <div className="w-7 h-7 rounded-full bg-primary border-2 border-card flex items-center justify-center shadow-sm z-10">
                <span className="text-nano font-bold text-primary-foreground">
                  You
                </span>
              </div>
              {Array.from({ length: Math.min(4, participantCount - 1) }).map(
                (_, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full bg-accent/20 border-2 border-card shadow-sm"
                    style={{ zIndex: 9 - i }}
                  />
                ),
              )}
              {participantCount > 5 && (
                <div
                  className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center shadow-sm"
                  style={{ zIndex: 4 }}
                >
                  <span className="text-nano font-bold text-muted-foreground">
                    +{participantCount - 5}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {participantCount} member{participantCount !== 1 ? "s" : ""} ready
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/15">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-600">
              Verified
            </span>
          </span>
        </div>
      </div>

      {/* ── Invite link ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          Share invite link
        </p>
        <div className="flex items-center gap-2 px-4 h-12 rounded-2xl border border-border/50 bg-card">
          <span className="flex-1 text-sm text-muted-foreground truncate font-mono">
            teamforge.app/join/grp_xk4j2m
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCopyLink}
            aria-label="Copy invite link"
            className={cn(
              "flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-semibold shrink-0 transition-all active:scale-95",
              inviteCopied
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
                : "bg-muted text-ink hover:bg-primary/10 hover:text-primary",
            )}
          >
            {inviteCopied ? (
              <>
                <Check size={12} strokeWidth={2.5} />
                Copied!
              </>
            ) : (
              <>
                <Copy size={12} strokeWidth={2} />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ── Notify members note ── */}
      <div className="flex gap-3 p-4 rounded-2xl border border-border/40 bg-card">
        <div className="w-0.5 rounded-full bg-primary/30 shrink-0 self-stretch" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary/80">
            Sending invitations
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Tapping{" "}
            <span className="font-semibold text-foreground">
              Confirm &amp; send
            </span>{" "}
            below will notify all {participantCount - 1} matched member
            {participantCount - 1 !== 1 ? "s" : ""} and create your group.
          </p>
        </div>
      </div>
    </div>
  );
}

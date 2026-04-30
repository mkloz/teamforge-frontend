"use client";

import { cn } from "@/shared/lib/utils";
import { getPlanCoverPreset } from "@/shared/lib/plan-cover";
import { Image } from "@/shared/components/common/image";
import { Check, Copy, Calendar, MapPin, Users, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface Step6InviteProps {
  planTitle: string;
  planDate: string;
  planLocation: string;
  activityTitle: string;
  participantCount: number;
  inviteeCount: number;
  forgeMode: "AUTO" | "MANUAL";
  coverImage: string | null;
  inviteCopied: boolean;
  onCopyLink: () => void;
}

export function Step6Invite({
  planTitle,
  planDate,
  planLocation,
  activityTitle,
  participantCount,
  inviteeCount,
  forgeMode,
  coverImage,
  inviteCopied,
  onCopyLink,
}: Step6InviteProps) {
  const coverPreset = getPlanCoverPreset(coverImage);
  const coverIsImage = Boolean(
    coverImage?.match(/^(https?:\/\/|data:image\/|blob:|\/)/i),
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-10">
      {/* ── Group summary card ── */}
      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        {/* Cover strip */}
        <div className="h-20 w-full overflow-hidden">
          {coverIsImage ? (
            <Image src={coverImage ?? undefined} alt="" />
          ) : (
            <div
              className={cn(
                "h-full w-full transition-colors duration-300",
                coverPreset
                  ? `bg-linear-to-br ${coverPreset.gradient}`
                  : "bg-linear-to-br from-muted/60 to-muted/20",
              )}
            />
          )}
        </div>

        {/* Body */}
        <div className="px-4 pb-4">
          {/* Avatar + name row */}
          <div className="flex items-end gap-3 -mt-6 mb-3">
            <div
              className={cn(
                "w-14 h-14 rounded-xl border-4 border-card shrink-0 shadow-md flex items-center justify-center",
                coverPreset
                  ? `bg-linear-to-br ${coverPreset.gradient}`
                  : "bg-muted",
              )}
            >
              <Zap size={20} className="text-white/80" />
            </div>
            <div className="min-w-0 pb-0.5">
              <h4 className="text-base font-bold text-foreground truncate leading-tight">
                {planTitle || "Untitled Group"}
              </h4>
              {activityTitle && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {activityTitle}
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forge-teal/10 border border-forge-teal/15">
            <span className="w-1.5 h-1.5 rounded-full bg-forge-teal animate-pulse" />
            <span className="text-xs font-semibold text-forge-teal">
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
        <div className="rounded-full bg-primary/20 w-2 h-2 mt-1.5 shrink-0" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-primary/80">
            Sending invitations
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {forgeMode === "MANUAL"
              ? `Finishing will send ${inviteeCount} invitation${
                  inviteeCount !== 1 ? "s" : ""
                } and leave the group ready for replies.`
              : "The group is formed already. Finishing keeps everything saved and takes you to the group hub."}
          </p>
        </div>
      </div>
    </div>
  );
}

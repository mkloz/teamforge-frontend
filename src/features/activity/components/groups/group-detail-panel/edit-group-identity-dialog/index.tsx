import { CalendarDays, type LucideIcon, UsersRound } from "lucide-react";
import { useRef, useState } from "react";

import { useEditGroupIdentity } from "@/features/activity/hooks/use-edit-group-identity";
import type { Group } from "@/features/activity/lib/activity-contract";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { cn } from "@/shared/lib/utils";

import { EditGroupAvatarSection } from "./edit-group-avatar-section";
import { EditGroupCoverSection } from "./edit-group-cover-section";
import { EditGroupIdentityFields } from "./edit-group-identity-fields";
import { EditGroupIdentityFooter } from "./edit-group-identity-footer";
import { EditPlanDetailsFields } from "./edit-plan-details-fields";

interface EditGroupIdentityDialogProps {
  group: Group;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditGroupIdentityDialog({
  group,
  open,
  onOpenChange,
}: EditGroupIdentityDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <EditGroupIdentityDialogContent
          group={group}
          onOpenChange={onOpenChange}
        />
      )}
    </Dialog>
  );
}

interface EditGroupIdentityDialogContentProps {
  group: Group;
  onOpenChange: (open: boolean) => void;
}

function EditGroupIdentityDialogContent({
  group,
  onOpenChange,
}: EditGroupIdentityDialogContentProps) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<EditGroupDetailsTab>("group");
  const editor = useEditGroupIdentity(group, {
    onSaved: () => onOpenChange(false),
  });
  const hasPlan = Boolean(group.plan);

  return (
    <DialogContent className="modal-viewport-frame flex flex-col gap-0 overflow-hidden rounded-2xl border-border/70 bg-canvas px-4 py-0 shadow-xl sm:max-w-2xl [&>button]:top-3 [&>button]:right-3">
      <DialogHeader className="border-border/60 border-b py-5 pr-10">
        <DialogTitle>Edit details</DialogTitle>
        <DialogDescription>
          Update the group identity and the current plan from one place.
        </DialogDescription>
      </DialogHeader>

      {hasPlan ? (
        <EditGroupDetailsTabs value={activeTab} onChange={setActiveTab} />
      ) : null}

      <div className="min-h-0 overflow-y-auto py-4">
        {activeTab === "group" || !hasPlan ? (
          <section
            aria-labelledby={hasPlan ? "edit-group-tab-group" : undefined}
            className="flex flex-col gap-4"
            id="edit-group-panel-group"
            role={hasPlan ? "tabpanel" : undefined}
          >
            <SectionHeader
              title="Group"
              description="Name, description, and the image people recognise in the member list."
            />
            <EditGroupIdentityFields editor={editor} />
            <EditGroupAvatarSection editor={editor} inputRef={avatarInputRef} />
          </section>
        ) : null}

        {hasPlan && activeTab === "plan" ? (
          <section
            aria-labelledby="edit-group-tab-plan"
            className="flex flex-col gap-4"
            id="edit-group-panel-plan"
            role="tabpanel"
          >
            <SectionHeader
              title="Current plan"
              description="Activity details, timing, place, cost, and cover image."
            />
            <EditPlanDetailsFields editor={editor} />
            <EditGroupCoverSection
              editor={editor}
              group={group}
              inputRef={coverInputRef}
            />
          </section>
        ) : null}
      </div>

      {editor.error && (
        <p className="border-border/60 border-t py-3 font-medium text-destructive text-sm">
          {editor.error}
        </p>
      )}

      <DialogFooter className="border-border/60 border-t py-4">
        <EditGroupIdentityFooter
          editor={editor}
          onCancel={() => onOpenChange(false)}
        />
      </DialogFooter>
    </DialogContent>
  );
}

type EditGroupDetailsTab = "group" | "plan";

const EDIT_GROUP_DETAILS_TABS = [
  {
    description: "Identity and avatar",
    icon: UsersRound,
    id: "group",
    label: "Group",
  },
  {
    description: "Plan, place, and cover",
    icon: CalendarDays,
    id: "plan",
    label: "Plan",
  },
] as const satisfies Array<{
  description: string;
  icon: LucideIcon;
  id: EditGroupDetailsTab;
  label: string;
}>;

function EditGroupDetailsTabs({
  onChange,
  value,
}: {
  onChange: (value: EditGroupDetailsTab) => void;
  value: EditGroupDetailsTab;
}) {
  return (
    <div
      aria-label="Edit detail sections"
      className="grid grid-cols-2 gap-1 border-border/60 border-b py-3"
      role="tablist"
    >
      {EDIT_GROUP_DETAILS_TABS.map((tab) => (
        <EditGroupDetailsTabButton
          key={tab.id}
          active={value === tab.id}
          tab={tab}
          onClick={() => onChange(tab.id)}
        />
      ))}
    </div>
  );
}

function EditGroupDetailsTabButton({
  active,
  onClick,
  tab,
}: {
  active: boolean;
  onClick: () => void;
  tab: (typeof EDIT_GROUP_DETAILS_TABS)[number];
}) {
  const Icon = tab.icon;

  return (
    <button
      aria-controls={`edit-group-panel-${tab.id}`}
      aria-selected={active}
      className={cn(
        "flex min-w-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left outline-none transition duration-200 focus-visible:ring-2 focus-visible:ring-forge-teal/30",
        active
          ? "border-forge-teal/35 bg-forge-teal/10 text-foreground"
          : "border-transparent text-muted-foreground hover:bg-muted/35 hover:text-foreground",
      )}
      id={`edit-group-tab-${tab.id}`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full",
          active
            ? "bg-forge-teal text-canvas"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" aria-hidden="true" strokeWidth={1.5} />
      </span>
      <span className="min-w-0">
        <span className="block truncate font-semibold text-sm">
          {tab.label}
        </span>
        <span className="block truncate text-xs">{tab.description}</span>
      </span>
    </button>
  );
}

function SectionHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="font-bold text-foreground text-sm">{title}</h3>
      <p className="text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}

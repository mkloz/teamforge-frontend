import { useState } from "react";
import { Camera, Pencil, Check, X, Users } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import type { GroupIdentity, MemberRole } from "../../types/groups.types";

interface GroupIdentitySectionProps {
  identity: GroupIdentity;
  memberCount: number;
  maxMembers: number;
  userRole: MemberRole;
}

export function GroupIdentitySection({
  identity,
  memberCount,
  maxMembers,
  userRole,
}: GroupIdentitySectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(identity.name);
  const isAdmin = userRole === "ADMIN";

  const handleSave = () => {
    // Would save to API
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(identity.name);
    setIsEditing(false);
  };

  return (
    <section className="relative">
      {/* Group avatar and name - the persistent identity */}
      <div className="flex items-center gap-4">
        {/* Avatar with edit overlay for admins */}
        <div className="relative group">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-muted ring-2 ring-border">
            <img
              src={identity.avatar}
              alt={identity.name}
              className="w-full h-full object-cover"
            />
          </div>
          {isAdmin && (
            <button
              className={cn(
                "absolute inset-0 flex items-center justify-center rounded-2xl",
                "bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity",
              )}
              aria-label="Change group avatar"
            >
              <Camera size={20} className="text-white" />
            </button>
          )}
        </div>

        {/* Name and metadata */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="h-8 text-base font-bold"
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600"
                onClick={handleSave}
              >
                <Check size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={handleCancel}
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground truncate">
                {identity.name}
              </h2>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil size={12} />
                </Button>
              )}
            </div>
          )}

          {/* Member count */}
          <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
            <Users size={14} />
            <span>
              {memberCount} of {maxMembers} members
            </span>
          </div>

          {/* Created date */}
          <p className="text-xs text-muted-foreground mt-0.5">
            Created{" "}
            {new Date(identity.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Description */}
      {identity.description && (
        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
          {identity.description}
        </p>
      )}

      {/* Visual separator between identity and plan */}
      <div className="flex items-center gap-3 mt-5 mb-2">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Current Plan
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </section>
  );
}

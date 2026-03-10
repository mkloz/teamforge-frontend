import { useState } from "react";
import type { Invitation } from "../types/home.types";

export function usePendingInvitations(initialInvitations: Invitation[] = []) {
  const [invitations, setInvitations] = useState<Invitation[]>(initialInvitations);
  const [isUpdating, setIsUpdating] = useState(false);

  const acceptInvitation = async (invitationId: string) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      // await api.acceptInvitation(invitationId);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "ACCEPTED" } : inv,
        ),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const declineInvitation = async (invitationId: string) => {
    setIsUpdating(true);
    try {
      // Simulate API call
      // await api.declineInvitation(invitationId);
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitationId ? { ...inv, status: "DECLINED" } : inv,
        ),
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const pendingCount = invitations.filter((inv) => inv.status === "PENDING").length;

  return {
    invitations,
    pendingCount,
    isUpdating,
    acceptInvitation,
    declineInvitation,
  };
}

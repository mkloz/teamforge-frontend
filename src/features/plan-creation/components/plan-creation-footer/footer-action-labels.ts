export function getStep1ContinueLabel(hasSelectedActivity: boolean) {
  return hasSelectedActivity ? "Continue to plan" : "Select a category";
}

export function getStep6ContinueLabel(hasCoverImage: boolean) {
  return hasCoverImage ? "Continue to invitations" : "I'll set this later";
}

interface Step7InviteLabelParams {
  hasManualInvitees: boolean;
  isSendingInvites: boolean;
}

export function getStep7InviteLabel({
  hasManualInvitees,
  isSendingInvites,
}: Step7InviteLabelParams) {
  if (isSendingInvites) {
    return "Sending...";
  }

  return hasManualInvitees ? "Send invitations" : "Finish group";
}

export function getIncomingRequestActionState({
  acceptingRequestId,
  decliningRequestId,
  userId,
}: {
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  userId: string;
}) {
  const isAccepting = acceptingRequestId === userId;
  const isDeclining = decliningRequestId === userId;

  return {
    isAccepting,
    isDeclining,
    isActionPending: isAccepting || isDeclining,
  };
}

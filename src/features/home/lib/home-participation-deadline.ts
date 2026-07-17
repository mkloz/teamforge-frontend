export function hasHomeParticipationDeadlinePassed(
  responseDeadline: string | null,
  currentTime = Date.now(),
) {
  return (
    responseDeadline !== null && Date.parse(responseDeadline) <= currentTime
  );
}

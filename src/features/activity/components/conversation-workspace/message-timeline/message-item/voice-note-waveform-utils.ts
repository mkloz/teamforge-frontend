export function getValidVoiceNoteDuration(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) && value > 0
    ? value
    : null;
}

export function clampVoiceNoteSeconds(value: number, duration: number) {
  if (!Number.isFinite(value) || !Number.isFinite(duration) || duration <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(duration, value));
}

export function getVoiceNoteValueText(
  currentSeconds: number,
  durationSeconds: number,
) {
  return `${formatSpokenDuration(
    clampVoiceNoteSeconds(currentSeconds, durationSeconds),
  )} of ${formatSpokenDuration(durationSeconds)}`;
}

export function getVoiceNoteKeyboardSeekTarget({
  currentSeconds,
  durationSeconds,
  event,
}: {
  currentSeconds: number;
  durationSeconds: number;
  event: {
    altKey: boolean;
    ctrlKey: boolean;
    isComposing: boolean;
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
  };
}) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.isComposing) {
    return null;
  }

  const largeStep = event.shiftKey ? 10 : 1;
  const targetByKey: Record<string, number> = {
    ArrowDown: currentSeconds - largeStep,
    ArrowLeft: currentSeconds - largeStep,
    ArrowRight: currentSeconds + largeStep,
    ArrowUp: currentSeconds + largeStep,
    End: durationSeconds,
    Home: 0,
    PageDown: currentSeconds - 10,
    PageUp: currentSeconds + 10,
  };
  const target = targetByKey[event.key];

  return target === undefined
    ? null
    : clampVoiceNoteSeconds(target, durationSeconds);
}

function formatSpokenDuration(seconds: number) {
  const roundedSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const remainingSeconds = roundedSeconds % 60;
  const parts: string[] = [];

  if (minutes > 0) {
    parts.push(`${minutes} ${minutes === 1 ? "minute" : "minutes"}`);
  }

  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(
      `${remainingSeconds} ${remainingSeconds === 1 ? "second" : "seconds"}`,
    );
  }

  return parts.join(" ");
}

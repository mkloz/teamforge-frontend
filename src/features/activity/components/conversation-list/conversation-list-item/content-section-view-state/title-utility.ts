import type { TitleUtilityState } from "./types";

export function getTitleUtilityState({
  hasTogglePinned,
  isPinned,
  isMuted,
  showInlineGroupIndicators,
}: {
  hasTogglePinned: boolean;
  isPinned: boolean | undefined;
  isMuted: boolean;
  showInlineGroupIndicators: boolean;
}): TitleUtilityState {
  const showInlineMutedIndicator = isMuted;
  const showStaticPinnedIcon = Boolean(isPinned);
  const showTitlePinButton = shouldShowTitlePinButton({
    hasTogglePinned,
    isPinned,
    showInlineGroupIndicators,
    showInlineMutedIndicator,
  });

  return {
    hasTitleUtilityCluster: [
      showInlineGroupIndicators,
      showInlineMutedIndicator,
      showTitlePinButton,
      showStaticPinnedIcon,
    ].some(Boolean),
    showInlineMutedIndicator,
    showStaticPinnedIcon,
    showTitlePinButton,
  };
}

function shouldShowTitlePinButton({
  hasTogglePinned,
  isPinned,
  showInlineGroupIndicators,
  showInlineMutedIndicator,
}: {
  hasTogglePinned: boolean;
  isPinned: boolean | undefined;
  showInlineGroupIndicators: boolean;
  showInlineMutedIndicator: boolean;
}): boolean {
  return (
    hasTogglePinned &&
    !isPinned &&
    (showInlineMutedIndicator || showInlineGroupIndicators)
  );
}

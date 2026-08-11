import { useBlocker } from "@tanstack/react-router";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";

interface SettingsNavigationGuardContextValue {
  isMobile: boolean;
  setDraftActive: (id: string, active: boolean) => void;
  setPendingActive: (id: string, active: boolean) => void;
  setOverlay: (id: string, close: (() => void) | null) => void;
}

type SettingsNavigationBlockReason = "draft" | "overlay" | "pending";

const SettingsNavigationGuardContext =
  createContext<SettingsNavigationGuardContextValue | null>(null);

export function SettingsNavigationGuardProvider({
  children,
  isMobile,
}: {
  children: ReactNode;
  isMobile: boolean;
}) {
  const [draftIds, setDraftIds] = useState<ReadonlySet<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [overlays, setOverlays] = useState<ReadonlyMap<string, () => void>>(
    new Map(),
  );
  const draftIdsRef = useRef(draftIds);
  const pendingIdsRef = useRef(pendingIds);
  const overlaysRef = useRef(overlays);
  const blockedOverlayIdRef = useRef<string | null>(null);
  const blockedReasonRef = useRef<SettingsNavigationBlockReason | null>(null);

  draftIdsRef.current = draftIds;
  pendingIdsRef.current = pendingIds;
  overlaysRef.current = overlays;

  const setDraftActive = useCallback((id: string, active: boolean) => {
    setDraftIds((current) => updateSetMembership(current, id, active));
  }, []);
  const setPendingActive = useCallback((id: string, active: boolean) => {
    setPendingIds((current) => updateSetMembership(current, id, active));
  }, []);
  const setOverlay = useCallback((id: string, close: (() => void) | null) => {
    setOverlays((current) => updateOverlayMap(current, id, close));
  }, []);
  const hasDrafts = draftIds.size > 0;
  const hasPendingOperations = pendingIds.size > 0;
  const hasOverlays = overlays.size > 0;
  const blocker = useBlocker({
    disabled: !hasDrafts && !hasPendingOperations && !hasOverlays,
    enableBeforeUnload: () =>
      draftIdsRef.current.size > 0 || pendingIdsRef.current.size > 0,
    shouldBlockFn: useCallback(({ action }) => {
      const topOverlayId = getLastMapKey(overlaysRef.current);
      if (topOverlayId !== null) {
        if (action === "PUSH" || action === "REPLACE") {
          blockedOverlayIdRef.current = null;
          blockedReasonRef.current = null;
          return false;
        }

        blockedOverlayIdRef.current = topOverlayId;
        blockedReasonRef.current = "overlay";
        return true;
      }

      blockedOverlayIdRef.current = null;
      if (pendingIdsRef.current.size > 0) {
        blockedReasonRef.current = "pending";
        return true;
      }
      if (draftIdsRef.current.size > 0) {
        blockedReasonRef.current = "draft";
        return true;
      }

      blockedReasonRef.current = null;
      return false;
    }, []),
    withResolver: true,
  });

  useEffect(() => {
    if (blocker.status === "idle") {
      blockedOverlayIdRef.current = null;
      blockedReasonRef.current = null;
      return;
    }

    if (
      blockedReasonRef.current !== "overlay" ||
      !blockedOverlayIdRef.current
    ) {
      return;
    }

    const overlayId = blockedOverlayIdRef.current;
    overlaysRef.current.get(overlayId)?.();
    blocker.reset();
  }, [blocker]);

  const contextValue = useMemo(
    () => ({ isMobile, setDraftActive, setOverlay, setPendingActive }),
    [isMobile, setDraftActive, setOverlay, setPendingActive],
  );
  const showDraftDialog =
    blocker.status === "blocked" && blockedReasonRef.current === "draft";
  const showPendingDialog =
    blocker.status === "blocked" && blockedReasonRef.current === "pending";

  return (
    <SettingsNavigationGuardContext.Provider value={contextValue}>
      {children}
      <ActionDialog
        cancelLabel="Stay here"
        closeOnConfirm={false}
        confirmLabel="Discard changes"
        description="You have changes on this settings page that have not been saved."
        onConfirm={() => blocker.proceed?.()}
        onOpenChange={(open) => {
          if (!open) {
            blocker.reset?.();
          }
        }}
        open={showDraftDialog}
        title="Discard unsaved changes?"
        tone="warning"
      />
      <ActionDialog
        cancelLabel="Stay here"
        closeOnConfirm={false}
        confirmLabel="Leave page"
        description="This update may still finish after you leave this settings page."
        onConfirm={() => blocker.proceed?.()}
        onOpenChange={(open) => {
          if (!open) {
            blocker.reset?.();
          }
        }}
        open={showPendingDialog}
        title="Leave while an update is in progress?"
        tone="warning"
      />
    </SettingsNavigationGuardContext.Provider>
  );
}

export function useSettingsDraftGuard(id: string, active: boolean) {
  const guard = useContext(SettingsNavigationGuardContext);

  useLayoutEffect(() => {
    guard?.setDraftActive(id, active);

    return () => guard?.setDraftActive(id, false);
  }, [active, guard, id]);
}

export function useSettingsPendingGuard(id: string, active: boolean) {
  const guard = useContext(SettingsNavigationGuardContext);

  useLayoutEffect(() => {
    guard?.setPendingActive(id, active);

    return () => guard?.setPendingActive(id, false);
  }, [active, guard, id]);
}

export function useSettingsOverlayGuard(open: boolean, close: () => void) {
  const guard = useContext(SettingsNavigationGuardContext);
  const generatedId = useId();
  const closeRef = useRef(close);
  closeRef.current = close;

  useLayoutEffect(() => {
    guard?.setOverlay(generatedId, open ? () => closeRef.current() : null);

    return () => guard?.setOverlay(generatedId, null);
  }, [generatedId, guard, open]);
}

export function useSettingsIsMobile() {
  return useContext(SettingsNavigationGuardContext)?.isMobile ?? false;
}

function updateSetMembership(
  current: ReadonlySet<string>,
  id: string,
  active: boolean,
) {
  if (current.has(id) === active) {
    return current;
  }

  const next = new Set(current);
  if (active) {
    next.add(id);
  } else {
    next.delete(id);
  }
  return next;
}

function updateOverlayMap(
  current: ReadonlyMap<string, () => void>,
  id: string,
  close: (() => void) | null,
) {
  if (!close && !current.has(id)) {
    return current;
  }

  const next = new Map(current);
  if (close) {
    next.delete(id);
    next.set(id, close);
  } else {
    next.delete(id);
  }
  return next;
}

function getLastMapKey(map: ReadonlyMap<string, unknown>) {
  let lastKey: string | null = null;
  for (const key of map.keys()) {
    lastKey = key;
  }
  return lastKey;
}

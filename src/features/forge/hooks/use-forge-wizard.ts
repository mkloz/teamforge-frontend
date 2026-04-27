import { useState, useCallback } from "react";
import type {
  ForgeMode,
  FixedGroupSize,
  Visibility,
  ForgeResult,
} from "../types/forge.types";
import { MOCK_PARTICIPANTS } from "../constants/forge.constants";

export type Step = 1 | 2 | 3 | 4 | 5 | 6;

export function useForgeWizard(onClose: () => void) {
  const [step, setStep] = useState<Step>(1);
  const [navDirection, setNavDirection] = useState<"forward" | "back">(
    "forward",
  );

  // Step 1: Activity
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);

  // Step 2: Plan
  const [planName, setPlanName] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("");
  const [planLocation, setPlanLocation] = useState("");
  const [locationType, setLocationType] = useState<
    "IN_PERSON" | "ONLINE" | "TBD"
  >("TBD");

  // Step 3: Group
  const [forgeMode, setForgeMode] = useState<ForgeMode>("AUTO");
  const [fixedSize, setFixedSize] = useState<FixedGroupSize>(6);
  const [autoMinSize, setAutoMinSize] = useState(4);
  const [autoMaxSize, setAutoMaxSize] = useState(8);
  const [compatibilityWeight, setCompatibilityWeight] = useState(70);
  const [diversityWeight, setDiversityWeight] = useState(50);
  const [visibility, setVisibility] = useState<Visibility>("FRIENDS_ONLY");

  // Step 4: Post-forge Result
  const [forgeResult, setForgeResult] = useState<ForgeResult>("IDLE");
  const [participants, setParticipants] = useState(
    MOCK_PARTICIPANTS.slice(0, 5),
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Forge loading transition
  const [isForging, setIsForging] = useState(false);
  const [forgingProgress, setForgingProgress] = useState(0);

  // Group identity (shared across step 3 & step 5)
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");

  // Step 5: Identity
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  // Step 6: Invite
  const [inviteCopied, setInviteCopied] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);

  // Derived state
  const activeParticipants = participants.filter(
    (p) => !removedIds.has(p.userId),
  );
  const canAdvanceStep1 = !!selectedActivity;
  const canAdvanceStep2 = planName.trim().length >= 3;
  const isPreForge = step <= 3;
  const canGoBack = (step > 1 && step <= 3) || step === 5 || step === 6;

  // Actions
  const reset = useCallback(() => {
    setStep(1);
    setNavDirection("forward");
    setSelectedActivity(null);
    setPlanName("");
    setPlanDate("");
    setPlanTime("");
    setPlanLocation("");
    setLocationType("TBD");
    setGroupName("");
    setGroupDescription("");
    setForgeMode("AUTO");
    setFixedSize(6);
    setAutoMinSize(4);
    setAutoMaxSize(8);
    setCompatibilityWeight(70);
    setDiversityWeight(50);
    setVisibility("FRIENDS_ONLY");
    setForgeResult("IDLE");
    setParticipants(MOCK_PARTICIPANTS.slice(0, 5));
    setRemovedIds(new Set());
    setCoverImage(null);
    setAvatarImage(null);
    setInviteCopied(false);
    setInvitesSent(false);
  }, []);

  const close = useCallback(() => {
    onClose();
    setTimeout(reset, 300);
  }, [onClose, reset]);

  const goNext = useCallback(() => {
    setNavDirection("forward");
    setStep((s) => {
      if (s === 1) return 2;
      if (s === 2) return 3;
      if (s === 3) return 4;
      if (s === 4) return 5;
      if (s === 5) return 6;
      return s;
    });
  }, []);

  const goBack = useCallback(() => {
    setNavDirection("back");
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else if (step === 5) setStep(4);
    else if (step === 6) setStep(5);
  }, [step]);

  // Shared forge animation runner — runs for a minimum visible duration (6s)
  // then resolves. Since we don't know when the real algorithm finishes,
  // the animation is infinite; we just enforce a minimum so users always
  // see the full forge sequence before the result screen appears.
  const runForgeAnimation = useCallback((onComplete: () => void) => {
    setIsForging(true);
    setForgingProgress(0);
    const start = performance.now();
    const minDuration = 6000;
    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min((elapsed / minDuration) * 100, 100);
      setForgingProgress(p);
      if (p < 100) {
        requestAnimationFrame(tick);
      } else {
        setIsForging(false);
        onComplete();
      }
    };
    requestAnimationFrame(tick);
  }, []);

  const handleManualForge = useCallback(() => {
    setNavDirection("forward");
    runForgeAnimation(() => {
      setParticipants(MOCK_PARTICIPANTS.slice(0, fixedSize - 1));
      setRemovedIds(new Set());
      setForgeResult("SUCCESS");
      setStep(4);
    });
  }, [fixedSize, runForgeAnimation]);

  const handleAutoForge = useCallback(() => {
    setNavDirection("forward");
    runForgeAnimation(() => {
      if (diversityWeight > 80) {
        setForgeResult("FAILED");
      } else {
        const size = Math.floor((autoMinSize + autoMaxSize) / 2);
        setParticipants(MOCK_PARTICIPANTS.slice(0, size - 1));
        setRemovedIds(new Set());
        setForgeResult("SUCCESS");
      }
      setStep(4);
    });
  }, [diversityWeight, autoMinSize, autoMaxSize, runForgeAnimation]);

  const handleRemoveParticipant = useCallback((id: string) => {
    setRemovedIds((prev) => new Set([...prev, id]));
  }, []);

  const handleRestoreParticipant = useCallback((id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleReforge = useCallback(() => {
    setNavDirection("back");
    setForgeResult("IDLE");
    setStep(3);
  }, []);

  const handleCopyLink = useCallback(() => {
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  }, []);

  return {
    // State
    step,
    navDirection,
    selectedActivity,
    planName,
    groupName,
    groupDescription,
    planDate,
    planTime,
    planLocation,
    locationType,
    forgeMode,
    fixedSize,
    autoMinSize,
    autoMaxSize,
    compatibilityWeight,
    diversityWeight,
    visibility,
    forgeResult,
    participants,
    removedIds,
    isForging,
    forgingProgress,
    coverImage,
    avatarImage,
    inviteCopied,
    invitesSent,
    activeParticipants,

    // Validation
    canAdvanceStep1,
    canAdvanceStep2,
    isPreForge,
    canGoBack,

    // Setters
    setSelectedActivity,
    setPlanName,
    setGroupName,
    setGroupDescription,
    setPlanDate,
    setPlanTime,
    setPlanLocation,
    setLocationType,
    setForgeMode,
    setFixedSize,
    setAutoMinSize,
    setAutoMaxSize,
    setCompatibilityWeight,
    setDiversityWeight,
    setVisibility,
    setCoverImage,
    setAvatarImage,
    setInvitesSent,

    // Actions
    goNext,
    goBack,
    close,
    handleManualForge,
    handleAutoForge,
    handleRemoveParticipant,
    handleRestoreParticipant,
    handleReforge,
    handleCopyLink,
  };
}

export type ForgeWizardState = ReturnType<typeof useForgeWizard>;

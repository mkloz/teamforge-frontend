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
    "MY PLACE" | "TBD" | "VIRTUAL"
  >("TBD");

  // Step 3: Group
  const [forgeMode, setForgeMode] = useState<ForgeMode>("auto");
  const [fixedSize, setFixedSize] = useState<FixedGroupSize>(6);
  const [autoMinSize, setAutoMinSize] = useState(4);
  const [autoMaxSize, setAutoMaxSize] = useState(8);
  const [compatibilityWeight, setCompatibilityWeight] = useState(70);
  const [diversityWeight, setDiversityWeight] = useState(50);
  const [visibility, setVisibility] = useState<Visibility>("friends");

  // Step 4: Post-forge Result
  const [forgeResult, setForgeResult] = useState<ForgeResult>("idle");
  const [participants, setParticipants] = useState(
    MOCK_PARTICIPANTS.slice(0, 5),
  );
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Step 5: Identity
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [avatarImage, setAvatarImage] = useState<string | null>(null);

  // Step 6: Invite
  const [inviteCopied, setInviteCopied] = useState(false);
  const [invitesSent, setInvitesSent] = useState(false);

  // Derived state
  const activeParticipants = participants.filter((p) => !removedIds.has(p.id));
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
    setForgeMode("auto");
    setFixedSize(6);
    setAutoMinSize(4);
    setAutoMaxSize(8);
    setCompatibilityWeight(70);
    setDiversityWeight(50);
    setVisibility("friends");
    setForgeResult("idle");
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
    if (step < 6) setStep((s) => (s + 1) as Step);
  }, [step]);

  const goBack = useCallback(() => {
    setNavDirection("back");
    if (step > 1 && step <= 3) setStep((s) => (s - 1) as Step);
    else if (step === 5) setStep(4);
    else if (step === 6) setStep(5);
  }, [step]);

  const handleManualForge = useCallback(() => {
    setNavDirection("forward");
    setParticipants(MOCK_PARTICIPANTS.slice(0, fixedSize - 1));
    setRemovedIds(new Set());
    setForgeResult("success");
    setStep(4);
  }, [fixedSize]);

  const handleAutoForge = useCallback(() => {
    setNavDirection("forward");
    if (diversityWeight > 80) {
      setForgeResult("failed");
    } else {
      const size = Math.floor((autoMinSize + autoMaxSize) / 2);
      setParticipants(MOCK_PARTICIPANTS.slice(0, size - 1));
      setRemovedIds(new Set());
      setForgeResult("success");
    }
    setStep(4);
  }, [diversityWeight, autoMinSize, autoMaxSize]);

  const handleRemoveParticipant = useCallback((id: string) => {
    setRemovedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id); // re-add
      } else {
        next.add(id); // remove
      }
      return next;
    });
  }, []);

  const handleReforge = useCallback(() => {
    setNavDirection("back");
    setForgeResult("idle");
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
    handleReforge,
    handleCopyLink,
  };
}

export type ForgeWizardState = ReturnType<typeof useForgeWizard>;

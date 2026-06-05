import {
  createForgeParticipant,
  createForgePlanTemplate,
} from "@test/support/factories/forge-wizard";
import { describe, expect, it } from "vitest";
import {
  createInitialForgeWizardState,
  forgeWizardReducer,
} from "@/features/forge/lib/forge-wizard";

describe("forgeWizardReducer", () => {
  it("applies activity templates while clearing stale execution state", () => {
    const state = {
      ...createInitialForgeWizardState(),
      step: 5,
      forgeResult: "SUCCESS",
      participants: [createForgeParticipant()],
      removedIds: new Set(["user-1"]),
      activityId: "activity-1",
      groupId: "group-1",
      chatId: "chat-1",
      planId: "plan-1",
      inviteCopied: true,
      invitesSent: true,
    };
    const template = createForgePlanTemplate({
      fixedSize: 99,
      planCost: "PAID",
      planCostAmount: "12.50",
      planCostDetails: "Tickets bought at the venue",
    });

    const nextState = forgeWizardReducer(state, {
      type: "apply-activity-template",
      template,
      templateId: "template-1",
    });

    expect(nextState).toMatchObject({
      selectedActivity: template.selectedActivity,
      appliedTemplateId: "template-1",
      planName: template.planName,
      planDescription: template.planDescription,
      planDate: "",
      planTime: "",
      planLocation: template.planLocation,
      planLocationLat: template.planLocationLat,
      planLocationLng: template.planLocationLng,
      locationType: template.locationType,
      planCost: "PAID",
      planCostAmount: "12.50",
      planCostDetails: "Tickets bought at the venue",
      forgeMode: template.forgeMode,
      fixedSize: 8,
      visibility: template.visibility,
      groupName: template.groupName,
      groupDescription: template.groupDescription,
      coverImage: template.coverImage,
      templateCoverImage: template.coverImage,
      avatarImage: template.avatarImage,
      forgeResult: "IDLE",
      participants: [],
      activityId: null,
      groupId: null,
      chatId: null,
      planId: null,
      inviteCopied: false,
      invitesSent: false,
    });
    expect(nextState.removedIds.size).toBe(0);
  });

  it("normalizes template fixed size only when the template provides one", () => {
    const state = {
      ...createInitialForgeWizardState(),
      fixedSize: 4 as const,
    };

    const undersizedState = forgeWizardReducer(state, {
      type: "apply-activity-template",
      template: createForgePlanTemplate({ fixedSize: 0 }),
      templateId: "template-undersized",
    });
    const missingSizeState = forgeWizardReducer(state, {
      type: "apply-activity-template",
      template: createForgePlanTemplate({ fixedSize: null }),
      templateId: "template-missing-size",
    });
    const corruptedSizeState = forgeWizardReducer(state, {
      type: "apply-activity-template",
      template: createForgePlanTemplate({ fixedSize: Number.NaN }),
      templateId: "template-corrupted-size",
    });

    expect(undersizedState.fixedSize).toBe(2);
    expect(missingSizeState.fixedSize).toBe(4);
    expect(corruptedSizeState.fixedSize).toBe(6);
  });

  it("clears template-owned fields when the user selects a different activity", () => {
    const state = forgeWizardReducer(createInitialForgeWizardState(), {
      type: "apply-activity-template",
      template: createForgePlanTemplate(),
      templateId: "template-1",
    });

    const nextState = forgeWizardReducer(
      {
        ...state,
        forgeResult: "SUCCESS",
        participants: [createForgeParticipant()],
        activityId: "activity-1",
        groupId: "group-1",
        chatId: "chat-1",
        planId: "plan-1",
        manualInviteeIds: ["friend-1"],
        removedIds: new Set(["user-1"]),
      },
      { type: "select-activity", activity: "Board games" },
    );

    expect(nextState).toMatchObject({
      selectedActivity: "Board games",
      appliedTemplateId: null,
      planName: "",
      planDescription: "",
      planLocation: "",
      forgeResult: "IDLE",
      participants: [],
      activityId: null,
      groupId: null,
      chatId: null,
      planId: null,
      manualInviteeIds: [],
    });
    expect(nextState.removedIds.size).toBe(0);
  });

  it("keeps participant removal immutable and reversible", () => {
    const state = {
      ...createInitialForgeWizardState(),
      removedIds: new Set(["user-1"]),
    };

    const removedState = forgeWizardReducer(state, {
      type: "remove-participant",
      userId: "user-2",
    });
    const restoredState = forgeWizardReducer(removedState, {
      type: "restore-participant",
      userId: "user-1",
    });

    expect([...state.removedIds]).toEqual(["user-1"]);
    expect([...removedState.removedIds]).toEqual(["user-1", "user-2"]);
    expect([...restoredState.removedIds]).toEqual(["user-2"]);
    expect(removedState.removedIds).not.toBe(state.removedIds);
    expect(restoredState.removedIds).not.toBe(removedState.removedIds);
  });

  it("applies forge results to the result step and clears stale removals", () => {
    const participant = createForgeParticipant({ userId: "user-2" });
    const nextState = forgeWizardReducer(
      {
        ...createInitialForgeWizardState(),
        removedIds: new Set(["user-1"]),
      },
      {
        type: "apply-forge-result",
        result: "SUCCESS",
        participants: [participant],
        activityId: "activity-1",
        groupId: "group-1",
        chatId: "chat-1",
        planId: "plan-1",
      },
    );

    expect(nextState).toMatchObject({
      navDirection: "forward",
      step: 5,
      forgeResult: "SUCCESS",
      participants: [participant],
      activityId: "activity-1",
      groupId: "group-1",
      chatId: "chat-1",
      planId: "plan-1",
    });
    expect(nextState.removedIds.size).toBe(0);
  });

  it("keeps explicit step transitions bounded for unsafe runtime action values", () => {
    const state = createInitialForgeWizardState();
    const participant = createForgeParticipant({ userId: "user-2" });

    const setStepState = forgeWizardReducer(state, {
      navDirection: "forward",
      // @ts-expect-error Exercise runtime input that can arrive outside TS.
      step: 999,
      type: "set-step",
    });
    const resultState = forgeWizardReducer(state, {
      activityId: "activity-1",
      chatId: "chat-1",
      groupId: "group-1",
      participants: [participant],
      planId: "plan-1",
      result: "SUCCESS",
      // @ts-expect-error Exercise runtime input that can arrive outside TS.
      step: Number.NaN,
      type: "apply-forge-result",
    });

    expect(setStepState.step).toBe(7);
    expect(resultState.step).toBe(5);
  });

  it("reforges from the result state without losing the selected plan setup", () => {
    const state = {
      ...createInitialForgeWizardState(),
      step: 5,
      selectedActivity: "Dinner",
      planName: "Dinner table",
      forgeResult: "FAILED",
      participants: [createForgeParticipant()],
      manualInviteeIds: ["friend-1"],
      activityId: "activity-1",
      groupId: "group-1",
      chatId: "chat-1",
      planId: "plan-1",
      removedIds: new Set(["user-1"]),
    };

    const nextState = forgeWizardReducer(state, { type: "reforge" });

    expect(nextState).toMatchObject({
      navDirection: "back",
      step: 4,
      selectedActivity: "Dinner",
      planName: "Dinner table",
      forgeResult: "IDLE",
      participants: [],
      manualInviteeIds: [],
      activityId: null,
      groupId: null,
      chatId: null,
      planId: null,
    });
    expect(nextState.removedIds.size).toBe(0);
  });
});

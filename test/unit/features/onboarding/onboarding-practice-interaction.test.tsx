// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OnboardingPractice } from "@/features/onboarding/practice/onboarding-practice";
import { ONBOARDING_PRACTICE_TASKS } from "@/features/onboarding/practice/practice-model";

describe("onboarding practice interaction", () => {
  it("announces a correct answer before moving to the next task", async () => {
    const user = userEvent.setup();
    const firstTask = ONBOARDING_PRACTICE_TASKS[0];
    const nextTask = ONBOARDING_PRACTICE_TASKS[1];
    const correctChoice = firstTask.choices.find(
      (choice) => choice.id === firstTask.correctChoiceId,
    );

    expect(correctChoice).toBeDefined();
    render(
      <OnboardingPractice
        storageKey="test:practice-interaction"
        onComplete={vi.fn<() => void>()}
        onExit={vi.fn<() => void>()}
        onReplay={vi.fn<() => void>()}
        onTaskCompleted={vi.fn<() => void>()}
      />,
    );

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(correctChoice?.label ?? "", "i"),
      }),
    );

    expect(screen.getByText(firstTask.success)).toBeVisible();
    expect(
      screen.getByRole("heading", { name: firstTask.title }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next moment" }));

    expect(
      await screen.findByRole("heading", {
        name: nextTask.title,
      }),
    ).toBeInTheDocument();
  });
});

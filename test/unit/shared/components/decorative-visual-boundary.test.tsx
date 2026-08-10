// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/shared/lib/development-warning", () => ({
  warnInDevelopment: vi.fn<() => void>(),
}));

import { DecorativeVisualBoundary } from "@/shared/components/visuals/decorative-visual-boundary";

function BrokenVisual() {
  throw new Error("optional visual failed");
}

describe("DecorativeVisualBoundary", () => {
  it("contains an optional visual failure without hiding semantic siblings", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <main>
        <h1>Profile ready</h1>
        <DecorativeVisualBoundary>
          <BrokenVisual />
        </DecorativeVisualBoundary>
        <button type="button">Enter Findafew</button>
      </main>,
    );

    expect(
      screen.getByRole("heading", { name: "Profile ready" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Enter Findafew" }),
    ).toBeEnabled();
    consoleError.mockRestore();
  });
});

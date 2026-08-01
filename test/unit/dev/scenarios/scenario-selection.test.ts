import { describe, expect, it } from "vitest";
import { readScenarioDescriptor } from "@/dev/scenarios/runtime/scenario-selection";

describe("scenario selection", () => {
  it("ignores absent activation on non-loopback hosts", () => {
    expect(
      readScenarioDescriptor({ hostname: "teamforge.example", search: "" }),
    ).toBeNull();
  });

  it("reads a deterministic descriptor on loopback", () => {
    expect(
      readScenarioDescriptor({
        hostname: "localhost",
        search:
          "?__scenario=standard&__persona=admin&__overlays=empty,network-slow,empty",
      }),
    ).toEqual({
      id: "standard",
      overlays: ["empty", "network-slow"],
      persona: "admin",
    });
  });

  it("rejects active scenarios away from loopback", () => {
    expect(() =>
      readScenarioDescriptor({
        hostname: "teamforge.example",
        search: "?__scenario=standard",
      }),
    ).toThrow("Scenario Mode can only run on a loopback host.");
  });
});

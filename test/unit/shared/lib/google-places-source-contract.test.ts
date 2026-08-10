import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const frontendRoot = process.cwd();

describe("Google Places source contract", () => {
  it("ships no legacy Places constructors and keeps seven shared surfaces", () => {
    const sourceFiles = globSync("src/**/*.{ts,tsx}", { cwd: frontendRoot });
    const source = sourceFiles
      .map((file) => readFileSync(path.join(frontendRoot, file), "utf8"))
      .join("\n");
    const legacyConstructorNames = [
      ["Autocomplete", "Service"].join(""),
      ["Places", "Service"].join(""),
    ];

    for (const legacyName of legacyConstructorNames) {
      expect(source).not.toContain(`new maps.places.${legacyName}`);
    }

    const renderedSurfaceCount = source.match(
      /<AddressAutocomplete(?:\s|\/|>)/gu,
    )?.length;
    expect(renderedSurfaceCount).toBe(7);
    expect(source).not.toContain("powered-by-google-on-white3.png");
    expect(source).toContain('aria-label="Google Maps"');
    expect(source).toContain('translate="no"');
  });
});

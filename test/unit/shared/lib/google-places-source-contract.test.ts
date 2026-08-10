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

  it("routes dismiss, reset, provider-off, and native-location boundaries through cleanup", () => {
    const autocompleteHook = readSource(
      "src/shared/hooks/use-address-autocomplete.ts",
    );
    const actionsHook = readSource(
      "src/shared/hooks/address-autocomplete/use-address-autocomplete-actions.ts",
    );
    const currentAreaHook = readSource(
      "src/shared/hooks/address-autocomplete/use-current-area-selection.ts",
    );
    const component = readSource(
      "src/shared/components/maps/address-autocomplete/index.tsx",
    );
    const suggestionsHook = readSource(
      "src/shared/hooks/address-autocomplete/use-autocomplete-suggestions.ts",
    );

    expect(autocompleteHook).toContain(
      "closeSuggestions: abandonPlacesSession",
    );
    expect(autocompleteHook).toContain('mapsStatus !== "unavailable"');
    expect(autocompleteHook).toContain("invalidatePredictionResolution();");
    expect(autocompleteHook).toContain("invalidateSuggestionRequests();");
    expect(actionsHook).toContain("continuesPlacesSession");
    expect(currentAreaHook).toContain("endPlacesSession();");
    expect(suggestionsHook).toContain(
      "requestGenerationRef.current === requestGeneration",
    );
    expect(suggestionsHook).toContain(
      "sessionTokenRef.current === requestToken",
    );
    expect(component).toContain("handleInputBlur={handleInputBlur}");
    expect(component).toContain("panelRef.current?.contains(nextTarget)");
  });
});

function readSource(relativePath: string) {
  return readFileSync(path.join(frontendRoot, relativePath), "utf8");
}

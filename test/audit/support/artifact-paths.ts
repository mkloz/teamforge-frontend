import { mkdirSync } from "node:fs";
import path from "node:path";

export function getAuditOutputDir() {
  return (
    process.env.AUDIT_PLAYWRIGHT_OUTPUT_DIR ??
    path.join(process.cwd(), "reports", "playwright-audit")
  );
}

export function getRouteScreenshotPath(outputDir: string, slug: string) {
  const screenshotDir = path.join(outputDir, "screenshots");

  mkdirSync(screenshotDir, { recursive: true });

  return path.join(screenshotDir, `${slug}.png`);
}

export function getRouteResultPath(outputDir: string, slug: string) {
  const routeDir = path.join(outputDir, "routes");

  mkdirSync(routeDir, { recursive: true });

  return path.join(routeDir, `${slug}.json`);
}

export function getAccessibilityResultPath(outputDir: string, slug: string) {
  const accessibilityDir = path.join(outputDir, "accessibility");

  mkdirSync(accessibilityDir, { recursive: true });

  return path.join(accessibilityDir, `${slug}.json`);
}

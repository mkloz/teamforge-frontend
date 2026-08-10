import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

export default class SanitizedScenarioReporter {
  constructor() {
    this.startedAt = Date.now();
    this.enumerated = 0;
    this.results = new Map();
  }

  onBegin(_config, suite) {
    this.startedAt = Date.now();
    this.enumerated = suite.allTests().length;
  }

  onTestEnd(test, result) {
    const skipAnnotation = [...test.annotations]
      .reverse()
      .find((annotation) => annotation.type === "skip");
    const projectName = test.parent.project()?.name ?? "unknown-project";
    this.results.set(`${projectName}\0${test.id}`, {
      category: path.basename(test.location.file).replace(/\.spec\.ts$/u, ""),
      intentionalSkip: result.status === "skipped" && Boolean(skipAnnotation),
      skipReason:
        result.status === "skipped"
          ? skipAnnotation?.description || "unannotated skip"
          : null,
      status: result.status,
    });
  }

  async onEnd(result) {
    const outputPath = process.env.SCENARIO_SANITIZED_REPORTER_OUTPUT;
    if (!outputPath) return;

    const observed = [...this.results.values()];
    const statusCounts = countBy(observed, ({ status }) => status);
    const skipped = observed.filter(({ status }) => status === "skipped");
    const intentionalSkips = skipped.filter(({ intentionalSkip }) =>
      Boolean(intentionalSkip),
    );
    const summary = {
      schemaVersion: "1.0.0",
      generatedAt: new Date().toISOString(),
      enumerated: this.enumerated,
      observed: observed.length,
      executed: observed.filter(({ status }) => status !== "skipped").length,
      passed: statusCounts.passed ?? 0,
      failed:
        (statusCounts.failed ?? 0) +
        (statusCounts.timedOut ?? 0) +
        (statusCounts.interrupted ?? 0),
      intentionalSkipCount: intentionalSkips.length,
      unintentionalSkipCount: skipped.length - intentionalSkips.length,
      skipReasonCounts: countBy(
        intentionalSkips,
        ({ skipReason }) => skipReason,
      ),
      skipCategoryCounts: countBy(intentionalSkips, ({ category }) => category),
      durationMs: Date.now() - this.startedAt,
      playwrightStatus: result.status,
    };

    mkdirSync(path.dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
  }
}

function countBy(values, getKey) {
  return Object.fromEntries(
    [
      ...values.reduce((counts, value) => {
        const key = getKey(value);
        counts.set(key, (counts.get(key) ?? 0) + 1);
        return counts;
      }, new Map()),
    ].sort(([left], [right]) =>
      String(left).localeCompare(String(right), "en"),
    ),
  );
}

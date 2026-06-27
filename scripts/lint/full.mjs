#!/usr/bin/env node
// @ts-check

import {
  resolveNodeScript,
  resolvePackageBin,
} from "../shared/command-utils.mjs";
import { runCommandStages } from "../shared/stage-runner.mjs";

/** @type {readonly import("../shared/stage-runner.mjs").CommandStage[]} */
const stages = [
  {
    args: [
      "--config",
      ".oxlintrc.json",
      "--format",
      "stylish",
      "--no-error-on-unmatched-pattern",
      ".",
    ],
    label: "Oxlint",
    name: "oxlint",
    spec: resolvePackageBin("oxlint"),
  },
  {
    label: "React Compiler tracker",
    name: "react-compiler",
    spec: resolvePackageBin(
      "@doist/react-compiler-tracker",
      "react-compiler-tracker",
    ),
  },
  {
    args: ["check", "--no-errors-on-unmatched", "."],
    label: "Biome",
    name: "biome",
    spec: resolvePackageBin("@biomejs/biome", "biome"),
  },
  {
    args: ["--config", ".dependency-cruiser.cjs", "src", "vite.config.ts"],
    label: "dependency-cruiser",
    name: "architecture",
    spec: resolvePackageBin("dependency-cruiser", "depcruise"),
  },
  {
    label: "Fallow",
    name: "fallow",
    spec: resolveNodeScript("scripts/lint/fallow.mjs"),
  },
  {
    args: ["-b"],
    label: "TypeScript",
    name: "typecheck",
    spec: resolvePackageBin("typescript", "tsc"),
  },
];

process.exitCode = await runCommandStages(stages, {
  title: "Full Lint Gate",
});

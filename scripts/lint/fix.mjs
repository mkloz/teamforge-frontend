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
    args: ["check", "--write", "--unsafe", "--no-errors-on-unmatched", "."],
    label: "Biome safe fixes",
    name: "biome-fix",
    spec: resolvePackageBin("@biomejs/biome", "biome"),
  },
  {
    args: ["format", "--write", "--no-errors-on-unmatched", "."],
    label: "Biome format",
    name: "biome-format",
    spec: resolvePackageBin("@biomejs/biome", "biome"),
  },
  {
    label: "Knip",
    name: "knip",
    spec: resolveNodeScript("scripts/lint/knip.mjs"),
  },
];

process.exitCode = await runCommandStages(stages, {
  title: "Lint Fix Gate",
});

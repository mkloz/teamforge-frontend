#!/usr/bin/env node
// @ts-check

import { resolveNodeScript, resolvePathBin } from "../shared/command-utils.mjs";
import { runCommandStages } from "../shared/stage-runner.mjs";

/** @type {readonly import("../shared/stage-runner.mjs").CommandStage[]} */
const stages = [
  {
    args: ["--check"],
    label: "Deterministic install-preview assets",
    name: "install-previews",
    spec: resolveNodeScript("scripts/pwa/generate-install-previews.mjs"),
  },
  {
    label: "Production PWA env preflight",
    name: "pwa-env",
    spec: resolveNodeScript("scripts/pwa/production-env.mjs"),
  },
  {
    args: ["run", "build"],
    label: "Production build",
    name: "build",
    spec: resolvePathBin("npm"),
  },
  {
    label: "Production PWA QA",
    name: "pwa-qa",
    spec: resolveNodeScript("scripts/pwa/qa.mjs"),
  },
];

process.exitCode = await runCommandStages(stages, {
  title: "PWA Release Gate",
});

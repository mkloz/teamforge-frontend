import type { ScenarioController } from "@/dev/scenarios/runtime/scenario-controller";

let activeController: ScenarioController | null = null;

export function getScenarioController() {
  return activeController;
}

export function setScenarioController(controller: ScenarioController | null) {
  activeController = controller;
}

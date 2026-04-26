import { RUNNING_VELOCITY_THRESHOLD, THIRSTY_THRESHOLD } from "../../constants";

export function isRunning(velocity: number): boolean {
  return velocity > RUNNING_VELOCITY_THRESHOLD;
}

export function isThirsty(thirst: number): boolean {
  return thirst <= THIRSTY_THRESHOLD;
}

export function paceLabel(velocity: number): "Running" | "Walking" {
  return isRunning(velocity) ? "Running" : "Walking";
}

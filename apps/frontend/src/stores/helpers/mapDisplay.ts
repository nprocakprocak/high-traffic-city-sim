import { MAP_MAX_DISPLAYED_PEDESTRIANS } from "../../constants";

export function nextMapDisplayedPedestrianIds(pedestrianIds: string[]): string[] {
  if (pedestrianIds.length <= MAP_MAX_DISPLAYED_PEDESTRIANS) {
    return pedestrianIds;
  }

  return pedestrianIds.slice(-MAP_MAX_DISPLAYED_PEDESTRIANS);
}

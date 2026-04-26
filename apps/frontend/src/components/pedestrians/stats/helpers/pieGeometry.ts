import type { Pedestrian } from "@high-traffic-city-sim/types";
import { getMoodCount } from "../../../../domain/pedestrians/stats";
import { MOOD_COLORS, MOOD_ORDER, PIE_CENTER, PIE_RADIUS } from "../constants";
import type { PedestrianStatsMoodCounters } from "../../../../types/pedestrianStats";

const TAU = 2 * Math.PI;
const CENTER = PIE_CENTER;
const R = PIE_RADIUS;
const EPS = 1e-9;

/** One pizza slice: center → start on rim → outer arc to end → close. */
export function pieSlicePath(
  startAngle: number,
  endAngle: number,
  cx: number = CENTER,
  cy: number = CENTER,
  r: number = R,
): string {
  const span = endAngle - startAngle;
  if (span <= EPS) {
    return "";
  }
  if (span >= TAU - EPS) {
    return fullPieFromCenterPath(cx, cy, r);
  }
  const x0 = cx + r * Math.cos(startAngle);
  const y0 = cy + r * Math.sin(startAngle);
  const x1 = cx + r * Math.cos(endAngle);
  const y1 = cy + r * Math.sin(endAngle);
  const large = span > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

/** 360° slice: two semicircular outer arcs, closed to center. */
function fullPieFromCenterPath(cx: number, cy: number, r: number): string {
  const yTop = cy - r;
  const yBottom = cy + r;
  return `M ${cx} ${cy} L ${cx} ${yTop} A ${r} ${r} 0 1 1 ${cx} ${yBottom} A ${r} ${r} 0 1 1 ${cx} ${yTop} Z`;
}

export interface MoodPieSlice {
  mood: Pedestrian["mood"];
  d: string;
  color: string;
}

/**
 * Slices in display order, starting at 12 o'clock, clockwise, same order as the legend.
 */
export function buildMoodPieSlices(
  totalCount: number,
  moodCounters: PedestrianStatsMoodCounters,
): MoodPieSlice[] {
  if (totalCount <= 0) {
    return [];
  }
  const slices: MoodPieSlice[] = [];
  let angle = -Math.PI / 2;

  for (const mood of MOOD_ORDER) {
    const count = getMoodCount(mood, moodCounters);
    const share = count / totalCount;
    const start = angle;
    const end = start + TAU * share;
    if (share > 0) {
      const d = pieSlicePath(start, end);
      if (d) {
        slices.push({ mood, d, color: MOOD_COLORS[mood] });
      }
    }
    angle = end;
  }

  return slices;
}

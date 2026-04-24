import { PIE_CENTER, PIE_RADIUS } from "../constants";

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

/**
 * One circular arc in the current SVG subpath, ending at a given angle.
 * We keep each segment to <= 180° so the SVG `large-arc` flag never has to
 * switch at the threshold (avoids a “spinning / flipping” look when animating).
 */
function appendArcToEnd(parts: string[], endAngle: number) {
  const p = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, endAngle);
  parts.push(`A ${PIE_RADIUS} ${PIE_RADIUS} 0 0 1 ${p.x} ${p.y}`);
}

/**
 * Wedge from startAngle to endAngle. Long arcs are split so each A segment is
 * at most 180°; the last point uses `endAngle` to avoid a gap at float errors.
 */
export function describePieSlice(startAngle: number, endAngle: number): string {
  const span = endAngle - startAngle;
  if (span <= 0) {
    return `M ${PIE_CENTER} ${PIE_CENTER} Z`;
  }

  const cappedSpan = Math.min(span, 360);
  const n = Math.max(1, Math.ceil(cappedSpan / 180));
  const step = cappedSpan / n;

  const p0 = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, startAngle);
  const parts: string[] = [
    `M ${PIE_CENTER} ${PIE_CENTER}`,
    `L ${p0.x} ${p0.y}`,
  ];

  for (let k = 0; k < n; k++) {
    const segEnd = k === n - 1 ? endAngle : startAngle + step * (k + 1);
    appendArcToEnd(parts, segEnd);
  }

  parts.push("Z");
  return parts.join(" ");
}

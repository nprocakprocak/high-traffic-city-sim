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

export function describePieSlice(startAngle: number, endAngle: number): string {
  const boundedEndAngle = Math.min(endAngle, startAngle + 359.999);
  const start = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, startAngle);
  const end = polarToCartesian(PIE_CENTER, PIE_CENTER, PIE_RADIUS, boundedEndAngle);
  const largeArcFlag = boundedEndAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${PIE_CENTER} ${PIE_CENTER}`,
    `L ${start.x} ${start.y}`,
    `A ${PIE_RADIUS} ${PIE_RADIUS} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    "Z",
  ].join(" ");
}

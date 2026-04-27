import { Pedestrian } from "@high-traffic-city-sim/types";
import { memo, useEffect, useRef } from "react";
import { CITY_CELL_SIZE, MOOD_EMOJI_MAP } from "../constants";
import { getPrefersReducedMotion } from "../utils/prefersReducedMotion";

interface PedestrianIconProps {
  pedestrian: Pedestrian;
  onFinish: (id: string) => void;
}

function velocityToPlaybackRate(velocity: number): number {
  // Keep a conservative range to avoid jarring speed jumps.
  return Math.min(2, Math.max(0.5, velocity / 5));
}

function PedestrianIconComponent({ pedestrian, onFinish }: PedestrianIconProps) {
  const iconRef = useRef<HTMLDivElement | null>(null);
  const onFinishRef = useRef(onFinish);
  const animationRef = useRef<Animation | null>(null);
  const playbackRateRef = useRef(velocityToPlaybackRate(pedestrian.velocity));

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const animation = animationRef.current;
    const playbackRate = velocityToPlaybackRate(pedestrian.velocity);
    playbackRateRef.current = playbackRate;
    if (!animation) return;
    animation.playbackRate = playbackRate;
  }, [pedestrian.velocity]);

  useEffect(() => {
    const element = iconRef.current;
    const points = pedestrian.pathPoints;
    if (!element || !points || points.length === 0) {
      return;
    }

    const [start, ...rest] = points;
    if (!start) return;

    element.style.transform = `translate3d(${start.x - CITY_CELL_SIZE / 2}px, ${start.y - CITY_CELL_SIZE / 2}px, 0)`;
    if (rest.length === 0) {
      onFinishRef.current(pedestrian.id);
      return;
    }

    if (getPrefersReducedMotion()) {
      return;
    }

    const segmentDuration = 180;
    const totalDuration = rest.length * segmentDuration;
    const keyframes = points.map((point) => ({
      transform: `translate3d(${point.x - CITY_CELL_SIZE / 2}px, ${point.y - CITY_CELL_SIZE / 2}px, 0)`,
    }));

    const animation = element.animate(keyframes, {
      duration: totalDuration,
      easing: "linear",
      fill: "forwards",
    });
    animation.playbackRate = playbackRateRef.current;
    animationRef.current = animation;

    animation.onfinish = () => {
      animationRef.current = null;
      onFinishRef.current(pedestrian.id);
    };

    return () => {
      animation.cancel();
      if (animationRef.current === animation) {
        animationRef.current = null;
      }
    };
  }, [pedestrian.id, pedestrian.pathPoints]);

  return (
    <div
      ref={iconRef}
      aria-hidden
      style={{
        width: `${CITY_CELL_SIZE}px`,
        height: `${CITY_CELL_SIZE}px`,
        fontSize: `${CITY_CELL_SIZE}px`,
        lineHeight: `${CITY_CELL_SIZE}px`,
        willChange: "transform",
      }}
      className="absolute left-0 top-0 flex cursor-default items-center justify-center"
    >
      {MOOD_EMOJI_MAP[pedestrian.mood]}
    </div>
  );
}

export const PedestrianIcon = memo(PedestrianIconComponent);

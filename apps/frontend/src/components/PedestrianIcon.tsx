import { Pedestrian } from "@high-traffic-city-sim/types";
import { memo, useEffect, useRef } from "react";
import { CITY_CELL_SIZE } from "../constants";

interface PedestrianIconProps {
  pedestrian: Pedestrian;
  onFinish: (id: string) => void;
}

function PedestrianIconComponent({ pedestrian, onFinish }: PedestrianIconProps) {
  const iconRef = useRef<HTMLDivElement | null>(null);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

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

    const segmentDuration = Math.max(80, 260 - pedestrian.velocity * 15);
    const totalDuration = rest.length * segmentDuration;
    const keyframes = points.map((point) => ({
      transform: `translate3d(${point.x - CITY_CELL_SIZE / 2}px, ${point.y - CITY_CELL_SIZE / 2}px, 0)`,
    }));

    const animation = element.animate(keyframes, {
      duration: totalDuration,
      easing: "linear",
      fill: "forwards",
    });

    animation.onfinish = () => {
      onFinishRef.current(pedestrian.id);
    };

    return () => {
      animation.cancel();
    };
  }, [pedestrian.id, pedestrian.pathPoints, pedestrian.velocity]);

  return (
    <div
      ref={iconRef}
      style={{
        width: CITY_CELL_SIZE + "px",
        height: CITY_CELL_SIZE + "px",
        willChange: "transform",
      }}
      className="absolute left-0 top-0 flex items-center justify-center text-[10px] leading-[10px] cursor-default"
    >
      🙂
    </div>
  );
}

export const PedestrianIcon = memo(PedestrianIconComponent);

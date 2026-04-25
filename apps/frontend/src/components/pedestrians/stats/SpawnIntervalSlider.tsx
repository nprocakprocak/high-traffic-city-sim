import type { ChangeEvent } from "react";

const MIN_MULT = 1;
const MAX_MULT = 20;
const STEP = 1;

const uiPositionFromMult = (mult: number) => MAX_MULT + MIN_MULT - mult;
const multFromUiPosition = (pos: number) => MAX_MULT + MIN_MULT - pos;

interface SpawnIntervalSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function SpawnIntervalSlider({ value, onChange }: SpawnIntervalSliderProps) {
  const uiValue = uiPositionFromMult(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(multFromUiPosition(Number(e.target.value)));
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-2">
      <div className="flex w-full min-w-0 max-w-full items-center gap-3">
        <input
          type="range"
          className="min-w-0 w-full max-w-full cursor-pointer accent-violet-400"
          min={MIN_MULT}
          max={MAX_MULT}
          step={STEP}
          value={uiValue}
          onChange={handleChange}
          aria-label="Adjust pedestrian spawn interval. Right is faster, left is slower"
          aria-valuemin={MIN_MULT}
          aria-valuemax={MAX_MULT}
          aria-valuenow={uiValue}
          aria-labelledby="spawn-interval-min-label spawn-interval-max-label"
        />
      </div>
    </div>
  );
}

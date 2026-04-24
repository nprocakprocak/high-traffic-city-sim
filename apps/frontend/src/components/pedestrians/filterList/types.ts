export interface PedestrianFilterListProps {
  totalCount: number;
  paceCounters: {
    runningCount: number;
    walkingCount: number;
  };
  moodCounters: {
    happyCount: number;
    sadCount: number;
    angryCount: number;
    excitedCount: number;
    scaredCount: number;
    shockedCount: number;
  };
  thirstCounters: {
    thirstyCount: number;
    notThirstyCount: number;
  };
}

export type MoodCountersShape = PedestrianFilterListProps["moodCounters"];

export interface PedestrianRowListProps {
  getPedestrianId: (index: number) => string | undefined;
}

export interface PedestrianFilterSelection {
  mood: "all" | "happy" | "sad" | "angry" | "excited" | "scared" | "shocked";
  pace: "all" | "running" | "walking";
  thirst: "all" | "thirsty" | "notThirsty";
}

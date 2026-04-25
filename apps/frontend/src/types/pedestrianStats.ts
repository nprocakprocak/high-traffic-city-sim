export interface PedestrianStatsMoodCounters {
  happyCount: number;
  sadCount: number;
  angryCount: number;
  excitedCount: number;
  scaredCount: number;
  shockedCount: number;
}

export interface PedestrianStatsPaceCounters {
  runningCount: number;
  walkingCount: number;
}

export interface PedestrianStatsThirstCounters {
  thirstyCount: number;
  notThirstyCount: number;
}

export interface PedestrianStatsSummary {
  totalCount: number;
  pace: PedestrianStatsPaceCounters;
  mood: PedestrianStatsMoodCounters;
  thirst: PedestrianStatsThirstCounters;
}

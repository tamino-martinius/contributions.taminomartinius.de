export interface Dict<T> {
  [key: string]: T;
}

export interface Totals {
  additions: number;
  deletions: number;
  changedFiles: number;
  commitCount: number;
}

export interface WeekDayStats extends Totals {
  hours: Dict<Totals>;
}

export interface TimeStats {
  quarterly: Dict<Totals>;
  hourly: Dict<Totals>;
  daily: Dict<Totals>;
  weekly: Dict<Totals>;
  monthly: Dict<Totals>;
  yearly: Dict<Totals>;
  weekDays: Dict<WeekDayStats>;
}

import type { Event } from "@/data/normalized/schema";

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface ScoredEvent {
  event: Event;
  score: number;
  reasons: string[];
  conflictsWithBusyTime: boolean;
}

export interface ScheduleRecommendation {
  recommended: ScoredEvent[];
  filtered: ScoredEvent[];
}

export interface UserPreferences {
  favorite_sports: string[];
  prefer_home_games: boolean;
  prefer_rivalry_games: boolean;
  preferred_time_slots: string[];
  max_events_per_week: number;
  auto_add_to_calendar: boolean;
}

export interface BusyTime {
  source: string;
  title: string;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  start_datetime: string | null;
  end_datetime: string | null;
  recurring: boolean;
}

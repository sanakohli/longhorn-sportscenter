import type { Event } from "@/data/normalized/schema";
import { RIVALRY_OPPONENTS, SPORTS } from "@/lib/constants";
import { fromZonedTime } from "date-fns-tz";
import type {
  ScoredEvent,
  ScheduleRecommendation,
  UserPreferences,
  BusyTime,
} from "./types";

function getEventDateTime(event: Event): Date | null {
  if (!event.startTime) return null;
  return fromZonedTime(event.startTime, "America/New_York");
}

function getTimeSlotForHour(hour: number): string {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function getWeekKey(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export function hasTimeConflict(
  eventStart: Date,
  eventEnd: Date,
  busyTimes: BusyTime[]
): boolean {
  return findConflictTitle(eventStart, eventEnd, busyTimes) !== null;
}

export function findConflictTitle(
  eventStart: Date,
  eventEnd: Date,
  busyTimes: BusyTime[]
): string | null {
  for (const bt of busyTimes) {
    if (bt.recurring && bt.day_of_week !== null && bt.start_time && bt.end_time) {
      // Recurring busy time: check day of week and time overlap
      if (eventStart.getDay() === bt.day_of_week) {
        const [bStartH, bStartM] = bt.start_time.split(":").map(Number);
        const [bEndH, bEndM] = bt.end_time.split(":").map(Number);

        const busyStart = new Date(eventStart);
        busyStart.setHours(bStartH, bStartM, 0, 0);
        const busyEnd = new Date(eventStart);
        busyEnd.setHours(bEndH, bEndM, 0, 0);

        if (eventStart < busyEnd && eventEnd > busyStart) {
          return bt.title;
        }
      }
    } else if (bt.start_datetime && bt.end_datetime) {
      // One-time busy time
      const busyStart = new Date(bt.start_datetime);
      const busyEnd = new Date(bt.end_datetime);
      if (eventStart < busyEnd && eventEnd > busyStart) {
        return bt.title;
      }
    }
  }
  return null;
}

export function generateRecommendations(
  events: Event[],
  preferences: UserPreferences,
  busyTimes: BusyTime[],
  addedEventIds: Set<string>
): ScheduleRecommendation {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sportPriority = preferences.favorite_sports;

  const scored: ScoredEvent[] = [];

  for (const event of events) {
    const eventStart = getEventDateTime(event);
    if (!eventStart || eventStart < now) continue;
    if (!preferences.favorite_sports.includes(event.sport)) continue;

    // Already added events get filtered out from recommendations
    if (addedEventIds.has(event.id)) continue;

    const sport = SPORTS[event.sport];
    const durationMs =
      (event.estimatedDurationMinutes ?? sport.estimatedDurationMinutes) *
      60 *
      1000;
    const eventEnd = new Date(eventStart.getTime() + durationMs);

    let score = 0;
    const reasons: string[] = [];

    // Home game bonus
    if (event.homeAway === "home" && preferences.prefer_home_games) {
      score += 15;
      reasons.push("Home game");
    }

    // Rivalry bonus
    const isRivalry = RIVALRY_OPPONENTS.some(
      (opp) =>
        event.opponent.toLowerCase().includes(opp.toLowerCase())
    );
    if (isRivalry && preferences.prefer_rivalry_games) {
      score += 20;
      reasons.push("Rivalry game");
    }

    // Time slot match
    const hour = eventStart.getHours();
    const slot = getTimeSlotForHour(hour);
    if (preferences.preferred_time_slots.includes(slot)) {
      score += 10;
      reasons.push("Fits your preferred time");
    }

    // Sport priority
    const priorityIndex = sportPriority.indexOf(event.sport);
    if (priorityIndex !== -1) {
      const priorityScore = Math.max(0, 10 - priorityIndex * 2);
      score += priorityScore;
      if (priorityIndex === 0) reasons.push("Top sport pick");
    }

    // Big Ticket bonus
    if (event.bigTicketRequired) {
      score += 5;
      reasons.push("Big Ticket event");
    }

    // Coming up soon bonus
    if (eventStart <= sevenDaysFromNow) {
      score += 5;
      reasons.push("Coming up soon");
    }

    // Check conflicts
    const conflictTitle = findConflictTitle(
      eventStart,
      eventEnd,
      busyTimes
    );
    const conflictsWithBusyTime = conflictTitle !== null;

    if (conflictsWithBusyTime) {
      score -= 50;
      reasons.push(`Conflicts with ${conflictTitle}`);
    }

    scored.push({ event, score, reasons, conflictsWithBusyTime });
  }

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Cap per week
  const weekCounts: Record<string, number> = {};
  const recommended: ScoredEvent[] = [];
  const filtered: ScoredEvent[] = [];

  for (const item of scored) {
    if (item.conflictsWithBusyTime) {
      filtered.push(item);
      continue;
    }

    const eventStart = getEventDateTime(item.event);
    if (!eventStart) continue;

    const weekKey = getWeekKey(eventStart);
    const weekCount = weekCounts[weekKey] ?? 0;

    if (weekCount < preferences.max_events_per_week) {
      recommended.push(item);
      weekCounts[weekKey] = weekCount + 1;
    } else {
      filtered.push(item);
    }
  }

  return { recommended, filtered };
}

export function getEventConflicts(
  events: Event[],
  busyTimes: BusyTime[]
): Record<string, string> {
  if (busyTimes.length === 0) return {};

  const now = new Date();
  const conflicts: Record<string, string> = {};

  for (const event of events) {
    const eventStart = getEventDateTime(event);
    if (!eventStart || eventStart < now) continue;

    const sport = SPORTS[event.sport];
    const durationMs =
      (event.estimatedDurationMinutes ?? sport.estimatedDurationMinutes) *
      60 *
      1000;
    const eventEnd = new Date(eventStart.getTime() + durationMs);

    const title = findConflictTitle(eventStart, eventEnd, busyTimes);
    if (title !== null) {
      conflicts[event.id] = title;
    }
  }

  return conflicts;
}

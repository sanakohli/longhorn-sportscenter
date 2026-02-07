"use client";

import EventCard from "./EventCard";
import type { Event } from "@/data/normalized/schema";

interface ScoredEventItem {
  event: Event;
  score: number;
  reasons: string[];
}

interface EventListProps {
  events: (Event | ScoredEventItem)[];
  addedEventIds: Set<string>;
  eventConflicts?: Map<string, string>;
  onAdd: (eventId: string) => Promise<void>;
  onRemove: (eventId: string) => Promise<void>;
  showReasons?: boolean;
  emptyMessage?: string;
}

function isScoredEvent(
  item: Event | ScoredEventItem
): item is ScoredEventItem {
  return "score" in item && "reasons" in item;
}

export default function EventList({
  events,
  addedEventIds,
  eventConflicts,
  onAdd,
  onRemove,
  showReasons = false,
  emptyMessage = "No events to show.",
}: EventListProps) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-8 text-center">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((item) => {
        const event = isScoredEvent(item) ? item.event : item;
        const reasons = isScoredEvent(item) ? item.reasons : undefined;
        const score = isScoredEvent(item) ? item.score : undefined;

        return (
          <EventCard
            key={event.id}
            event={event}
            reasons={reasons}
            score={score}
            isAdded={addedEventIds.has(event.id)}
            conflictLabel={eventConflicts?.get(event.id)}
            onAdd={onAdd}
            onRemove={onRemove}
            showReasons={showReasons}
          />
        );
      })}
    </div>
  );
}

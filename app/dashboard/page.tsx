"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import EventList from "@/components/EventList";
import SportFilter from "@/components/SportFilter";
import CalendarSync from "@/components/CalendarSync";
import ScheduleUpload from "@/components/ScheduleUpload";
import { events as allEvents } from "@/app/events";
import type { Event, Sport } from "@/data/normalized/schema";
import { ALL_SPORTS } from "@/lib/constants";

interface ScoredEvent {
  event: Event;
  score: number;
  reasons: string[];
  conflictsWithBusyTime: boolean;
}

interface Recommendations {
  recommended: ScoredEvent[];
  filtered: ScoredEvent[];
  addedEventIds: string[];
  eventConflicts: Record<string, string>;
}

type ViewTab = "recommended" | "all" | "timeline";

export default function DashboardPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewTab>("recommended");
  const [sportFilter, setSportFilter] = useState<Set<Sport>>(
    new Set(ALL_SPORTS)
  );
  const [recommendations, setRecommendations] =
    useState<Recommendations | null>(null);
  const [addedEventIds, setAddedEventIds] = useState<Set<string>>(new Set());
  const [eventConflicts, setEventConflicts] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await fetch("/api/recommend");
      if (res.ok) {
        const data: Recommendations = await res.json();
        setRecommendations(data);
        setAddedEventIds(new Set(data.addedEventIds ?? []));
        setEventConflicts(new Map(Object.entries(data.eventConflicts ?? {})));
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchRecommendations();
      setLoading(false);
    }
    load();
  }, [fetchRecommendations]);

  async function handleAdd(eventId: string) {
    const res = await fetch("/api/calendar/write", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) {
      setAddedEventIds((prev) => new Set([...prev, eventId]));
    }
  }

  async function handleRemove(eventId: string) {
    const res = await fetch("/api/calendar/remove", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId }),
    });
    if (res.ok) {
      setAddedEventIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  }

  // Filter events for "all" and "timeline" views
  const now = new Date();
  const filteredAllEvents = allEvents.filter(
    (e) =>
      sportFilter.has(e.sport) &&
      new Date(e.date) >= now
  );

  // Sort chronologically for timeline
  const timelineEvents = [...filteredAllEvents].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const tabClass = (tab: ViewTab) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      view === tab
        ? "bg-[#BF5700] text-white"
        : "bg-white text-gray-600 hover:bg-gray-100"
    }`;

  return (
    <div>
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Hey{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-gray-600">
          Here are your recommended Longhorns games.
        </p>
      </div>

      {/* Sync & Upload */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <CalendarSync onSync={fetchRecommendations} />
        <ScheduleUpload />
      </div>

      {/* View tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("recommended")}
          className={tabClass("recommended")}
        >
          Recommended
        </button>
        <button
          onClick={() => setView("all")}
          className={tabClass("all")}
        >
          All Games
        </button>
        <button
          onClick={() => setView("timeline")}
          className={tabClass("timeline")}
        >
          Timeline
        </button>
      </div>

      {/* Sport filter (for all/timeline views) */}
      {view !== "recommended" && (
        <div className="mb-4">
          <SportFilter selected={sportFilter} onChange={setSportFilter} />
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Loading recommendations...
        </div>
      ) : view === "recommended" ? (
        <EventList
          events={recommendations?.recommended ?? []}
          addedEventIds={addedEventIds}
          eventConflicts={eventConflicts}
          onAdd={handleAdd}
          onRemove={handleRemove}
          showReasons
          emptyMessage="No recommendations yet. Try syncing your calendar or updating your preferences."
        />
      ) : view === "all" ? (
        <EventList
          events={filteredAllEvents}
          addedEventIds={addedEventIds}
          eventConflicts={eventConflicts}
          onAdd={handleAdd}
          onRemove={handleRemove}
          emptyMessage="No upcoming games match your filters."
        />
      ) : (
        <EventList
          events={timelineEvents}
          addedEventIds={addedEventIds}
          eventConflicts={eventConflicts}
          onAdd={handleAdd}
          onRemove={handleRemove}
          emptyMessage="No upcoming games match your filters."
        />
      )}
    </div>
  );
}

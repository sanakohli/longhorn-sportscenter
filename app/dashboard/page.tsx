"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import EventList from "@/components/EventList";
import SportFilter from "@/components/SportFilter";
import CalendarSync from "@/components/CalendarSync";
import SocialFeed from "@/components/SocialFeed";
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
type RecSubTab = "all" | "home" | "away";

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
  const [recSubTab, setRecSubTab] = useState<RecSubTab>("all");
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

  // Filter recommended events by home/away sub-tab
  const filteredRecommended = (recommendations?.recommended ?? []).filter(
    (item) =>
      recSubTab === "all" ||
      (recSubTab === "home" && item.event.homeAway === "home") ||
      (recSubTab === "away" && item.event.homeAway === "away")
  );

  const tabClass = (tab: ViewTab) =>
    `px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
      view === tab
        ? "bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white shadow-md shadow-[#BF5700]/20"
        : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
    }`;

  const subTabClass = (tab: RecSubTab) =>
    `px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
      recSubTab === tab
        ? "bg-[#BF5700]/10 text-[#BF5700] border border-[#BF5700]/20"
        : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <div className="flex gap-8">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Greeting + Calendar sync */}
        <div className="flex items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Hey{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}!
            </h1>
            <p className="text-gray-500 mt-1">
              Here are your recommended Longhorns games.
            </p>
          </div>
          <CalendarSync onSync={fetchRecommendations} />
        </div>

        {/* View tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setView("recommended")}
            className={tabClass("recommended")}
          >
            Recommended
          </button>
          <button
            onClick={() => setView("timeline")}
            className={tabClass("timeline")}
          >
            Timeline
          </button>
          <button
            onClick={() => setView("all")}
            className={tabClass("all")}
          >
            All Games
          </button>
        </div>

        {/* Sub-tabs for recommended view */}
        {view === "recommended" && (
          <div className="flex gap-2 mb-4">
            <button onClick={() => setRecSubTab("all")} className={subTabClass("all")}>
              All
            </button>
            <button onClick={() => setRecSubTab("home")} className={subTabClass("home")}>
              Home
            </button>
            <button onClick={() => setRecSubTab("away")} className={subTabClass("away")}>
              Away
            </button>
          </div>
        )}

        {/* Sport filter (for all/timeline views) */}
        {view !== "recommended" && (
          <div className="mb-4">
            <SportFilter selected={sportFilter} onChange={setSportFilter} />
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <div className="inline-flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#BF5700] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Loading recommendations...</span>
            </div>
          </div>
        ) : view === "recommended" ? (
          <EventList
            events={filteredRecommended}
            addedEventIds={addedEventIds}
            eventConflicts={eventConflicts}
            onAdd={handleAdd}
            onRemove={handleRemove}
            showReasons
            emptyMessage={
              recSubTab === "all"
                ? "No recommendations yet. Try syncing your calendar or updating your preferences."
                : `No ${recSubTab} game recommendations.`
            }
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

      {/* Sidebar */}
      <div className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-6">
          <SocialFeed />
        </div>
      </div>
    </div>
  );
}

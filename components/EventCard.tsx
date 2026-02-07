"use client";

import { useState } from "react";
import { CalendarPlus, CalendarCheck, Loader2 } from "lucide-react";
import { SPORTS } from "@/lib/constants";
import { formatCentralTime } from "@/app/time";
import type { Event } from "@/data/normalized/schema";

interface EventCardProps {
  event: Event;
  reasons?: string[];
  score?: number;
  isAdded?: boolean;
  conflictLabel?: string;
  onAdd?: (eventId: string) => Promise<void>;
  onRemove?: (eventId: string) => Promise<void>;
  showReasons?: boolean;
}

export default function EventCard({
  event,
  reasons,
  score,
  isAdded = false,
  conflictLabel,
  onAdd,
  onRemove,
  showReasons = false,
}: EventCardProps) {
  const hasConflict = conflictLabel !== undefined;
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(isAdded);
  const sport = SPORTS[event.sport];

  async function handleToggle() {
    setLoading(true);
    try {
      if (added && onRemove) {
        await onRemove(event.id);
        setAdded(false);
      } else if (!added && onAdd) {
        await onAdd(event.id);
        setAdded(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`border rounded-lg p-4 hover:shadow-sm transition-shadow ${hasConflict ? "border-l-4 border-l-red-300 opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Sport badge */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: sport.color }}
            >
              {event.sport.toUpperCase()}
            </span>
            {event.bigTicketRequired && (
              <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Big Ticket
              </span>
            )}
            {hasConflict && !(showReasons && reasons?.some(r => r.startsWith("Conflicts with"))) && (
              <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                Conflicts with {conflictLabel}
              </span>
            )}
          </div>

          {/* Matchup */}
          <p className={`font-semibold ${hasConflict ? "line-through text-gray-400" : "text-gray-900"}`}>
            Texas{" "}
            {event.homeAway === "away" ? "@" : "vs"}{" "}
            {event.opponent}
          </p>

          {/* Details */}
          <p className={`text-sm mt-1 ${hasConflict ? "line-through text-gray-400" : "text-gray-600"}`}>
            {event.date} | {formatCentralTime(event.startTime)} CT
          </p>
          <p className="text-sm text-gray-500">
            {event.venue} | TV: {event.tvNetwork ?? "TBD"}
          </p>

          {/* Score reasons */}
          {showReasons && reasons && reasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {reasons.map((reason, i) => (
                <span
                  key={i}
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    reason.startsWith("Conflicts with")
                      ? "bg-red-50 text-red-600"
                      : "bg-orange-50 text-[#BF5700]"
                  }`}
                >
                  {reason}
                </span>
              ))}
              {score !== undefined && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  Score: {score}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Calendar button */}
        {(onAdd || onRemove) && event.startTime && (
          <button
            onClick={handleToggle}
            disabled={loading}
            className={`shrink-0 p-2 rounded-lg transition-colors ${
              added
                ? "bg-green-50 text-green-600 hover:bg-green-100"
                : "bg-orange-50 text-[#BF5700] hover:bg-orange-100"
            }`}
            title={added ? "Remove from calendar" : "Add to calendar"}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : added ? (
              <CalendarCheck className="w-5 h-5" />
            ) : (
              <CalendarPlus className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

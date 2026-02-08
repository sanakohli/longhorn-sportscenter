"use client";

import { useState } from "react";
import { CalendarPlus, CalendarCheck, Loader2, Sparkles, ChevronUp, Newspaper, ExternalLink } from "lucide-react";
import { SPORTS } from "@/lib/constants";
import { formatCentralTime } from "@/app/time";
import type { Event } from "@/data/normalized/schema";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  date: string;
  thumbnail?: string;
}

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
  const [preview, setPreview] = useState<string | null>(null);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
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

  async function handlePreview() {
    if (preview || articles.length > 0) {
      setShowPreview((prev) => !prev);
      return;
    }

    setLoadingPreview(true);
    setShowPreview(true);
    setPreviewError(null);

    try {
      const params = new URLSearchParams({
        sport: event.sport,
        opponent: event.opponent,
        date: event.date,
        homeAway: event.homeAway,
      });
      const res = await fetch(`/api/game-preview?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setPreviewError(data.error ?? "Failed to load preview");
        return;
      }

      setPreview(data.preview || null);
      setArticles(data.articles ?? []);
    } catch {
      setPreviewError("Failed to load preview");
    } finally {
      setLoadingPreview(false);
    }
  }

  return (
    <div className={`rounded-2xl transition-all duration-200 bg-white border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 ${hasConflict ? "border-l-4 border-l-red-300 opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-3 p-5">
        <div className="flex-1 min-w-0">
          {/* Sport badge */}
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full text-white uppercase tracking-wider"
              style={{ background: `linear-gradient(135deg, ${sport.color}, ${sport.color}dd)` }}
            >
              {event.sport.toUpperCase()}
            </span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                event.homeAway === "home"
                  ? "text-green-700 bg-green-50 border-green-200"
                  : event.homeAway === "away"
                  ? "text-blue-700 bg-blue-50 border-blue-200"
                  : "text-gray-600 bg-gray-50 border-gray-200"
              }`}
            >
              {event.homeAway === "home" ? "HOME" : event.homeAway === "away" ? "AWAY" : "NEUTRAL"}
            </span>
            {event.bigTicketRequired && (
              <span className="text-xs font-semibold text-amber-700 bg-gradient-to-r from-amber-50 to-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                Big Ticket
              </span>
            )}
            {hasConflict && !(showReasons && reasons?.some(r => r.startsWith("Conflicts with"))) && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
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
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    reason.startsWith("Conflicts with")
                      ? "bg-red-50 text-red-600 border border-red-100"
                      : "bg-orange-50 text-[#BF5700] border border-orange-100"
                  }`}
                >
                  {reason}
                </span>
              ))}
              {score !== undefined && (
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  Score: {score}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* Preview button */}
          <button
            onClick={handlePreview}
            disabled={loadingPreview}
            className={`p-2.5 rounded-xl transition-all duration-200 border ${
              showPreview
                ? "bg-gradient-to-br from-purple-50 to-violet-50 text-purple-600 border-purple-200 shadow-md"
                : "bg-gradient-to-br from-purple-50 to-violet-50 text-purple-500 border-purple-100 hover:shadow-md hover:scale-105"
            }`}
            title="Game preview"
          >
            {loadingPreview ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : showPreview ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
          </button>

          {/* Calendar button */}
          {(onAdd || onRemove) && event.startTime && (
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                added
                  ? "bg-gradient-to-br from-green-50 to-emerald-50 text-green-600 hover:shadow-md border border-green-200"
                  : "bg-gradient-to-br from-orange-50 to-amber-50 text-[#BF5700] hover:shadow-md hover:scale-105 border border-orange-200"
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

      {/* Preview panel */}
      {showPreview && (
        <div className="border-t border-gray-100 bg-gradient-to-br from-purple-50/30 to-white px-5 py-4 rounded-b-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <h4 className="text-sm font-semibold text-gray-900">Game Preview</h4>
          </div>

          {loadingPreview ? (
            <div className="flex items-center gap-2 text-gray-400 py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating preview...</span>
            </div>
          ) : previewError ? (
            <p className="text-sm text-red-500">{previewError}</p>
          ) : (preview || articles.length > 0) ? (
            <div>
              {preview && (
                <p className="text-sm leading-relaxed text-gray-600">{preview}</p>
              )}

              {articles.length > 0 && (
                <div className={preview ? "mt-4 pt-3 border-t border-gray-100" : ""}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <Newspaper className="w-3.5 h-3.5 text-purple-500" />
                    <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Related Articles</h5>
                  </div>
                  <div className="space-y-2">
                    {articles.map((article, i) => (
                      <a
                        key={i}
                        href={article.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-purple-50/50 transition-colors group"
                      >
                        {article.thumbnail && (
                          <img
                            src={article.thumbnail}
                            alt=""
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700 transition-colors line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {article.source}{article.date ? ` · ${article.date}` : ""}
                          </p>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-300 group-hover:text-purple-500 shrink-0 mt-0.5 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                Powered by SerpAPI
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

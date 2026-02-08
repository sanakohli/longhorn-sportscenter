"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import {
  FaBasketballBall,
  FaBaseballBall,
  FaFutbol,
} from "react-icons/fa";
import { SPORTS, ALL_SPORTS } from "@/lib/constants";
import type { Sport } from "@/data/normalized/schema";

const TIME_SLOTS = [
  { value: "morning", label: "Morning (before 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-5pm)" },
  { value: "evening", label: "Evening (5pm-9pm)" },
  { value: "night", label: "Night (after 9pm)" },
];

const SPORT_ICONS: Record<string, React.ElementType> = {
  mbb: FaBasketballBall, // Men's Basketball
  wbb: FaBasketballBall, // Women's Basketball
  bsb: FaBaseballBall,   // Baseball
  wsb: FaBaseballBall,   // Softball (closest match)
  wsc: FaFutbol,         // Soccer
};


export default function PreferencesPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);
  const [preferHomeGames, setPreferHomeGames] = useState(true);
  const [preferRivalryGames, setPreferRivalryGames] = useState(true);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([]);
  const [maxEventsPerWeek, setMaxEventsPerWeek] = useState(3);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/preferences");
      if (res.ok) {
        const data = await res.json();
        if (data.favorite_sports) {
          setFavoriteSports(data.favorite_sports);
          setPreferHomeGames(data.prefer_home_games ?? true);
          setPreferRivalryGames(data.prefer_rivalry_games ?? true);
          setPreferredTimeSlots(data.preferred_time_slots ?? []);
          setMaxEventsPerWeek(data.max_events_per_week ?? 3);
          setAutoAddToCalendar(data.auto_add_to_calendar ?? false);
        }
      }
      setLoading(false);
    }
    load();
  }, []);

  function toggleSport(sport: Sport) {
    setFavoriteSports((prev) =>
      prev.includes(sport)
        ? prev.filter((s) => s !== sport)
        : [...prev, sport]
    );
  }

  function toggleTimeSlot(slot: string) {
    setPreferredTimeSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favorite_sports: favoriteSports,
        prefer_home_games: preferHomeGames,
        prefer_rivalry_games: preferRivalryGames,
        preferred_time_slots: preferredTimeSlots,
        max_events_per_week: maxEventsPerWeek,
        auto_add_to_calendar: autoAddToCalendar,
      }),
    });
    setSaving(false);
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-[#BF5700] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Loading preferences...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 tracking-tight">Edit Preferences</h1>

      <div className="space-y-8">
        {/* Sports */}
        <div>
          <h2 className="font-semibold mb-3 text-gray-900 text-lg">Favorite Sports</h2>
          <div className="grid grid-cols-1 gap-2">
            {ALL_SPORTS.map((sport) => {
              const Icon = SPORT_ICONS[sport] || Trophy;
              return (
                <button
                  key={sport}
                  onClick={() => toggleSport(sport)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 text-gray-900 flex items-center ${
                    favoriteSports.includes(sport)
                      ? "border-[#BF5700] bg-gradient-to-r from-orange-50 to-white shadow-sm shadow-[#BF5700]/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Icon
                    className="w-5 h-5 mr-3"
                    style={{ color: SPORTS[sport].color }}
                  />
                  {SPORTS[sport].displayName}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <label className="flex items-center justify-between py-1">
            <span className="text-gray-900">Prefer home games</span>
            <input
              type="checkbox"
              checked={preferHomeGames}
              onChange={(e) => setPreferHomeGames(e.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between py-1">
            <span className="text-gray-900">Boost rivalry games</span>
            <input
              type="checkbox"
              checked={preferRivalryGames}
              onChange={(e) => setPreferRivalryGames(e.target.checked)}
            />
          </label>
        </div>

        {/* Time slots */}
        <div>
          <h2 className="font-semibold mb-3 text-gray-900 text-lg">Preferred Game Times</h2>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot.value}
                onClick={() => toggleTimeSlot(slot.value)}
                className={`p-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200 text-gray-900 ${
                  preferredTimeSlots.includes(slot.value)
                    ? "border-[#BF5700] bg-gradient-to-r from-orange-50 to-white shadow-sm"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Max events */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-900 text-lg">
            Max games per week: {maxEventsPerWeek}
          </h2>
          <input
            type="range"
            min={1}
            max={7}
            value={maxEventsPerWeek}
            onChange={(e) =>
              setMaxEventsPerWeek(parseInt(e.target.value))
            }
            className="w-full"
          />
        </div>

        {/* Auto-add */}
        <label className="flex items-center justify-between py-1">
          <span className="text-gray-900">Auto-add recommended games to calendar</span>
          <input
            type="checkbox"
            checked={autoAddToCalendar}
            onChange={(e) => setAutoAddToCalendar(e.target.checked)}
          />
        </label>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || favoriteSports.length === 0}
          className="w-full bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white py-3.5 rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-[#BF5700]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
        >
          {saving ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}

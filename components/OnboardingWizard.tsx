"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SPORTS, ALL_SPORTS } from "@/lib/constants";
import type { Sport } from "@/data/normalized/schema";

const TIME_SLOTS = [
  { value: "morning", label: "Morning (before 12pm)" },
  { value: "afternoon", label: "Afternoon (12pm-5pm)" },
  { value: "evening", label: "Evening (5pm-9pm)" },
  { value: "night", label: "Night (after 9pm)" },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1: Sports
  const [favoriteSports, setFavoriteSports] = useState<Sport[]>([]);

  // Step 2: Preferences
  const [preferHomeGames, setPreferHomeGames] = useState(true);
  const [preferRivalryGames, setPreferRivalryGames] = useState(true);
  const [preferredTimeSlots, setPreferredTimeSlots] = useState<string[]>([]);
  const [maxEventsPerWeek, setMaxEventsPerWeek] = useState(3);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);

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

  async function handleSubmit() {
    setSaving(true);
    try {
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
      router.push("/dashboard");
    } catch {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress */}
      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 flex-1 rounded-full ${
              s <= step ? "bg-[#BF5700]" : "bg-gray-200"
            }`}
          />
        ))}
      </div>

      {/* Step 1: Pick Sports */}
      {step === 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Pick your sports</h2>
          <p className="text-gray-600 mb-6">
            Which Longhorns sports do you want to follow?
          </p>
          <div className="grid grid-cols-1 gap-3">
            {ALL_SPORTS.map((sport) => (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`p-4 rounded-lg border-2 text-left transition-colors ${
                  favoriteSports.includes(sport)
                    ? "border-[#BF5700] bg-orange-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span
                  className="inline-block w-3 h-3 rounded-full mr-3"
                  style={{ backgroundColor: SPORTS[sport].color }}
                />
                <span className="font-medium">
                  {SPORTS[sport].displayName}
                </span>
                <span className="text-gray-400 ml-2 text-sm">
                  {sport.toUpperCase()}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={favoriteSports.length === 0}
            className="mt-6 w-full bg-[#BF5700] text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-[#A04800] transition-colors"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Game Preferences */}
      {step === 2 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Game preferences</h2>
          <p className="text-gray-600 mb-6">
            Help us recommend the best games for you.
          </p>

          <div className="space-y-6">
            {/* Home games toggle */}
            <label className="flex items-center justify-between">
              <span>Prefer home games</span>
              <input
                type="checkbox"
                checked={preferHomeGames}
                onChange={(e) => setPreferHomeGames(e.target.checked)}
                className="w-5 h-5 accent-[#BF5700]"
              />
            </label>

            {/* Rivalry games toggle */}
            <label className="flex items-center justify-between">
              <span>Boost rivalry games</span>
              <input
                type="checkbox"
                checked={preferRivalryGames}
                onChange={(e) => setPreferRivalryGames(e.target.checked)}
                className="w-5 h-5 accent-[#BF5700]"
              />
            </label>

            {/* Time slots */}
            <div>
              <p className="font-medium mb-2">Preferred game times</p>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.value}
                    onClick={() => toggleTimeSlot(slot.value)}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      preferredTimeSlots.includes(slot.value)
                        ? "border-[#BF5700] bg-orange-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Max events slider */}
            <div>
              <p className="font-medium mb-2">
                Max games per week: {maxEventsPerWeek}
              </p>
              <input
                type="range"
                min={1}
                max={7}
                value={maxEventsPerWeek}
                onChange={(e) =>
                  setMaxEventsPerWeek(parseInt(e.target.value))
                }
                className="w-full accent-[#BF5700]"
              />
            </div>

            {/* Auto-add toggle */}
            <label className="flex items-center justify-between">
              <span>Auto-add recommended games to calendar</span>
              <input
                type="checkbox"
                checked={autoAddToCalendar}
                onChange={(e) => setAutoAddToCalendar(e.target.checked)}
                className="w-5 h-5 accent-[#BF5700]"
              />
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex-1 bg-[#BF5700] text-white py-3 rounded-lg font-semibold hover:bg-[#A04800] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div>
          <h2 className="text-2xl font-bold mb-2">Review & save</h2>
          <p className="text-gray-600 mb-6">
            Here&apos;s a summary of your preferences.
          </p>

          <div className="space-y-4 bg-gray-50 rounded-lg p-4">
            <div>
              <p className="text-sm text-gray-500">Sports</p>
              <p className="font-medium">
                {favoriteSports
                  .map((s) => SPORTS[s].displayName)
                  .join(", ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prefer home games</p>
              <p className="font-medium">
                {preferHomeGames ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Boost rivalry games</p>
              <p className="font-medium">
                {preferRivalryGames ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Preferred times</p>
              <p className="font-medium">
                {preferredTimeSlots.length > 0
                  ? preferredTimeSlots
                      .map(
                        (s) =>
                          TIME_SLOTS.find((t) => t.value === s)?.label
                      )
                      .join(", ")
                  : "Any time"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Max games per week</p>
              <p className="font-medium">{maxEventsPerWeek}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Auto-add to calendar</p>
              <p className="font-medium">
                {autoAddToCalendar ? "Yes" : "No"}
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="flex-1 border border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 bg-[#BF5700] text-white py-3 rounded-lg font-semibold disabled:opacity-50 hover:bg-[#A04800] transition-colors"
            >
              {saving ? "Saving..." : "Save & Continue"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

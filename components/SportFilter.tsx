"use client";

import { SPORTS } from "@/lib/constants";
import type { Sport } from "@/data/normalized/schema";

interface SportFilterProps {
  selected: Set<Sport>;
  onChange: (sports: Set<Sport>) => void;
  availableSports?: Sport[];
}

export default function SportFilter({
  selected,
  onChange,
  availableSports,
}: SportFilterProps) {
  const sports = availableSports ?? (Object.keys(SPORTS) as Sport[]);

  function toggle(sport: Sport) {
    const next = new Set(selected);
    if (next.has(sport)) {
      next.delete(sport);
    } else {
      next.add(sport);
    }
    onChange(next);
  }

  const allSelected = sports.every((s) => selected.has(s));

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() =>
          onChange(allSelected ? new Set() : new Set(sports))
        }
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          allSelected
            ? "bg-[#BF5700] text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {sports.map((sport) => (
        <button
          key={sport}
          onClick={() => toggle(sport)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected.has(sport)
              ? "text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          style={
            selected.has(sport)
              ? { backgroundColor: SPORTS[sport].color }
              : undefined
          }
        >
          {sport.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

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
    <div className="flex flex-wrap gap-2.5">
      <button
        onClick={() =>
          onChange(allSelected ? new Set() : new Set(sports))
        }
        className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
          allSelected
            ? "bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white shadow-md shadow-[#BF5700]/20"
            : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
        }`}
      >
        All
      </button>
      {sports.map((sport) => (
        <button
          key={sport}
          onClick={() => toggle(sport)}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            selected.has(sport)
              ? "text-white shadow-md"
              : "bg-white text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
          style={
            selected.has(sport)
              ? {
                  background: `linear-gradient(135deg, ${SPORTS[sport].color}, ${SPORTS[sport].color}cc)`,
                  boxShadow: `0 4px 12px ${SPORTS[sport].color}33`,
                }
              : undefined
          }
        >
          {sport.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

import type { Sport } from "@/data/normalized/schema";

export interface SportInfo {
  abbr: Sport;
  displayName: string;
  color: string;
  estimatedDurationMinutes: number;
}

export const SPORTS: Record<Sport, SportInfo> = {
  mbb: {
    abbr: "mbb",
    displayName: "Men's Basketball",
    color: "#BF5700",
    estimatedDurationMinutes: 120,
  },
  wbb: {
    abbr: "wbb",
    displayName: "Women's Basketball",
    color: "#E87511",
    estimatedDurationMinutes: 120,
  },
  bsb: {
    abbr: "bsb",
    displayName: "Baseball",
    color: "#333F48",
    estimatedDurationMinutes: 180,
  },
  wsb: {
    abbr: "wsb",
    displayName: "Softball",
    color: "#9D2235",
    estimatedDurationMinutes: 150,
  },
  wsc: {
    abbr: "wsc",
    displayName: "Women's Soccer",
    color: "#00853E",
    estimatedDurationMinutes: 120,
  },
};

export const ALL_SPORTS = Object.keys(SPORTS) as Sport[];

export const RIVALRY_OPPONENTS = [
  "Oklahoma",
  "Oklahoma State",
  "Texas A&M",
  "Kansas",
  "Baylor",
  "TCU",
  "Arkansas",
  "Texas Tech",
  "Houston",
  "Iowa State",
];

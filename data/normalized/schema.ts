export type Sport = "mbb" | "wbb" | "bsb" | "wsb" | "wsc" | "fb" | "wvb";

export interface Event {
  id: string;
  sport: Sport;
  opponent: string;
  homeAway: "home" | "away" | "neutral";
  date: string; // YYYY-MM-DD
  startTime: string; // ISO string (stored as Eastern Time)
  venue: string;
  city: string;
  tvNetwork: string | null;
  bigTicketRequired: boolean;
  estimatedDurationMinutes?: number;
}

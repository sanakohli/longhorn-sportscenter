import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { addCalendarEvent } from "@/lib/google/calendar";
import { supabaseAdmin } from "@/lib/supabase/server";
import { events } from "@/app/events";
import { SPORTS } from "@/lib/constants";
import { fromZonedTime } from "date-fns-tz";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.userId as string;
  const { eventId } = await request.json();

  const sportEvent = events.find((e) => e.id === eventId);
  if (!sportEvent) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const sport = SPORTS[sportEvent.sport];
  const durationMs = (sportEvent.estimatedDurationMinutes ?? sport.estimatedDurationMinutes) * 60 * 1000;

  // Convert stored Eastern time to UTC for Google Calendar
  const utcStart = fromZonedTime(sportEvent.startTime, "America/New_York");
  const utcEnd = new Date(utcStart.getTime() + durationMs);

  try {
    const gcalEvent = await addCalendarEvent(userId, {
      summary: `Texas ${sportEvent.homeAway === "away" ? "@" : "vs"} ${sportEvent.opponent} (${sportEvent.sport.toUpperCase()})`,
      location: sportEvent.venue,
      description: `(Longhorn SportsCenter)\n${sport.displayName}\nTV: ${sportEvent.tvNetwork ?? "TBD"}\nBig Ticket: ${sportEvent.bigTicketRequired ? "Yes" : "No"}`,
      startDateTime: utcStart.toISOString(),
      endDateTime: utcEnd.toISOString(),
      timeZone: "America/Chicago",
    });

    // Store in added_events
    await supabaseAdmin.from("added_events").insert({
      user_id: userId,
      event_id: eventId,
      sport: sportEvent.sport,
      google_calendar_event_id: gcalEvent.id,
    });

    return NextResponse.json({
      success: true,
      googleEventId: gcalEvent.id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to add event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

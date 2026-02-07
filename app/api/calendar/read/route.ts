import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { readCalendarEvents } from "@/lib/google/calendar";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.userId as string;

  const now = new Date();
  const timeMin = now.toISOString();
  const timeMax = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  try {
    const events = await readCalendarEvents(userId, timeMin, timeMax);

    // Clear existing google_calendar busy times for this user
    await supabaseAdmin
      .from("busy_times")
      .delete()
      .eq("user_id", userId)
      .eq("source", "google_calendar");

    // Store as busy_times
    const busyTimes = events
      .filter((e) => e.start?.dateTime && e.end?.dateTime)
      .map((e) => ({
        user_id: userId,
        source: "google_calendar" as const,
        title: e.summary ?? "Busy",
        start_datetime: e.start!.dateTime!,
        end_datetime: e.end!.dateTime!,
        recurring: false,
      }));

    if (busyTimes.length > 0) {
      await supabaseAdmin.from("busy_times").insert(busyTimes);
    }

    return NextResponse.json({
      synced: busyTimes.length,
      events: busyTimes,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to read calendar";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

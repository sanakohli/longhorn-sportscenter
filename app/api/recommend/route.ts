import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { events } from "@/app/events";
import { generateRecommendations, getEventConflicts } from "@/lib/scheduling/algorithm";
import type { UserPreferences, BusyTime } from "@/lib/scheduling/types";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.userId as string;

  // Fetch preferences
  const { data: prefs } = await supabaseAdmin
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!prefs) {
    return NextResponse.json(
      { error: "Preferences not found" },
      { status: 404 }
    );
  }

  // Fetch busy times
  const { data: busyTimes } = await supabaseAdmin
    .from("busy_times")
    .select("*")
    .eq("user_id", userId);

  // Fetch added events (not removed)
  const { data: addedEvents } = await supabaseAdmin
    .from("added_events")
    .select("event_id")
    .eq("user_id", userId)
    .is("removed_at", null);

  const addedEventIds = new Set(
    (addedEvents ?? []).map((e: { event_id: string }) => e.event_id)
  );

  const recommendations = generateRecommendations(
    events,
    prefs as UserPreferences,
    (busyTimes ?? []) as BusyTime[],
    addedEventIds
  );

  const eventConflicts = getEventConflicts(
    events,
    (busyTimes ?? []) as BusyTime[]
  );

  return NextResponse.json({
    ...recommendations,
    addedEventIds: Array.from(addedEventIds),
    eventConflicts,
  });
}

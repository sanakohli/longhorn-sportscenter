import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/options";
import { removeCalendarEvent } from "@/lib/google/calendar";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { eventId } = await request.json();

  // Find the added event record
  const { data: addedEvent } = await supabaseAdmin
    .from("added_events")
    .select("*")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .is("removed_at", null)
    .single();

  if (!addedEvent) {
    return NextResponse.json(
      { error: "Event not found in your calendar" },
      { status: 404 }
    );
  }

  try {
    // Remove from Google Calendar
    if (addedEvent.google_calendar_event_id) {
      await removeCalendarEvent(userId, addedEvent.google_calendar_event_id);
    }

    // Soft delete
    await supabaseAdmin
      .from("added_events")
      .update({ removed_at: new Date().toISOString() })
      .eq("id", addedEvent.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to remove event";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

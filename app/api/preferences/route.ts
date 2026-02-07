import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("user_preferences")
    .select("*")
    .eq("user_id", token.userId)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? {});
}

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { error: upsertError } = await supabaseAdmin
    .from("user_preferences")
    .upsert(
      {
        user_id: token.userId,
        favorite_sports: body.favorite_sports,
        prefer_home_games: body.prefer_home_games,
        prefer_rivalry_games: body.prefer_rivalry_games,
        preferred_time_slots: body.preferred_time_slots,
        max_events_per_week: body.max_events_per_week,
        auto_add_to_calendar: body.auto_add_to_calendar,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  // Mark onboarding as completed
  await supabaseAdmin
    .from("users")
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", token.userId);

  return NextResponse.json({ success: true });
}

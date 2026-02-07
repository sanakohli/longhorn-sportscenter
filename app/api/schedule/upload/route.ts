import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { parseClassSchedulePDF } from "@/lib/pdf/parser";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = token.userId as string;

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || !file.name.endsWith(".pdf")) {
    return NextResponse.json(
      { error: "Please upload a PDF file" },
      { status: 400 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const classes = await parseClassSchedulePDF(buffer);

    if (classes.length === 0) {
      return NextResponse.json(
        { error: "No classes found in the PDF. Please check the format." },
        { status: 400 }
      );
    }

    // Clear existing class schedule busy times
    await supabaseAdmin
      .from("busy_times")
      .delete()
      .eq("user_id", userId)
      .eq("source", "class_schedule");

    // Insert new busy times
    const busyTimes = classes.flatMap((cls) =>
      cls.days.map((day) => ({
        user_id: userId,
        source: "class_schedule" as const,
        title: cls.name,
        day_of_week: day,
        start_time: cls.startTime,
        end_time: cls.endTime,
        recurring: true,
      }))
    );

    await supabaseAdmin.from("busy_times").insert(busyTimes);

    return NextResponse.json({
      success: true,
      classes,
      busyTimesCreated: busyTimes.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse PDF";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

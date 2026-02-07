import { google } from "googleapis";
import { supabaseAdmin } from "@/lib/supabase/server";

export function createOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXTAUTH_URL}/api/auth/callback/google`
  );
}

export async function getAuthenticatedClient(userId: string) {
  const { data: user } = await supabaseAdmin
    .from("users")
    .select("google_access_token, google_refresh_token")
    .eq("id", userId)
    .single();

  if (!user) throw new Error("User not found");

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    access_token: user.google_access_token,
    refresh_token: user.google_refresh_token,
  });

  // Listen for token refresh
  oauth2Client.on("tokens", async (tokens) => {
    const updates: Record<string, string> = {};
    if (tokens.access_token) {
      updates.google_access_token = tokens.access_token;
    }
    if (tokens.refresh_token) {
      updates.google_refresh_token = tokens.refresh_token;
    }
    if (Object.keys(updates).length > 0) {
      await supabaseAdmin
        .from("users")
        .update(updates)
        .eq("id", userId);
    }
  });

  return oauth2Client;
}

export async function readCalendarEvents(
  userId: string,
  timeMin: string,
  timeMax: string
) {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.list({
    calendarId: "primary",
    timeMin,
    timeMax,
    singleEvents: true,
    orderBy: "startTime",
    maxResults: 250,
  });

  return response.data.items ?? [];
}

export async function addCalendarEvent(
  userId: string,
  event: {
    summary: string;
    location: string;
    description: string;
    startDateTime: string;
    endDateTime: string;
    timeZone: string;
  }
) {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: {
      summary: event.summary,
      location: event.location,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: event.timeZone,
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: event.timeZone,
      },
    },
  });

  return response.data;
}

export async function removeCalendarEvent(
  userId: string,
  googleEventId: string
) {
  const auth = await getAuthenticatedClient(userId);
  const calendar = google.calendar({ version: "v3", auth });

  await calendar.events.delete({
    calendarId: "primary",
    eventId: googleEventId,
  });
}

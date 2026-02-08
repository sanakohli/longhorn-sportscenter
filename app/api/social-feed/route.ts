import { NextResponse } from "next/server";

const PROFILES = [
  { id: "100057418009342", label: "Texas Longhorns" },
  { id: "100064589180842", label: "Texas WBB" },
  { id: "100057405521254", label: "Texas Baseball" },
];

interface FBPhoto {
  link: string;
}

interface FBProfileResult {
  name?: string;
  profile_picture?: string;
  photos?: FBPhoto[];
}

interface PhotoItem {
  imageUrl: string;
  profileName: string;
  profilePicture: string;
}

export async function GET() {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing SERPAPI_KEY" }, { status: 500 });
  }

  const results: PhotoItem[] = [];

  await Promise.all(
    PROFILES.map(async (profile) => {
      try {
        const url = `https://serpapi.com/search.json?engine=facebook_profile&profile_id=${profile.id}&api_key=${apiKey}`;
        const res = await fetch(url, { next: { revalidate: 3600 } });
        const data = await res.json();
        const profileResult: FBProfileResult = data.profile_results ?? {};
        const photos = profileResult.photos ?? [];
        const name = profileResult.name ?? profile.label;
        const picture = profileResult.profile_picture ?? "";

        for (const photo of photos.slice(0, 3)) {
          results.push({
            imageUrl: photo.link,
            profileName: name,
            profilePicture: picture,
          });
        }
      } catch {
        // Skip failed profiles
      }
    })
  );

  return NextResponse.json(results);
}

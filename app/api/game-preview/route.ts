import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SPORTS } from "@/lib/constants";
import type { Sport } from "@/data/normalized/schema";

interface NewsArticle {
  title: string;
  link: string;
  source: string;
  date: string;
  thumbnail?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") as Sport | null;
  const opponent = searchParams.get("opponent");
  const date = searchParams.get("date");
  const homeAway = searchParams.get("homeAway");

  if (!sport || !opponent || !date) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 }
    );
  }

  const sportName = SPORTS[sport]?.displayName ?? sport;
  const dateObj = new Date(date + "T00:00:00");
  const monthDay = dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const matchup =
    homeAway === "away"
      ? `Texas ${sportName} at ${opponent}`
      : `Texas ${sportName} vs ${opponent}`;

  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "SerpAPI key not configured" },
      { status: 500 }
    );
  }

  try {
    // Build both requests in parallel
    const aiUrl = new URL("https://serpapi.com/search.json");
    aiUrl.searchParams.set("engine", "google_ai_mode");
    aiUrl.searchParams.set("q", `${matchup} ${monthDay} game preview injury report key players what to know`);
    aiUrl.searchParams.set("gl", "us");
    aiUrl.searchParams.set("hl", "en");
    aiUrl.searchParams.set("api_key", apiKey);

    const newsUrl = new URL("https://serpapi.com/search.json");
    newsUrl.searchParams.set("engine", "google_news");
    newsUrl.searchParams.set("q", `Texas ${sportName} ${opponent}`);
    newsUrl.searchParams.set("gl", "us");
    newsUrl.searchParams.set("hl", "en");
    newsUrl.searchParams.set("api_key", apiKey);

    const [aiRes, newsRes] = await Promise.all([
      fetch(aiUrl.toString()),
      fetch(newsUrl.toString()),
    ]);

    // Parse AI preview
    let preview = "";
    if (aiRes.ok) {
      const aiData = await aiRes.json();
      const textBlocks = aiData.text_blocks ?? [];

      const paragraphs: string[] = [];
      for (const block of textBlocks) {
        if (block.type === "paragraph" && block.snippet) {
          paragraphs.push(block.snippet.trim());
        }
      }

      const allText = paragraphs.join(" ");
      const sentences = allText.match(/[^.!?]+[.!?]+/g) ?? [];
      preview = sentences.slice(0, 5).join(" ").trim();
    }

    // Parse news articles
    const articles: NewsArticle[] = [];
    if (newsRes.ok) {
      const newsData = await newsRes.json();
      const results = newsData.news_results ?? [];

      for (const item of results.slice(0, 4)) {
        if (item.title && item.link) {
          articles.push({
            title: item.title,
            link: item.link,
            source: item.source?.name ?? "",
            date: item.date ?? "",
            thumbnail: item.thumbnail ?? undefined,
          });
        }
      }
    }

    if (!preview && articles.length === 0) {
      return NextResponse.json(
        { error: "No preview content available" },
        { status: 404 }
      );
    }

    return NextResponse.json({ preview, articles });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch game preview" },
      { status: 500 }
    );
  }
}

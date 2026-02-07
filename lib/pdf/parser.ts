// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse");

export interface ParsedClass {
  name: string;
  days: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  startTime: string; // HH:MM (24h)
  endTime: string; // HH:MM (24h)
}

const DAY_MAP: Record<string, number[]> = {
  MWF: [1, 3, 5],
  MW: [1, 3],
  MF: [1, 5],
  WF: [3, 5],
  TTH: [2, 4],
  TTh: [2, 4],
  TR: [2, 4],
  M: [1],
  T: [2],
  W: [3],
  TH: [4],
  Th: [4],
  R: [4],
  F: [5],
  S: [6],
};

function parseTime12to24(timeStr: string): string {
  const match = timeStr.match(
    /(\d{1,2}):(\d{2})\s*(am|pm|a|p)/i
  );
  if (!match) return timeStr;

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[3].toLowerCase();

  if ((period === "pm" || period === "p") && hours !== 12) {
    hours += 12;
  } else if ((period === "am" || period === "a") && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes}`;
}

function parseDays(dayStr: string): number[] {
  const upper = dayStr.replace(/\s/g, "");
  if (DAY_MAP[upper]) return DAY_MAP[upper];

  for (const [key, val] of Object.entries(DAY_MAP)) {
    if (key.toLowerCase() === upper.toLowerCase()) return val;
  }

  return [];
}

export async function parseClassSchedulePDF(
  buffer: Buffer
): Promise<ParsedClass[]> {
  const data = await pdfParse(buffer);
  const text: string = data.text;

  const classes: ParsedClass[] = [];

  const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);

  const timeRangePattern =
    /(\d{1,2}:\d{2}\s*(?:am|pm|a|p)?)\s*[-–]\s*(\d{1,2}:\d{2}\s*(?:am|pm|a|p)?)/gi;

  const dayPattern = /\b(MWF|MW|MF|WF|TTH|TTh|TR|M|T|W|TH|Th|R|F|S)\b/g;

  for (const line of lines) {
    const timeMatches = [...line.matchAll(timeRangePattern)];
    const dayMatches = [...line.matchAll(dayPattern)];

    if (timeMatches.length > 0 && dayMatches.length > 0) {
      const timeMatch = timeMatches[0];
      const dayMatch = dayMatches[0];

      const startTime = parseTime12to24(timeMatch[1]);
      const endTime = parseTime12to24(timeMatch[2]);
      const days = parseDays(dayMatch[0]);

      if (days.length > 0 && startTime && endTime) {
        const nameEnd = line.indexOf(dayMatch[0]);
        const name = line.substring(0, nameEnd).trim() || "Unknown Course";

        classes.push({ name, days, startTime, endTime });
      }
    }
  }

  return classes;
}

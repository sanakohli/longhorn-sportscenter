import csv
import json
from datetime import datetime
import re

INPUT = "../data/raw/wsb.csv"
OUTPUT = "../data/normalized/wsb.json"

events = []

def parse_time(date_str, time_str):
    if not time_str:
        return None

    # Sports-Reference uses '8:45p' or '3:00p'
    time_str = time_str.strip().lower()

    if time_str.endswith("p"):
        time_str = time_str.replace("p", "PM")
    elif time_str.endswith("a"):
        time_str = time_str.replace("a", "AM")

    time_obj = datetime.strptime(time_str, "%I:%M%p")
    return f"{date_str}T{time_obj.strftime('%H:%M')}:00"

def clean_opponent(opponent):
    # Remove ranking like "(6)"
    opponent = re.sub(r"\s*\(\d+\)", "", opponent)
    return opponent.strip()

with open(INPUT, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)

    for row in reader:
        if not row["Date"]:
            continue

        # Date
        date_obj = datetime.strptime(row["Date"], "%a %b %d %Y")
        date_str = date_obj.strftime("%Y-%m-%d")

        # Home / Away / Neutral
        if row["Away"].strip() == "@":
            home_away = "away"
        elif row["Away"].strip() == "N":
            home_away = "neutral"
        else:
            home_away = "home"

        opponent = clean_opponent(row["Opponent"])

        event = {
            "id": f"wsb-{date_str}-{opponent.lower().replace(' ', '-')}",
            "sport": "wsb",
            "opponent": opponent,
            "homeAway": home_away,
            "date": date_str,
            "startTime": parse_time(date_str, row["Time"]),
            "venue": row["Arena"] if row["Arena"] else "TBD",
            "city": "Austin, TX" if home_away == "home" else "",
            "tvNetwork": None,  # fill manually later
            "bigTicketRequired": True
        }

        events.append(event)

with open(OUTPUT, "w") as f:
    json.dump(events, f, indent=2)

print(f"Wrote {len(events)} events to {OUTPUT}")

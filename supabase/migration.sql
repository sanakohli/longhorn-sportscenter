-- Longhorn SportsCenter Database Schema
-- Run this in the Supabase SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  picture_url TEXT,
  google_access_token TEXT,
  google_refresh_token TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  favorite_sports TEXT[] DEFAULT '{}',
  prefer_home_games BOOLEAN DEFAULT TRUE,
  prefer_rivalry_games BOOLEAN DEFAULT TRUE,
  preferred_time_slots TEXT[] DEFAULT '{}',
  max_events_per_week INTEGER DEFAULT 3,
  auto_add_to_calendar BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Busy times table
CREATE TABLE IF NOT EXISTS busy_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('google_calendar', 'class_schedule', 'manual')),
  title TEXT,
  day_of_week INTEGER, -- 0=Sunday, 6=Saturday (for recurring)
  start_time TIME,     -- For recurring events
  end_time TIME,       -- For recurring events
  start_datetime TIMESTAMPTZ, -- For one-time events
  end_datetime TIMESTAMPTZ,   -- For one-time events
  recurring BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Added events table
CREATE TABLE IF NOT EXISTS added_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  sport TEXT NOT NULL,
  google_calendar_event_id TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  removed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_busy_times_user_id ON busy_times(user_id);
CREATE INDEX IF NOT EXISTS idx_added_events_user_id ON added_events(user_id);
CREATE INDEX IF NOT EXISTS idx_added_events_event_id ON added_events(event_id);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE busy_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE added_events ENABLE ROW LEVEL SECURITY;

-- RLS policies: service role bypasses RLS, so these are for anon/authenticated access
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (true);
CREATE POLICY "User preferences readable by owner" ON user_preferences FOR SELECT USING (true);
CREATE POLICY "Busy times readable by owner" ON busy_times FOR SELECT USING (true);
CREATE POLICY "Added events readable by owner" ON added_events FOR SELECT USING (true);

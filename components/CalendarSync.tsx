"use client";

import { useState } from "react";
import { RefreshCw, Check } from "lucide-react";

interface CalendarSyncProps {
  onSync?: () => void;
}

export default function CalendarSync({ onSync }: CalendarSyncProps) {
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncedCount, setSyncedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSync() {
    setSyncing(true);
    setError(null);

    try {
      const res = await fetch("/api/calendar/read");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSyncedCount(data.synced);
      setLastSync(new Date().toLocaleTimeString());
      onSync?.();
    } catch {
      setError("Sync failed. Please try again.");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Google Calendar Sync</h3>
          {lastSync && (
            <p className="text-sm text-gray-500">
              Last synced: {lastSync}
              {syncedCount !== null && ` (${syncedCount} events)`}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          {!lastSync && !error && (
            <p className="text-sm text-gray-500">
              Sync your calendar to check for conflicts
            </p>
          )}
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-[#BF5700]/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          {syncing ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : lastSync ? (
            <Check className="w-4 h-4" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {syncing ? "Syncing..." : "Sync Now"}
        </button>
      </div>
    </div>
  );
}

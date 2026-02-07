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
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Google Calendar Sync</h3>
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
          className="flex items-center gap-2 bg-[#BF5700] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#A04800] transition-colors"
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

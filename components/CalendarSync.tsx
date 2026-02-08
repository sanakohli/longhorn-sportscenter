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
    <div className="shrink-0">
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
        {syncing ? "Syncing..." : "Sync Calendar"}
      </button>
      {lastSync && (
        <p className="text-xs text-gray-400 mt-1.5 text-right">
          Synced: {lastSync}{syncedCount !== null && ` (${syncedCount})`}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 text-right">{error}</p>
      )}
    </div>
  );
}

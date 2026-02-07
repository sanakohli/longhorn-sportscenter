"use client";

import { useState, useRef } from "react";
import { Upload, X, Check } from "lucide-react";

interface ParsedClass {
  name: string;
  days: number[];
  startTime: string;
  endTime: string;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function ScheduleUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [classes, setClasses] = useState<ParsedClass[]>([]);
  const [uploading, setUploading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/schedule/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setClasses(data.classes);
      setConfirmed(true);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleClear() {
    setFile(null);
    setClasses([]);
    setConfirmed(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Class Schedule</h3>

      {!confirmed ? (
        <>
          <div className="border-2 border-dashed border-[#BF5700]/30 rounded-xl p-8 text-center
                          bg-gradient-to-br from-orange-50/50 to-white
                          hover:border-[#BF5700]/50 hover:from-orange-50
                          transition-all duration-200 cursor-pointer">
            <Upload className="w-10 h-10 mx-auto mb-3 text-[#BF5700]/50" />
            <p className="text-sm text-gray-600 mb-3 font-medium">
              Upload your class schedule PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#BF5700]/10 file:text-[#BF5700] hover:file:bg-[#BF5700]/20"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-gradient-to-r from-[#BF5700] to-[#A04800] text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:shadow-lg hover:shadow-[#BF5700]/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
            >
              {uploading ? "Parsing..." : "Upload & Parse"}
            </button>
          )}
        </>
      ) : (
        <>
          <div className="flex items-center gap-2 text-green-600 mb-4">
            <Check className="w-5 h-5" />
            <span className="font-medium">
              {classes.length} classes found
            </span>
          </div>

          <div className="space-y-2">
            {classes.map((cls, i) => (
              <div
                key={i}
                className="bg-gray-50/80 rounded-xl p-3.5 text-sm border border-gray-100"
              >
                <p className="font-medium">{cls.name}</p>
                <p className="text-gray-600">
                  {cls.days.map((d) => DAY_NAMES[d]).join(", ")} |{" "}
                  {cls.startTime} - {cls.endTime}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={handleClear}
            className="mt-4 w-full border border-gray-200 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 inline-flex items-center justify-center gap-2 text-gray-600"
          >
            <X className="w-4 h-4" />
            Clear & Re-upload
          </button>
        </>
      )}
    </div>
  );
}

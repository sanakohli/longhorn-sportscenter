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
    <div className="border rounded-lg p-6">
      <h3 className="font-semibold text-lg mb-4">Class Schedule</h3>

      {!confirmed ? (
        <>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 mb-2">
              Upload your class schedule PDF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}

          {file && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="mt-4 w-full bg-[#BF5700] text-white py-2 rounded-lg font-semibold disabled:opacity-50 hover:bg-[#A04800] transition-colors"
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
                className="bg-gray-50 rounded p-3 text-sm"
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
            className="mt-4 w-full border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Clear & Re-upload
          </button>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoItem {
  imageUrl: string;
  profileName: string;
  profilePicture: string;
}

export default function SocialFeed() {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/social-feed");
        if (res.ok) {
          const data: PhotoItem[] = await res.json();
          setPhotos(data);
        }
      } catch {
        // Silently fail
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % photos.length);
  }, [photos.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (photos.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [photos.length, next]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-4 text-gray-900">Texas Athletics News</h3>
        <div className="aspect-[4/5] rounded-xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (photos.length === 0) return null;

  const current = photos[index];

  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="font-semibold text-lg mb-4 text-gray-900">Texas Athletics News</h3>

      <div className="relative group">
        {/* Image */}
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
          <img
            src={current.imageUrl}
            alt={`${current.profileName} photo`}
            className="w-full h-full object-contain transition-opacity duration-500"
          />

          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Profile attribution */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-2">
            {current.profilePicture && (
              <img
                src={current.profilePicture}
                alt=""
                className="w-6 h-6 rounded-full border border-white/50"
              />
            )}
            <span className="text-xs font-semibold text-white drop-shadow-sm">
              {current.profileName}
            </span>
          </div>

          {/* Slide counter */}
          <div className="absolute bottom-2.5 right-3 text-xs text-white/70 font-medium">
            {index + 1} / {photos.length}
          </div>
        </div>

        {/* Nav arrows */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {photos.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                i === index
                  ? "bg-[#BF5700] w-4"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

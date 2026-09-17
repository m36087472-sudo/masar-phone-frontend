"use client";
import { useState, useEffect } from "react";

export default function CategoryBanner({ category, images }: { category: string; images?: string[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [images]);

  if (!images?.length) return null;

  return (
    <div className="px-1 sm:px-5 lg:px-8 py-2">
      <section className="relative w-full">
        {/* first image is relative to define height; others are absolute on top */}
        {images.map((src, i) => (
          <div
            key={i}
            className="transition-opacity duration-700"
            style={{
              position: i === 0 ? "relative" : "absolute",
              inset: i === 0 ? undefined : 0,
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${category} بانر ${i + 1}`}
              style={{ display: "block", width: "100%", height: "auto" }}
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}

        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "20px" : "8px",
                  height: "8px",
                  background: i === current ? "#0B43FD" : "rgba(255,255,255,0.6)",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

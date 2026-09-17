"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function CategoryBanner({ category, images }: { category: string; images?: string[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const start = () => {
      if (timerRef.current) return;
      timerRef.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % images.length);
      }, 3500);
    };

    const stop = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    const el = containerRef.current;
    if (!el) return;

    // Only run the interval when the banner is visible in the viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0.1 }
    );
    observer.observe(el);

    return () => {
      stop();
      observer.disconnect();
    };
  }, [images]);

  if (!images?.length) return null;

  return (
    <div ref={containerRef} className="px-1 sm:px-5 lg:px-8 py-2">
      <section className="relative w-full">
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
            {/* next/image for automatic WebP + responsive sizing */}
            <Image
              src={src}
              alt={`${category} بانر ${i + 1}`}
              width={1400}
              height={400}
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
              style={{ display: "block", width: "100%", height: "auto" }}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1400px"
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

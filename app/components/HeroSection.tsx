"use client";
import { useEffect, useState } from "react";
import Image from "next/image";

interface Banner {
  url: string;
  active: boolean;
}

export default function HeroSection({ banners }: { banners: Banner[] }) {
  const active = banners;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (active.length <= 1) return;
    const t = setInterval(() => setCurrent((p) => (p + 1) % active.length), 4000);
    return () => clearInterval(t);
  }, [active.length]);

  if (!active.length) return null;

  return (
    <div className="px-1 sm:px-5 lg:px-8 pt-4 pb-2">
      <section className="relative w-full">
        {active.map((b, i) => (
          <div
            key={b.url}
            className="transition-opacity duration-700"
            style={{
              position: i === 0 ? "relative" : "absolute",
              inset: i === 0 ? undefined : 0,
              opacity: i === current ? 1 : 0,
              pointerEvents: i === current ? "auto" : "none",
            }}
          >
            {i === 0 ? (
              // First banner: next/image with priority for LCP — server-optimised WebP, correct sizing
              <Image
                src={b.url}
                alt="banner-1"
                width={1400}
                height={500}
                priority
                fetchPriority="high"
                style={{ display: "block", width: "100%", height: "auto" }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1400px"
              />
            ) : (
              // Subsequent banners: lazy-loaded via next/image (still gets WebP optimisation)
              <Image
                src={b.url}
                alt={`banner-${i + 1}`}
                width={1400}
                height={500}
                loading="lazy"
                style={{ display: "block", width: "100%", height: "auto" }}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1400px"
              />
            )}
          </div>
        ))}

        {active.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {active.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="transition-all duration-300"
                style={{
                  width: i === current ? "24px" : "8px",
                  height: "8px",
                  borderRadius: "4px",
                  background: i === current ? "#fff" : "rgba(255,255,255,0.45)",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

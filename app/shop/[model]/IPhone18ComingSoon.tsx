"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-15T11:00:00+03:00"
);

const DEFAULT_SLIDES = [
  "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126695/9f8f553a-de3f-47a8-872e-eec04b96a00a.webp",
  "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126697/eb6b2f9b-f763-4f5a-ac85-1ced540ccde2.webp",
  "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126695/3b1575e2-faab-4566-b6f3-5487b39bb64c.webp",
];

function useCountdown(target: Date, onExpire: () => void) {
  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    };
  };
  const [time, setTime] = useState(calc);
  const calledRef = useRef(false);
  useEffect(() => {
    const id = setInterval(() => {
      const next = calc();
      setTime(next);
      if (next.expired && !calledRef.current) {
        calledRef.current = true;
        onExpire();
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function TimeBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div
        className="rounded-xl sm:rounded-2xl flex items-center justify-center"
        style={{
          width: "clamp(52px, 14vw, 96px)",
          height: "clamp(52px, 14vw, 96px)",
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
        }}
      >
        <span
          className="font-black text-white tabular-nums"
          style={{ fontSize: "clamp(1.25rem, 5vw, 2.5rem)" }}
        >
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span
        className="text-white/55 font-medium"
        style={{ fontSize: "clamp(0.6rem, 2vw, 0.8rem)" }}
      >
        {label}
      </span>
    </div>
  );
}

export default function IPhone18ComingSoon({ modelName, slides }: { modelName: string; slides?: string[] }) {
  const SLIDES = slides?.length ? slides : DEFAULT_SLIDES;
  const router = useRouter();
  const countdown = useCountdown(RESERVATION_DATE, () => router.refresh());
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setCurrent((i) => (i + 1) % SLIDES.length), 4500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <main dir="rtl" className="relative flex flex-col items-center justify-center overflow-hidden">

      {/* Background slides */}
      {SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={src}
            alt=""
            fill
            priority={i === 0}
            loading={i === 0 ? "eager" : "lazy"}
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, rgba(4,14,60,0.92) 0%, rgba(4,14,60,0.6) 40%, rgba(4,14,60,0.25) 100%)",
        }}
      />

      {/* Slide dots */}
      <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width: i === current ? 20 : 6,
              height: 6,
              background: i === current ? "#fff" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mx-auto px-5 sm:px-8 py-10 sm:py-12">

        {/* Badge */}
        <div
          className="flex items-center gap-2 rounded-full mb-5 sm:mb-7"
          style={{
            padding: "6px 16px",
            background: "rgba(11,67,253,0.28)",
            border: "1px solid rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
          }}
        >
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#60a5fa] animate-pulse" />
          <span
            className="font-bold tracking-widest uppercase text-white/75"
            style={{ fontSize: "clamp(0.6rem, 2vw, 0.72rem)" }}
          >
            قريباً
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-black text-white leading-tight mb-2 sm:mb-3"
          style={{
            fontSize: "clamp(1.8rem, 7vw, 4.5rem)",
            textShadow: "0 2px 30px rgba(4,14,60,0.6)",
          }}
        >
          {modelName}
        </h1>

        {/* Tagline */}
        <p
          className="text-white/55 mb-8 sm:mb-11"
          style={{ fontSize: "clamp(0.82rem, 2.5vw, 1.05rem)" }}
        >
          انتظرونا قريباً
        </p>

        {/* Countdown */}
        <div
          className="flex items-start mb-8 sm:mb-12"
          style={{ gap: "clamp(6px, 2.5vw, 20px)" }}
        >
          <TimeBox value={countdown.days} label="يوم" />
          <span
            className="text-white/25 font-bold"
            style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", marginTop: "clamp(12px, 3.5vw, 28px)" }}
          >
            :
          </span>
          <TimeBox value={countdown.hours} label="ساعة" />
          <span
            className="text-white/25 font-bold"
            style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", marginTop: "clamp(12px, 3.5vw, 28px)" }}
          >
            :
          </span>
          <TimeBox value={countdown.minutes} label="دقيقة" />
          <span
            className="text-white/25 font-bold"
            style={{ fontSize: "clamp(1.2rem, 4vw, 2rem)", marginTop: "clamp(12px, 3.5vw, 28px)" }}
          >
            :
          </span>
          <TimeBox value={countdown.seconds} label="ثانية" />
        </div>

        {/* Info cards */}
        <div className="flex flex-col xs:flex-row gap-3 w-full">
          {[
            {
              label: "فتح باب الحجز",
              date: "15 / 9 / 2026",
              sub: "الساعة 11 صباحاً بتوقيت السعودية",
            },
            {
              label: "موعد التوفير",
              date: "20 / 9 / 2026",
              sub: "ابدأ طلبك من الآن",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="flex-1 rounded-2xl text-right"
              style={{
                padding: "clamp(14px, 3vw, 22px)",
                background: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <p
                className="text-white/40 mb-1"
                style={{ fontSize: "clamp(0.65rem, 2vw, 0.75rem)" }}
              >
                {card.label}
              </p>
              <p
                className="text-white font-black leading-tight"
                style={{ fontSize: "clamp(1.1rem, 4vw, 1.5rem)" }}
              >
                {card.date}
              </p>
              <p
                className="text-[#60a5fa] font-semibold mt-1"
                style={{ fontSize: "clamp(0.62rem, 1.8vw, 0.75rem)" }}
              >
                {card.sub}
              </p>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}

"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";

const ITEMS_PER_PAGE = 12;

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  highlight?: string;
}

interface Props {
  products: Product[];
  modelName: string;
  hero?: HeroSlide[];
}

export default function ShopModelClient({ products, modelName, hero = [] }: Props) {
  const [slideIdx, setSlideIdx] = useState(0);
  const slides = hero.length > 0 ? hero.filter((s) => !!s.image) : null;
  const heroRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (!slides) return;
    setSlideIdx((i) => (i + 1) % slides.length);
  }, [slides]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          intervalId = setInterval(nextSlide, 4000);
        } else {
          if (intervalId) clearInterval(intervalId);
        }
      },
      { threshold: 0.2 }
    );

    const el = heroRef.current;
    if (el) observer.observe(el);

    return () => {
      observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, [slides, nextSlide]);
  // ── Filter state ──────────────────────────────────────────────
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "discount">("price-asc");
  const [page, setPage] = useState(1);

  const resetFilters = () => { setSortBy("default"); setPage(1); };

  // ── Apply sort ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const list = [...products];
    if (sortBy === "price-asc") {
      list.sort((a, b) => (a.salePrice ?? a.originalPrice ?? 0) - (b.salePrice ?? b.originalPrice ?? 0));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => (b.salePrice ?? b.originalPrice ?? 0) - (a.salePrice ?? a.originalPrice ?? 0));
    } else if (sortBy === "discount") {
      list.sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));
    }
    return list;
  }, [products, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f5f7ff]">

      {/* ── Hero Slider ──────────────────────────────────────── */}
      <div ref={heroRef} className="relative w-full h-[300px] sm:h-[420px] lg:h-[500px] overflow-hidden">

        {/* Slides */}
        {slides ? (
          slides.map((slide, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                i === slideIdx ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={slide.image}
                alt={slide.subtitle}
                fill
                priority={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                className="object-cover object-center scale-105"
                sizes="100vw"
              />
            </div>
          ))
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B43FD] via-[#0a35cc] to-[#061a6e]" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(4,14,60,0.82) 0%, rgba(4,14,60,0.35) 50%, rgba(4,14,60,0.15) 100%)" }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-10 sm:pb-14 lg:pb-16 px-4 sm:px-10 text-center gap-2 sm:gap-3">

          {/* Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md mb-1"
            style={{ background: "rgba(11,67,253,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7eb3ff] animate-pulse" />
            <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-white/70">
              {modelName}
            </span>
          </div>

          {/* Title */}
          {slides?.[slideIdx]?.title && (
            <h1
              key={`title-${slideIdx}`}
              className="font-black text-center max-w-xs sm:max-w-xl lg:max-w-3xl leading-tight"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 3.2rem)",
                background: "linear-gradient(90deg, #ffffff 0%, #a8c8ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                textShadow: "none",
              }}
            >
              {slides[slideIdx].title}
            </h1>
          )}

          {/* Subtitle */}
          {slides?.[slideIdx]?.subtitle && (
            <p
              key={`sub-${slideIdx}`}
              className="text-center max-w-xs sm:max-w-lg lg:max-w-2xl leading-relaxed font-medium"
              style={{ fontSize: "clamp(0.8rem, 2.2vw, 1.15rem)", color: "rgba(255,255,255,0.75)", textShadow: "0 1px 8px rgba(4,14,60,0.5)" }}
            >
              {(() => {
                const text = slides[slideIdx].subtitle;
                const hl = slides[slideIdx].highlight;
                if (!hl || !text.includes(hl)) return text;
                const [before, after] = text.split(hl);
                return (
                  <>
                    {before}
                    <span className="font-black" style={{
                      background: "linear-gradient(90deg, #60a5fa, #0B43FD)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}>{hl}</span>
                    {after}
                  </>
                );
              })()}
            </p>
          )}

          {/* Dots */}
          {slides && slides.length > 1 && (
            <div className="flex gap-1.5 mt-1 sm:mt-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlideIdx(i)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    i === slideIdx ? "w-6 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8 py-8">

        {/* Toolbar */}
        <div className="flex items-center justify-end gap-3 mb-6">
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }}
            className="bg-white border border-[#e0e7ff] text-sm text-gray-700 font-medium px-3 py-2 rounded-xl shadow-sm outline-none cursor-pointer"
          >
            <option value="default">الترتيب الافتراضي</option>
            <option value="price-asc">السعر: الأقل أولاً</option>
            <option value="price-desc">السعر: الأعلى أولاً</option>
            <option value="discount">أعلى خصم</option>
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-4">
          عرض <span className="font-bold text-gray-800">{filtered.length}</span> منتج
        </p>

        {/* Grid */}
        {paginated.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg mb-3">لا توجد منتجات تطابق الفلتر</p>
            <button onClick={resetFilters} className="text-[#0B43FD] font-bold text-sm underline cursor-pointer">
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {paginated.map((p, i) => (
              <ProductCard key={p._id} product={p} priority={i < 4} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-9 h-9 rounded-xl border border-[#e0e7ff] bg-white flex items-center justify-center text-[#0B43FD] disabled:opacity-30 hover:bg-[#0B43FD] hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "...")[]>((acc, n, idx, arr) => {
                if (idx > 0 && n - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "..." ? (
                  <span key={`dots-${i}`} className="text-gray-400 px-1">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`w-9 h-9 rounded-xl border font-bold text-sm transition-colors cursor-pointer ${
                      page === n
                        ? "bg-[#0B43FD] text-white border-[#0B43FD]"
                        : "bg-white text-gray-700 border-[#e0e7ff] hover:border-[#0B43FD] hover:text-[#0B43FD]"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-9 h-9 rounded-xl border border-[#e0e7ff] bg-white flex items-center justify-center text-[#0B43FD] disabled:opacity-30 hover:bg-[#0B43FD] hover:text-white transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        )}

      </div>
    </main>
  );
}

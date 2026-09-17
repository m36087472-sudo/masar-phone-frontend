"use client";
import { useMemo, memo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "./types";
import CategoryBanner from "../banner/CategoryBanner";

const LIMIT = 4;

// These are module-level constants — they are created once, not on every render.
const normalize = (s: string) =>
  s.trim()
    .replace(/[آأإ]/g, "ا")
    .replace(/[ى]/g, "ي")
    .replace(/\s+/g, " ")
    .toLowerCase();

const categoryPageMap: Record<string, string> = {
  "ابل ايفون 17 برو ماكس": "/shop/17-pro-max",
  "ابل ايفون 17 برو": "/shop/17-pro",
  "ابل ايفون 17 اير": "/shop/17-air",
  "ابل ايفون 17": "/shop/17",
  "ابل ايفون 16 برو ماكس": "/shop/16-pro-max",
  "ابل ايفون 16 برو": "/shop/16-pro",
  "ابل ايفون 16 بلس": "/shop/16-plus",
  "ابل ايفون 16": "/shop/16",
  "ابل ايفون 15 برو ماكس": "/shop/15-pro-max",
  "ابل ايفون 15 برو": "/shop/15-pro",
  "ابل ايفون 15 بلس": "/shop/15-plus",
  "ابل ايفون 15": "/shop/15",
  "ماك بوك إير": "/shop/macbook-air",
  "ماك بوك اير": "/shop/macbook-air",
  "macbook air": "/shop/macbook-air",
  "ماك بوك برو": "/shop/macbook-pro",
  "macbook pro": "/shop/macbook-pro",
  "laptop": "/shop/macbook-pro",
  "سامسونج جالاكسي s26 الترا": "/shop/galaxy-s26-ultra",
  "سامسونج جالاكسي s26 بلس": "/shop/galaxy-s26-plus",
  "سامسونج جالاكسي s26": "/shop/galaxy-s26",
  "سامسونج جالاكسي s25 الترا": "/shop/galaxy-s25-ultra",
  "سامسونج جالاكسي s25 بلس": "/shop/galaxy-s25-plus",
  "سامسونج جالاكسي s25": "/shop/galaxy-s25",
};

// O(1) lookup بدل O(n) loop في كل render
const normalizedCategoryMap: Map<string, string> = new Map(
  Object.entries(categoryPageMap).map(([k, v]) => [normalize(k), v])
);

function getCategoryHref(category: string): string {
  return normalizedCategoryMap.get(normalize(category)) ?? `/search?q=${encodeURIComponent(category)}`;
}

const CategoryRow = memo(function CategoryRow({ category, items, isFirst }: { category: string; items: Product[]; isFirst?: boolean }) {
  const visible = items.slice(0, LIMIT);
  const href = getCategoryHref(category);

  return (
    <div className="mb-8 sm:mb-12">
      <div className="flex items-end justify-between mb-3 sm:mb-4" dir="rtl">
        <div className="flex flex-col gap-1 sm:gap-1.5">
          <h2 className="text-[clamp(1rem,4vw,1.6rem)] font-black text-[#0a0a0a] leading-none tracking-tight">
            {category}
          </h2>
          <div className="h-[3px] w-8 sm:w-12 rounded-full bg-gradient-to-l from-[#0B43FD] to-[#4f8bff]" />
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-[clamp(0.65rem,2.5vw,0.78rem)] font-bold text-[#0B43FD] whitespace-nowrap px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-[#0B43FD]/30 hover:bg-[#0B43FD]/6 transition-all duration-200"
        >
          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          عرض الكل
        </Link>
      </div>
      <div className="border-t-2 border-dashed border-[#0B43FD]/20 mb-4 sm:mb-6" />
      <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 overflow-x-auto pb-2 sm:overflow-visible sm:pb-0 snap-x snap-mandatory scrollbar-hide">
        {visible.map((p, i) => (
          <div key={p._id} className="min-w-[44vw] max-w-[44vw] sm:min-w-0 sm:max-w-none snap-start">
            <ProductCard product={p} priority={isFirst && i === 0} />
          </div>
        ))}
      </div>
    </div>
  );
});

// Module-level helpers — created once, not inside useMemo
const parseStorage = (s?: string): number => {
  if (!s) return 0;
  const n = parseFloat(s);
  if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
  return n || 0;
};

const colorOrder = (c?: string): number => {
  if (!c) return 99;
  if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
  if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
  if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
  return 3;
};

type HomeSettings = { category: string; subCategory: string; showInHome: boolean; order: number };
type HomeConfig = { settings: HomeSettings[]; max: number };

export default function ProductGrid({
  products,
  homeConfig,
  bannerMap,
}: {
  products: Product[];
  homeConfig: HomeConfig | null;
  bannerMap: Record<string, string[]>;
}) {
  const grouped = useMemo(() => {
    const map: Record<string, Product[]> = {};
    products.forEach((p) => {
      const cat = p.category || "أخرى";
      (map[cat] ??= []).push(p);
    });
    for (const cat of Object.keys(map)) {
      map[cat].sort((a, b) => {
        const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
        if (storageDiff !== 0) return storageDiff;
        return colorOrder(a.color) - colorOrder(b.color);
      });
    }
    return map;
  }, [products]);

  const orderedCategories = useMemo(() => {
    const allCats = Object.keys(grouped).filter((c) => c !== "أخرى");
    if (!homeConfig) return allCats;
    const { settings, max } = homeConfig;
    const visibleSettings = settings.filter((s) => s.showInHome);
    if (visibleSettings.length === 0) return allCats;
    const orderedCats = visibleSettings
      .sort((a, b) => a.order - b.order)
      .slice(0, max)
      .map((s) => s.category)
      .filter((c, idx, arr) => arr.indexOf(c) === idx)
      .filter((c) => allCats.some((ac) => ac === c || ac.trim() === c.trim()));
    return orderedCats;
  }, [grouped, homeConfig]);

  if (!products.length) return <p className="text-center text-gray-400 py-10">لا توجد منتجات حالياً</p>;

  return (
    <section className="w-full py-6 sm:py-8 overflow-hidden">
    <div className="max-w-[1380px] mx-auto px-4 sm:px-8">
      {orderedCategories.map((category, catIdx) => (
        <div key={category}>
          <div className="-mx-3 sm:-mx-4 mb-4 sm:mb-6 border-t border-gray-100 pt-4 sm:pt-6">
            <CategoryBanner category={category} images={bannerMap[category]} />
          </div>
          <CategoryRow category={category} items={grouped[category]} isFirst={catIdx === 0} />
        </div>
      ))}
    </div>
    </section>
  );
}

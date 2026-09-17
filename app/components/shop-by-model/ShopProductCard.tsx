"use client";

import { useState } from "react";
import Image from "next/image";
import { FiShoppingBag } from "react-icons/fi";
import Link from "next/link";
import type { ShopProduct } from "./shopByModelData";

export default function ShopProductCard({
  product,
  priority = false,
}: {
  product: ShopProduct;
  priority?: boolean;
}) {
  const [activeColor, setActiveColor] = useState(0);
  const color = product.colors[activeColor];

  return (
    <article className="group relative flex flex-col bg-white rounded-[28px] overflow-hidden border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.07)] transition-all duration-300 hover:shadow-[0_16px_48px_rgba(11,67,253,0.13),0_4px_16px_rgba(0,0,0,0.07)] hover:-translate-y-1 h-full">

      {/* Coming Soon Badge */}
      {product.comingSoon && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-gradient-to-l from-[#0B43FD] to-[#4f8bff] text-white text-[0.6rem] font-bold px-2.5 py-1 rounded-full shadow-[0_2px_10px_rgba(11,67,253,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          قريباً
        </div>
      )}

      {/* Image — only the active color is rendered */}
      <div className="relative w-full overflow-hidden bg-white" style={{ aspectRatio: "3/2.8" }}>
        <Image
          src={color.image}
          alt={`${product.name} - ${color.name}`}
          fill
          sizes="(max-width: 480px) 55vw, (max-width: 768px) 40vw, (max-width: 1100px) 30vw, 22vw"
          className={`object-contain transition-transform duration-500 ${product.imagePadding ?? "p-3 xs:p-5"} ${product.imageScale ?? ""}`}
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          quality={75}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col p-3 xs:p-4 gap-2">

        <h3 className="text-[0.82rem] xs:text-[1rem] font-black text-[#0a0a0a] leading-snug tracking-tight">
          {product.name}
        </h3>

        {/* Color swatches */}
        <div className="flex items-center gap-2">
          {product.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveColor(i)}
              aria-label={`اللون ${c.name}`}
              aria-pressed={activeColor === i}
              className={`rounded-full transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B43FD] focus-visible:ring-offset-2 ${
                activeColor === i
                  ? "w-4 h-4 xs:w-5 xs:h-5 ring-2 ring-[#0B43FD] ring-offset-2 scale-110"
                  : "w-3.5 h-3.5 xs:w-4 xs:h-4 hover:scale-110 hover:ring-2 hover:ring-[#0B43FD]/30 hover:ring-offset-1"
              }`}
              style={{ backgroundColor: c.value, boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)" }}
            />
          ))}
        </div>

        {/* Storage badges */}
        <div className="flex gap-1.5 flex-wrap">
          {product.storage.map((s) => (
            <span
              key={s}
              className="px-1.5 xs:px-2.5 py-0.5 xs:py-1 rounded-lg text-[0.6rem] xs:text-[0.68rem] font-semibold bg-[#f4f6ff] text-[#6b7280] border border-[#e8edf5] select-none"
            >
              {s}
            </span>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/shop/${product.id}`}
          className="mt-3 flex items-center justify-center gap-1 py-2 xs:py-2.5 rounded-[10px] xs:rounded-[12px] bg-[#0B43FD] text-white text-[0.72rem] xs:text-[0.8rem] font-bold shadow-[0_4px_16px_rgba(11,67,253,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(11,67,253,0.5)] active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0B43FD] focus-visible:ring-offset-2"
        >
          <FiShoppingBag size={11} />
          تسوق الآن
        </Link>

      </div>
    </article>
  );
}

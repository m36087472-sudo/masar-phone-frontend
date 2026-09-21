"use client";

import { memo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, CheckCircle2 } from "lucide-react";
import { Icon } from "@iconify/react";
import type { Product, ProductVariant } from "./types";
import { useCartStore } from "../../store/cartStore";
import CurrencyIcon from "../CurrencyIcon";
import { useCurrency } from "../../hooks/useCurrency";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => {
  if (src.startsWith("http")) {
    const idx = src.indexOf("https://", 8);
    return idx > 0 ? src.substring(idx) : src;
  }
  return `${API}${src.startsWith("/") ? src : "/" + src}`;
};

function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const { format, getPrice, symbol } = useCurrency();

  const hasVariants = product.variants && product.variants.length > 0;
  const [activeVariantIdx, setActiveVariantIdx] = useState(0);
  const getDefaultStorageIdx = (variant: ProductVariant | undefined) => {
    if (!variant?.storageOptions) return 0;
    if (variant.defaultStorage) {
      const idx = variant.storageOptions.findIndex(o => o.storage === variant.defaultStorage);
      if (idx >= 0) return idx;
    }
    return 0;
  };
  const [activeStorageIdx, setActiveStorageIdx] = useState(() => getDefaultStorageIdx(product.variants?.[0]));
  const [added, setAdded] = useState(false);

  const activeVariant: ProductVariant | undefined = hasVariants ? product.variants![activeVariantIdx] : undefined;
  const allStorageOptions = (hasVariants ? activeVariant?.storageOptions : undefined) ?? product.variants?.[0]?.storageOptions ?? [];
  const activeStorageOpt = allStorageOptions[activeStorageIdx];

  const baseName = product.name.split("،")[0].trim();
  const selectedColorName = activeVariant?.color ?? product.color ?? "";
  const selectedStorageName = activeStorageOpt?.storage ?? product.storage ?? "";
  const selectedRam = activeStorageOpt?.ram;
  const displayName = `${baseName}${selectedStorageName ? " – " + selectedStorageName : ""}${selectedRam ? " / " + selectedRam : ""}${selectedColorName ? " | " + selectedColorName : ""}`;

  // Build storage key for useCurrency.getPrice
  const storageKey = activeStorageOpt
    ? `${activeStorageOpt.storage}|${activeStorageOpt.ram ?? ""}|${activeStorageOpt.size ?? ""}`
    : undefined;

  const { originalPrice, salePrice, available } = getPrice(product, storageKey);
  const hasDiscount = salePrice != null && salePrice !== originalPrice;
  const displayPrice = hasDiscount ? salePrice! : originalPrice;
  const discountPct = hasDiscount
    ? Math.round(((originalPrice - salePrice!) / originalPrice) * 100)
    : (product.discountPercent ?? 0);

  const variantImages = activeVariant?.images ?? product.images;
  const allImages = variantImages?.length ? variantImages : product.image ? [product.image] : [];
  const mainImage = allImages[0] ? resolveImg(allImages[0]) : "";

  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();

  const handleAddToCart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!available) return;
    addItem({
      ...product,
      name: displayName,
      color: activeVariant?.color ?? product.color,
      storage: activeStorageOpt?.storage ?? product.storage,
      originalPrice,
      salePrice: salePrice ?? undefined,
      image: allImages[0],
      images: [allImages[0]],
    });
    setAdded(true);
    setTimeout(() => { setAdded(false); router.push("/cart"); }, 800);
  }, [addItem, product, activeVariant, activeStorageOpt, originalPrice, salePrice, allImages, displayName, router, available]);

  return (
    <div dir="rtl"
      className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#e8edf5] hover:border-[#0B43FD]/30 hover:shadow-[0_8px_28px_rgba(11,67,253,0.10)] transition-all duration-200"
    >
      {/* ── Image ── */}
      <Link href={`/product/${product._id}`} className="relative w-full aspect-[4/3] sm:aspect-square bg-white overflow-hidden cursor-pointer block">
        {discountPct > 0 && (
          <span className="absolute top-2 right-2 z-10 bg-[#0B43FD] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
            -{discountPct}%
          </span>
        )}
        {!available && (
          <span className="absolute top-2 left-2 z-10 bg-gray-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
            غير متاح
          </span>
        )}
        {mainImage && (
          <Image src={mainImage} alt={product.name} fill priority={priority}
            loading={priority ? "eager" : "lazy"}
            className="object-contain p-3"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
        )}
      </Link>

      {/* ── Body ── */}
      <div className="flex flex-col gap-1 sm:gap-1 p-2 sm:p-4 flex-1">

        {/* Name */}
        <Link href={`/product/${product._id}`} className="text-[11px] sm:text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 min-h-[28px] sm:min-h-[34px] cursor-pointer">
          {displayName}
        </Link>

        {/* Colors */}
        {hasVariants && product.variants!.length > 1 && (
          <div className="flex gap-1.5 items-center">
            {product.variants!.map((v, i) => (
              <button key={`${i}-${v.color}`} title={v.color}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveVariantIdx(i); }}
                className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 transition-transform duration-150 cursor-pointer ${activeVariantIdx === i ? "border-[#0B43FD] scale-110 shadow-[0_0_0_2px_rgba(11,67,253,0.25)]" : "border-gray-300"}`}
                style={{ backgroundColor: v.colorCode }}
              />
            ))}
          </div>
        )}

        {/* Storage */}
        {allStorageOptions.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {allStorageOptions.map((opt, i) => {
              const isActive = activeStorageIdx === i;
              return (
                <button key={`${activeVariantIdx}-${i}-${opt.storage}-${opt.chip ?? ""}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveStorageIdx(i); }}
                  className={`flex flex-col items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-[#0B43FD] text-white border-[#0B43FD] shadow-sm shadow-[#0B43FD]/20"
                      : "bg-white text-[#0B43FD] border-[#0B43FD]/30 hover:border-[#0B43FD]/60"
                  }`}
                >
                  {opt.chip && (
                    <span className={`text-[8px] sm:text-[9px] font-black leading-tight ${isActive ? "text-white" : "text-gray-800"}`}>{opt.chip}</span>
                  )}
                  <span className="text-[9px] sm:text-[11px] font-black leading-tight">{opt.storage}</span>
                  {(opt.ram || opt.size) && (
                    <span className={`text-[7px] sm:text-[8px] font-bold leading-tight ${isActive ? "text-white/70" : "text-gray-400"}`}>
                      {opt.size ?? ""}{opt.size && opt.ram ? " • " : ""}{opt.ram ?? ""}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Price */}
        {available ? (
          <div className="flex items-baseline gap-1 pt-1 border-t border-gray-100">
            <span className="text-[14px] sm:text-[20px] font-black text-[#0B43FD] leading-none">{format(displayPrice)}</span>
            <CurrencyIcon className="w-[13px] h-[13px] sm:w-[15px] sm:h-[15px] inline align-middle" />
            {hasDiscount && <span className="text-[9px] sm:text-[10px] text-gray-400 line-through">{format(originalPrice)}</span>}
          </div>
        ) : (
          <div className="flex items-center pt-1 border-t border-gray-100">
            <span className="text-[11px] text-gray-400 font-semibold">غير متاح في دولتك</span>
          </div>
        )}

        {/* Down payment — only for SAR for now (installment is SAR-specific) */}
        {available && product.installment?.available && product.installment.downPayment && (
          <div className="flex items-center gap-1 bg-gradient-to-l from-[#0B43FD]/10 to-[#e8eeff] border border-[#0B43FD]/20 rounded-lg px-2 py-1">
            <Icon icon="solar:card-bold" width={11} className="text-[#0B43FD] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-600">دفعة أولى</span>
            <span className="text-[11px] sm:text-[12px] font-black text-[#0B43FD] leading-none">
              {format(product.installment.downPayment)}
            </span>
            <CurrencyIcon className="w-[10px] h-[10px] sm:w-[11px] sm:h-[11px] inline align-middle" />
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || !available}
          className={`mt-2 w-full flex items-center justify-center gap-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-[12px] font-black text-white border-none cursor-pointer transition-opacity duration-150 ${
            added ? "bg-emerald-500" : "bg-[#0B43FD]"
          } disabled:bg-gray-300 disabled:cursor-not-allowed hover:opacity-90`}
        >
          {added
            ? <><CheckCircle2 size={13} /><span>تمت الإضافة</span></>
            : !product.inStock
              ? <span>غير متوفر</span>
              : !available
                ? <span>غير متاح</span>
                : <><ShoppingCart size={13} /><span>أضف للسلة</span></>}
        </button>

      </div>
    </div>
  );
}

export default memo(ProductCard);

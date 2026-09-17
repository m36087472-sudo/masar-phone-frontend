"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { IoArrowForward, IoShareSocial, IoHomeOutline } from "react-icons/io5";
import type { Product } from "../../components/products/types";
import ProductImages from "./components/ProductImages";
import ProductInfo from "./components/ProductInfo";
import ProductDetails from "./components/ProductDetails";
import ProductSections from "./components/ProductSections";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

export default function ProductPageClient({
  id,
  initialProduct,
}: {
  id: string;
  initialProduct: Product | null;
}) {
  const router = useRouter();

  const product = initialProduct;
  const firstVariant = product?.variants?.[0];
  const toKey = (o: { storage: string; ram?: string; size?: string }) =>
    `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}`;

  const [selectedColor, setSelectedColor] = useState<string>(
    () => firstVariant?.color ?? product?.color ?? ""
  );

  const [selectedStorage, setSelectedStorage] = useState<string>(() => {
    const defStorage = firstVariant?.defaultStorage;
    const defOpt =
      firstVariant?.storageOptions?.find((o) => o.storage === defStorage) ??
      firstVariant?.storageOptions?.[0];
    return defOpt ? toKey(defOpt) : product?.storage ?? "";
  });

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
        <p className="text-gray-400 text-lg">المنتج غير موجود</p>
      </div>
    );

  const activeVariant = product.variants?.find((v) => v.color === selectedColor);
  const activeStorageOptions = activeVariant?.storageOptions ?? product.variants?.[0]?.storageOptions ?? [];
  const activeStorage = activeStorageOptions.find((s) => `${s.storage}|${s.ram ?? ""}|${s.size ?? ""}` === selectedStorage) ?? activeStorageOptions.find((s) => s.storage === selectedStorage);

  const merged = activeVariant?.images?.length
    ? activeVariant.images
    : [...(product.images ?? []), ...(product.image ? [product.image] : [])];
  const allImages = [...new Set(merged)].map(resolveImg);

  const displayProduct: Product = {
    ...product,
    color: selectedColor || product.color,
    storage: activeStorage?.storage || selectedStorage.split("|")[0] || product.storage,
    originalPrice: activeStorage?.originalPrice ?? product.originalPrice,
    salePrice: activeStorage?.salePrice ?? product.salePrice,
    image: activeVariant?.images?.[0] ?? product.image,
    images: activeVariant?.images?.length ? activeVariant.images : product.images,
  };

  const discountPct =
    displayProduct.salePrice != null && displayProduct.salePrice !== displayProduct.originalPrice
      ? Math.round(((displayProduct.originalPrice - displayProduct.salePrice) / displayProduct.originalPrice) * 100)
      : 0;

  const handleShare = async () => {
    try { await navigator.share({ title: product.name, url: window.location.href }); } catch {}
  };

  return (
    <main className="min-h-screen pb-10" dir="rtl" style={{ background: "#f4f6f8" }}>

      {/* NAV */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#0B43FD] text-white shadow-md shadow-[#0B43FD]/30 active:scale-95 transition-transform"
            >
              <IoArrowForward size={16} />
            </button>
            <nav className="flex items-center gap-1 min-w-0 text-xs">
              <Link href="/" className="flex items-center gap-1 text-gray-400 hover:text-[#0B43FD] transition-colors shrink-0">
                <IoHomeOutline size={12} />
                <span className="hidden sm:inline">الرئيسية</span>
              </Link>
              <span className="text-gray-300 shrink-0">/</span>
              <span className="font-bold text-gray-700 truncate text-xs sm:text-sm">{product.name.split("،")[0].trim()}</span>
            </nav>
          </div>
          <button
            onClick={handleShare}
            className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-[#0B43FD] text-white shadow-md shadow-[#0B43FD]/30 active:scale-95 transition-transform"
          >
            <IoShareSocial size={14} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 mt-3 sm:mt-5">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 lg:gap-7">
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
          >
            <ProductImages images={allImages} name={product.name} discountPercent={discountPct} />
          </motion.div>

          <div className="lg:col-span-5">
            <ProductInfo
              product={displayProduct}
              selectedColor={selectedColor}
              selectedStorage={selectedStorage}
              onColorChange={(c) => {
                setSelectedColor(c);
                const newVariant = product.variants?.find((v) => v.color === c);
                const opts = newVariant?.storageOptions ?? [];
                const def = newVariant?.defaultStorage;
                const defOpt = opts.find((o) => o.storage === def) ?? opts[0];
                if (defOpt) setSelectedStorage(`${defOpt.storage}|${defOpt.ram ?? ""}`);
              }}
              onStorageChange={(s) => setSelectedStorage(s)}
            />
          </div>
        </div>

        <ProductDetails
          description={displayProduct.description}
          specGroups={displayProduct.specGroups}
          installment={displayProduct.installment}
        />

        <ProductSections sections={displayProduct.sections} />
      </div>

    </main>
  );
}

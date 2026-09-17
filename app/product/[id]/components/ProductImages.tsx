"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  images: string[];
  name: string;
  discountPercent?: number;
}

export default function ProductImages({ images, name, discountPercent = 0 }: Props) {
  const [sel, setSel] = useState(0);
  const touchX = useRef(0);

  const go = (d: number) => setSel((s) => (s + d + images.length) % images.length);

  return (
    <>
      {/* Mobile: column layout */}
      <div className="flex flex-col gap-3 lg:hidden" dir="rtl">
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-white" />
          <div
            className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-xl shadow-black/8"
            style={{ aspectRatio: "1/1" }}
            onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              const d = touchX.current - e.changedTouches[0].clientX;
              if (Math.abs(d) > 40) go(d > 0 ? 1 : -1);
            }}
          >
            {discountPercent > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 left-3 z-10 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/40"
              >
                خصم {discountPercent}%
              </motion.div>
            )}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 z-10 bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                {sel + 1} / {images.length}
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={sel}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-white"
              >
                {images.length > 0 ? (
                  <Image src={images[sel]} alt={name} fill priority={sel === 0} loading={sel === 0 ? "eager" : "lazy"} className="object-contain p-6" sizes="(max-width: 1024px) 100vw, 50vw" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-7xl">📱</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {images.slice(0, 6).map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setSel(i)}
                whileTap={{ scale: 0.92 }}
                className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden transition-all duration-200 ${
                  i === sel
                    ? "ring-2 ring-[#0B43FD] ring-offset-1 shadow-md shadow-[#0B43FD]/20"
                    : "bg-white border border-gray-100 opacity-50 hover:opacity-90"
                }`}
              >
                <div className="absolute inset-0 bg-white" />
                <Image src={img} alt="" fill sizes="56px" loading="lazy" className="object-contain p-1.5" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnails on the side */}
      <div className="hidden lg:flex gap-3 h-full" dir="rtl">
        {images.length > 1 && (
          <div className="flex flex-col gap-2 w-[60px] shrink-0">
            {images.slice(0, 6).map((img, i) => (
              <motion.button
                key={i}
                onClick={() => setSel(i)}
                whileTap={{ scale: 0.92 }}
                className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200 ${
                  i === sel
                    ? "ring-2 ring-[#0B43FD] ring-offset-1 shadow-md shadow-[#0B43FD]/20"
                    : "bg-white border border-gray-100 opacity-50 hover:opacity-90"
                }`}
              >
                <div className="absolute inset-0 bg-white" />
                <Image src={img} alt="" fill sizes="60px" loading="lazy" className="object-contain p-1.5" />
              </motion.button>
            ))}
          </div>
        )}
        <div className="flex-1 relative">
          <div className="absolute inset-0 rounded-3xl bg-white" />
          <div
            className="relative rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-black/8"
            style={{ aspectRatio: "1/1" }}
          >
            {discountPercent > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-3 left-3 z-10 bg-gradient-to-br from-red-500 to-rose-600 text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-lg shadow-red-500/40"
              >
                خصم {discountPercent}%
              </motion.div>
            )}
            {images.length > 1 && (
              <div className="absolute top-3 right-3 z-10 bg-black/20 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                {sel + 1} / {images.length}
              </div>
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={sel}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 bg-white"
              >
                {images.length > 0 ? (
                  <Image src={images[sel]} alt={name} fill priority={sel === 0} loading={sel === 0 ? "eager" : "lazy"} className="object-contain p-10" sizes="(max-width: 1280px) 60vw, 700px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-200 text-7xl">📱</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

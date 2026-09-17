"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RiSubtractLine, RiAddLine, RiDeleteBin6Line } from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

interface PremiumCartItemProps {
  product: {
    _id: string;
    name: string;
    price: number;
    salePrice?: number;
    originalPrice?: number;
    images?: string[];
    image?: string;
  };
  qty: number;
  onUpdateQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

export default function PremiumCartItem({ product, qty, onUpdateQty, onRemove }: PremiumCartItemProps) {
  const currentPrice = product.salePrice ?? product.originalPrice ?? product.price;
  const originalPrice = product.originalPrice ?? product.price;
  const hasDiscount = product.salePrice && product.originalPrice && product.salePrice < product.originalPrice;
  const rawImg = product.images?.[0] || product.image;
  const img = rawImg ? resolveImg(rawImg) : undefined;
  const lineTotal = currentPrice * qty;
  const discount = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, x: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="p-5 flex gap-5">
        {/* Product Image */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 sm:w-36 sm:h-36 bg-[#F7F9FC] rounded-xl overflow-hidden border border-[#E8EDF5] relative">
            {img ? (
              <Image src={img} alt={product.name} fill className="object-contain p-3" />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-5xl">📱</div>
            )}
          </div>
          {hasDiscount && (
            <div className="absolute top-2 right-2 bg-[#0874ED] text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
              خصم -{discount}%
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Top Section */}
          <div>
            <h3 className="text-base font-bold text-[#040D2A] leading-relaxed line-clamp-2 mb-3">
              {product.name}
            </h3>
            
            {/* Pricing */}
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-[#0874ED]">{fmt(currentPrice)}</span>
              <span className="text-sm text-[#6B7A8D]">ريال</span>
              {hasDiscount && (
                <span className="text-sm text-[#C8D0DC] line-through decoration-2">{fmt(originalPrice)} ريال</span>
              )}
            </div>
          </div>

          {/* Bottom Section - Controls */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t border-[#F1F5FB]">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6B7A8D] font-medium ml-2">الكمية:</span>
              <div className="flex items-center bg-[#F7F9FC] border border-[#E8EDF5] rounded-xl overflow-hidden">
                <button
                  onClick={() => onUpdateQty(product._id, qty - 1)}
                  className="w-9 h-9 flex items-center justify-center text-[#6B7A8D] hover:text-[#040D2A] hover:bg-[#E8EDF5] transition-colors"
                  aria-label="إنقاص الكمية"
                >
                  <RiSubtractLine size={16} />
                </button>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={qty}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="w-10 text-center text-sm font-bold text-[#040D2A]"
                  >
                    {qty}
                  </motion.span>
                </AnimatePresence>
                <button
                  onClick={() => onUpdateQty(product._id, qty + 1)}
                  className="w-9 h-9 flex items-center justify-center text-[#0874ED] hover:bg-[#0874ED]/10 transition-colors"
                  aria-label="زيادة الكمية"
                >
                  <RiAddLine size={16} />
                </button>
              </div>
            </div>

            {/* Total & Delete */}
            <div className="flex items-center gap-4">
              <div className="text-left">
                <p className="text-xs text-[#6B7A8D] mb-0.5">الإجمالي</p>
                <p className="text-lg font-bold text-[#040D2A]">
                  {fmt(lineTotal)} <span className="text-xs font-normal text-[#6B7A8D]">ريال</span>
                </p>
              </div>
              <button
                onClick={() => onRemove(product._id)}
                className="w-10 h-10 flex items-center justify-center rounded-xl text-[#C8D0DC] hover:text-red-500 hover:bg-red-50 transition-all"
                aria-label="حذف المنتج"
              >
                <RiDeleteBin6Line size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

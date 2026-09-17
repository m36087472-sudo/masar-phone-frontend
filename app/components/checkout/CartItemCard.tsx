"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { RiSubtractLine, RiAddLine, RiDeleteBin6Line } from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

interface CartItemCardProps {
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

export default function CartItemCard({ product, qty, onUpdateQty, onRemove }: CartItemCardProps) {
  const price      = product.salePrice ?? product.originalPrice ?? product.price;
  const hasDiscount = product.salePrice && product.originalPrice && product.salePrice < product.originalPrice;
  const rawImg     = product.images?.[0] || product.image;
  const img        = rawImg ? resolveImg(rawImg) : undefined;
  const lineTotal  = price * qty;
  const discount   = hasDiscount ? Math.round(((product.originalPrice! - product.salePrice!) / product.originalPrice!) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ duration: 0.22 }}
      className="bg-[#FEFEFE] rounded-xl border border-[#E8EDF5] p-3 sm:p-4 flex gap-3"
    >
      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 bg-[#F7F9FC] rounded-xl overflow-hidden border border-[#E8EDF5]">
        {img ? (
          <Image src={img} alt={product.name} fill className="object-contain p-2" />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-4xl">📱</span>
        )}
        {hasDiscount && (
          <span className="absolute top-1.5 right-1.5 bg-[#0874ED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h3 className="text-xs sm:text-sm font-medium text-[#040D2A] leading-snug line-clamp-2">{product.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-sm font-bold text-[#0874ED]">{fmt(price)}</span>
            <span className="text-[11px] text-[#8A96A8]">ريال</span>
            {hasDiscount && (
              <span className="text-[11px] text-[#B0BCCE] line-through">{fmt(product.originalPrice!)} ريال</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-2">
          {/* Qty */}
          <div className="flex items-center bg-[#F7F9FC] border border-[#E8EDF5] rounded-lg overflow-hidden">
            <button
              onClick={() => onUpdateQty(product._id, qty - 1)}
              className="w-7 h-7 flex items-center justify-center text-[#8A96A8] hover:text-[#040D2A] hover:bg-[#E8EDF5] transition"
            >
              <RiSubtractLine size={12} />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={qty}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="w-7 text-center text-xs font-bold text-[#040D2A]"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={() => onUpdateQty(product._id, qty + 1)}
              className="w-7 h-7 flex items-center justify-center text-[#0874ED] hover:bg-[#0874ED]/10 transition"
            >
              <RiAddLine size={12} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-left">
              <p className="text-[9px] text-[#B0BCCE]">الإجمالي</p>
              <p className="text-xs font-bold text-[#040D2A]">{fmt(lineTotal)} <span className="text-[10px] font-normal text-[#B0BCCE]">ريال</span></p>
            </div>
            <button
              onClick={() => onRemove(product._id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[#C8D0DC] hover:text-red-400 hover:bg-red-50 transition"
            >
              <RiDeleteBin6Line size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

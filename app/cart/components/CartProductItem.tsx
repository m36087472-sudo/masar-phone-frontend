import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { RiDeleteBin6Line, RiSubtractLine, RiAddLine } from "react-icons/ri";
import type { Product } from "../../components/products/types";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

interface Props {
  product: Product;
  qty: number;
  cartKey: string;
  onRemove: (cartKey: string) => void;
  onUpdateQty: (cartKey: string, qty: number) => void;
}

export default function CartProductItem({ product, qty, cartKey, onRemove, onUpdateQty }: Props) {
  const price = product.salePrice ?? product.originalPrice ?? product.price;
  const hasDiscount = product.salePrice && product.originalPrice && product.salePrice < product.originalPrice;
  const discount = hasDiscount ? Math.round(((product.originalPrice! - product.salePrice!) / product.originalPrice!) * 100) : 0;
  const rawImg = product.images?.[0] || product.image;
  const img = rawImg ? resolveImg(rawImg) : undefined;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -24, scale: 0.97 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 px-3 sm:px-4 py-3 sm:py-4 hover:bg-[#FAFBFF] transition-colors group"
    >
      {/* صورة المنتج */}
      <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-gradient-to-br from-[#F0F4FF] to-[#E8EDF5] rounded-xl sm:rounded-2xl overflow-hidden border border-[#E8EDF5]">
        {img
          ? <Image src={img} alt={product.name} fill className="object-contain p-2" />
          : <span className="flex items-center justify-center w-full h-full text-3xl">📱</span>
        }
        {hasDiscount && (
          <span className="absolute top-1.5 right-1.5 bg-[#0874ED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-lg">
            -{discount}%
          </span>
        )}
      </div>

      {/* التفاصيل */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">

        {/* الصف الأول: الاسم + زر الحذف */}
        <div className="flex items-start justify-between gap-1.5">
          <p className="text-xs sm:text-sm font-semibold text-[#040D2A] leading-snug line-clamp-2">{product.name.split("،")[0].trim()}{product.storage ? ` – ${product.storage}` : ""}{product.color ? ` | ${product.color}` : ""}</p>
          <button
            onClick={() => onRemove(cartKey)}
            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-lg sm:rounded-xl text-[#C8D0DC] hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shrink-0"
          >
            <RiDeleteBin6Line size={12} />
          </button>
        </div>

        {/* الصف الثاني: السعر */}
        <div className="flex items-baseline gap-1 mt-1 flex-wrap">
          <span className="text-sm sm:text-base font-extrabold text-[#0874ED]">{fmt(price)}</span>
          <span className="text-[11px] text-[#8A96A8]">ريال</span>
          {hasDiscount && (
            <span className="text-[10px] sm:text-xs text-[#B0BCCE] line-through">{fmt(product.originalPrice!)} ريال</span>
          )}
        </div>

        {/* الصف الثالث: الإجمالي + أزرار الكمية */}
        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] text-[#8A96A8]">الإجمالي:</span>
            <span className="text-[11px] sm:text-xs font-bold text-[#040D2A]">{fmt(price * qty)} ريال</span>
          </div>

          {/* أزرار الكمية */}
          <div className="flex items-center rounded-lg sm:rounded-xl overflow-hidden border border-[#E8EDF5] shadow-sm">
            <button
              onClick={() => onUpdateQty(cartKey, qty - 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#F7F9FC] hover:bg-red-50 text-[#8A96A8] hover:text-red-500 transition-all"
            >
              <RiSubtractLine size={11} />
            </button>
            <AnimatePresence mode="wait">
              <motion.span
                key={qty}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="w-7 sm:w-9 text-center text-xs sm:text-sm font-bold text-[#040D2A] bg-white border-x border-[#E8EDF5]"
              >
                {qty}
              </motion.span>
            </AnimatePresence>
            <button
              onClick={() => onUpdateQty(cartKey, qty + 1)}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#F7F9FC] hover:bg-[#0874ED]/10 text-[#0874ED] transition-all"
            >
              <RiAddLine size={11} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

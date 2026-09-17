"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { FadeUp } from "./shared";

export default function AboutCTA() {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-8 pt-8 sm:pt-10 pb-12 sm:pb-16">
      <FadeUp>
        <div className="bg-[#0B43FD] rounded-2xl p-6 sm:p-10 lg:p-12 text-center text-white">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-4 sm:mb-5">
            <ShoppingBag size={20} className="text-white" />
          </div>
          <h3 className="text-xl sm:text-3xl font-black mb-2 sm:mb-3">جاهز تختار جوالك القادم؟</h3>
          <p className="text-blue-100/80 text-sm sm:text-base mb-1 max-w-sm mx-auto">
            اكتشف أحدث المنتجات والعروض المتاحة واختر الجهاز الذي يناسبك
          </p>
          <p className="text-blue-200/50 text-xs mb-5 sm:mb-7 tracking-wide">تصفح ← اختر ← ادفع ← استلم</p>
          <Link
            href="/shop/17-pro-max"
            className="inline-flex items-center gap-2 bg-white text-[#0B43FD] font-bold px-6 sm:px-7 py-2.5 sm:py-3 rounded-xl text-sm shadow-md hover:bg-blue-50 transition-all active:scale-95"
          >
            <ShoppingBag size={15} />
            تسوّق الآن
          </Link>
        </div>
      </FadeUp>
    </section>
  );
}

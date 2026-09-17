"use client";
import Link from "next/link";
import { Smartphone, ChevronDown } from "lucide-react";

export default function AboutHero() {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #0B43FD 0%, #1a6bff 35%, #3d8bff 65%, #0B43FD 100%)" }}>
      {/* subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 text-center text-white">
        {/* badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-100 mb-5 tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
          مسار الهاتف المعتمد
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 sm:mb-5">
          أكثر من مجرد
          <br />
          <span className="text-blue-200">متجر جوالات</span>
        </h1>

        <p className="text-blue-100/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-7 sm:mb-10">
          تجربة تجمع بين المنتجات الموثوقة، الأسعار المنافسة، خيارات الدفع المرنة،
          وخدمة تهتم بك من لحظة اختيار جهازك وحتى وصوله إليك
        </p>

        <Link
          href="/shop/17-pro-max"
          className="inline-flex items-center gap-2 bg-white text-[#0B43FD] font-bold px-7 py-3 rounded-xl text-sm shadow-lg hover:bg-blue-50 transition-all active:scale-95"
        >
          <Smartphone size={16} />
          تصفح الهواتف
        </Link>

        <div className="mt-7 flex justify-center text-white/30 animate-bounce" style={{ animationDuration: "2s" }}>
          <ChevronDown size={22} />
        </div>
      </div>

      {/* bottom wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1440 60" className="w-full h-10 sm:h-14" preserveAspectRatio="none">
          <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f8faff" />
        </svg>
      </div>
    </section>
  );
}

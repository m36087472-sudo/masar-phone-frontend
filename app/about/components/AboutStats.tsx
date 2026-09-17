"use client";
import { FadeUp, AnimatedCounter } from "./shared";
import { stats } from "../data";

export default function AboutStats() {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-8 -mt-6 relative z-10">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {stats.map((s, i) => (
          <FadeUp key={s.label} delay={i * 80}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-5 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2 sm:mb-3 text-[#0B43FD]">
                <s.Icon size={16} className="sm:hidden" />
                <s.Icon size={20} className="hidden sm:block" />
              </div>
              <p className="text-xl sm:text-2xl font-black text-[#0B43FD] mb-0.5 sm:mb-1">
                <AnimatedCounter target={s.value} />
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-tight">{s.label}</p>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

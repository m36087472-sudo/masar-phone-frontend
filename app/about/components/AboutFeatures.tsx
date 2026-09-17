"use client";
import { FadeUp } from "./shared";
import { features } from "../data";

export default function AboutFeatures() {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-8 pt-10 sm:pt-20">
      <FadeUp>
        <p className="text-xs sm:text-sm font-bold text-[#0B43FD] uppercase tracking-widest mb-2 text-center">مميزاتنا</p>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-6 sm:mb-10 text-center">
          تجربة مسار تبدأ قبل الشراء
        </h2>
      </FadeUp>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {features.map((f, i) => (
          <FadeUp key={i} delay={i * 60}>
            <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 sm:px-5 sm:py-4 hover:border-blue-200 hover:bg-blue-50/40 transition-all duration-200">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                <f.Icon size={16} />
              </div>
              <span className="text-slate-700 text-sm sm:text-base font-medium">{f.text}</span>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

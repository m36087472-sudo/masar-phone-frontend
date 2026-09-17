"use client";
import { FadeUp } from "./shared";
import { whyCards } from "../data";

export default function AboutWhy() {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-8 pt-10 sm:pt-20">
      <FadeUp>
        <p className="text-xs sm:text-sm font-bold text-[#0B43FD] uppercase tracking-widest mb-2 text-center">لماذا مسار؟</p>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-6 sm:mb-10 text-center">
          ما يميّزنا عن غيرنا
        </h2>
      </FadeUp>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {whyCards.map((c, i) => (
          <FadeUp key={c.title} delay={i * 80}>
            <div className="flex gap-3 sm:gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                <c.Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 sm:mb-1.5">{c.title}</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{c.desc}</p>
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

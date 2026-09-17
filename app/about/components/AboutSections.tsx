"use client";
import { FadeUp } from "./shared";
import { sections, values } from "../data";

export default function AboutSections() {
  return (
    <section className="w-full max-w-4xl mx-auto px-3 sm:px-8 pt-10 sm:pt-20 space-y-6 sm:space-y-10">

      {/* من نحن / رؤيتنا / رسالتنا */}
      <div className="flex flex-col gap-3 sm:gap-4">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 80}>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                  <s.Icon size={20} />
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg">{s.title}</h3>
              </div>
              <div className="space-y-2">
                {s.content.map((p, j) => (
                  <p key={j} className="text-slate-500 text-sm sm:text-base leading-relaxed">{p}</p>
                ))}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>

      {/* قيمنا */}
      <FadeUp>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-6 lg:p-8">
          <p className="text-xs sm:text-sm font-bold text-[#0B43FD] uppercase tracking-widest mb-2 text-center">قيمنا</p>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mb-4 sm:mb-6 text-center">ما نؤمن به</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {values.map((v, i) => (
              <FadeUp key={v.title} delay={i * 60}>
                <div className="flex items-start gap-3 p-3 sm:p-5 rounded-xl bg-slate-50 hover:bg-blue-50/50 transition-colors">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-[#0B43FD]">
                    <v.Icon size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm sm:text-base mb-0.5 sm:mb-1">{v.title}</p>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </FadeUp>

    </section>
  );
}

"use client";
import { useEffect, useRef, useState, ReactNode } from "react";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0) scale(1)" : "translateY(32px) scale(0.97)",
      transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const IconArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconBox = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const IconBan = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const IconXCircle = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const policies = [
  {
    Icon: IconBox,
    num: "01",
    title: "حالة المنتج عند الإرجاع",
    desc: "يجب أن يكون المنتج بحالته الأصلية تمامًا — غير مستخدم، بتغليفه الكامل، مع جميع الملحقات والفاتورة. أي خدش أو علامة استخدام قد تؤثر على قبول الطلب.",
  },
  {
    Icon: IconClock,
    num: "02",
    title: "مهلة طلب الاسترجاع",
    desc: "يُقبل طلب الاستبدال أو الاسترجاع خلال المدة المحددة من تاريخ الاستلام. تواصل مع فريق مسار فور اكتشاف أي مشكلة لضمان معالجة طلبك بأسرع وقت.",
  },
  {
    Icon: IconBan,
    num: "03",
    title: "منتجات لا تقبل الإرجاع",
    desc: "بعض المنتجات مستثناة من سياسة الاسترجاع بعد فتحها أو تفعيلها، كالمنتجات الرقمية والطلبات المخصصة. يُرجى مراجعة تفاصيل المنتج قبل الشراء.",
  },
  {
    Icon: IconXCircle,
    num: "04",
    title: "إلغاء الطلب",
    desc: "يمكنك إلغاء طلبك بسهولة قبل مرحلة التجهيز أو الشحن. بعد الشحن، يُطبَّق نظام الاسترجاع المعتمد ويتواصل معك فريق مسار لإتمام الإجراءات.",
  },
];

const highlights = [
  "يحق لمسار رفض الطلب إذا لم تستوفِ الشروط المطلوبة",
  "يُستردّ المبلغ بنفس طريقة الدفع الأصلية دون أي خصومات",
  "قد تستغرق عملية الاسترداد من 5 إلى 14 يوم عمل",
  "رسوم الشحن غير قابلة للاسترداد في بعض الحالات",
];

type Company = { whatsapp?: string; email?: string; phone?: string };

export default function ReturnPolicyClient() {
  const [heroVis, setHeroVis] = useState(false);
  const [company, setCompany] = useState<Company | null>(null);

  useEffect(() => { const t = setTimeout(() => setHeroVis(true), 80); return () => clearTimeout(t); }, []);
  useEffect(() => {
    fetch("/api/admin/company").then(r => r.json()).then(setCompany).catch(() => {});
  }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVis ? 1 : 0,
      transform: heroVis ? "translateY(0)" : "translateY(30px)",
      transition: `opacity 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.8s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    },
  });

  return (
    <main className="min-h-screen overflow-x-hidden" dir="rtl" style={{ background: "#f8faff" }}>

      {/* ════════ HERO ════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0B43FD 0%, #1a6bff 35%, #3d8bff 65%, #0B43FD 100%)" }}
      >
        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 text-center text-white">
          {/* Badge */}
          <div {...anim(100)}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-100 mb-5 tracking-wide">
              <IconShield />
              <span>حقوقك محفوظة دائمًا</span>
            </div>
          </div>

          {/* Title */}
          <div {...anim(250)}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              استبدال سهل. استرجاع مضمون.
              <br />
              <span className="text-blue-200">وراحة بال من أول يوم.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div {...anim(400)}>
            <p className="text-blue-100/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-7">
              في مسار نؤمن أن تجربة الشراء لا تنتهي عند الاستلام — شروط واضحة وفريق جاهز لمساعدتك في كل خطوة
            </p>
          </div>

          {/* Scroll indicator */}
          <div {...anim(550)}>
            <div className="flex justify-center text-white/30 animate-bounce" style={{ animationDuration: "2s" }}>
              <IconArrowDown />
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 60" className="w-full h-10 sm:h-14" preserveAspectRatio="none">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f8faff" />
          </svg>
        </div>
      </section>

      {/* ════════ POLICY CARDS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 mt-8 sm:mt-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-5">
          {policies.map((p, i) => (
            <FadeUp key={p.title} delay={i * 100}>
              <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.04] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-400">
                <div className="h-1 w-full bg-gradient-to-l from-[#0B43FD] to-[#3d8bff]" />
                <div className="p-4 sm:p-7">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0B43FD]/8 flex items-center justify-center shrink-0 text-[#0B43FD] group-hover:scale-110 transition-transform duration-300">
                      <p.Icon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black tracking-widest text-[#0B43FD]/40">{p.num}</span>
                      <h3 className="text-sm sm:text-lg font-extrabold text-gray-800 leading-snug">{p.title}</h3>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-[15px] leading-relaxed">{p.desc}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ════════ HIGHLIGHTS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 pt-8 sm:pt-14">
        <FadeUp>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-4 sm:p-8 lg:p-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#0B43FD]/5 blur-[60px]" />
            <h3 className="text-[#0B43FD] font-extrabold text-base sm:text-xl lg:text-2xl mb-4 sm:mb-6 relative">
              ملاحظات مهمة يجب معرفتها
              <span className="block h-1 w-12 mt-2 rounded-full bg-[#0B43FD]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 relative">
              {highlights.map((note, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="flex items-center gap-3 bg-[#0B43FD]/5 rounded-xl px-3 sm:px-4 py-3 border border-[#0B43FD]/15">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                      <IconCheck />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">{note}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ CONTACT ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 mt-6 sm:mt-12">
        <ContactSection
          title="التواصل بخصوص الطلبات"
          phone={company?.phone}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}

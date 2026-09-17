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
const IconLockShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" />
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="8.01" />
    <line x1="12" y1="12" x2="12" y2="16" />
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0110 0v4" />
  </svg>
);
const IconCheck = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const policies = [
  {
    Icon: IconDoc,
    num: "01",
    title: "استخدام الموقع",
    desc: "باستخدامك لموقع مسار الهاتف المعتمد فإنك توافق على الالتزام بالشروط والأحكام المعمول بها — نسعى دائمًا لتقديم تجربة تسوق شفافة وموثوقة.",
  },
  {
    Icon: IconShield,
    num: "02",
    title: "الخصوصية وحماية البيانات",
    desc: "بياناتك ملكك وحدك. نلتزم بالحفاظ على خصوصيتك الكاملة ولا نستخدم معلوماتك إلا في حدود معالجة طلبك وتحسين تجربتك معنا.",
  },
  {
    Icon: IconInfo,
    num: "03",
    title: "دقة المعلومات",
    desc: "نحرص على عرض المنتجات والأسعار والمواصفات بأعلى درجات الدقة. في حال حدوث أي تحديث أو تعديل، نسعى للإشعار المسبق قدر الإمكان.",
  },
  {
    Icon: IconChat,
    num: "04",
    title: "الطلبات والتواصل",
    desc: "قد يتواصل فريق مسار معك لتأكيد تفاصيل طلبك أو بيانات الشحن — هدفنا الوحيد هو ضمان وصول طلبك بشكل صحيح وفي الوقت المناسب.",
  },
];

const commitments = [
  "لا نشارك بياناتك الشخصية مع أي طرف ثالث",
  "نستخدم تشفيرًا آمنًا لحماية معلومات الدفع",
  "يمكنك طلب حذف بياناتك في أي وقت",
  "نحتفظ بالبيانات فقط للمدة اللازمة لإتمام الخدمة",
];

type Company = { nameAr?: string; addressAr?: string; phone?: string; whatsapp?: string; email?: string; taxNumber?: string };

export default function PrivacyClient() {
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
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 text-center text-white">
          <div {...anim(100)}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-100 mb-5 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
              <IconLockShield />
              <span>بياناتك في أمان تام</span>
            </div>
          </div>

          <div {...anim(250)}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              خصوصيتك أولويتنا.
              <br />
              <span className="text-blue-200">وثقتك مسؤوليتنا.</span>
            </h1>
          </div>

          <div {...anim(400)}>
            <p className="text-blue-100/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-7">
              في مسار نؤمن أن الشفافية أساس الثقة — تعرّف على سياسة الخصوصية والشروط المنظمة لاستخدام الموقع وحماية بياناتك
            </p>
          </div>

          <div {...anim(550)}>
            <div className="flex justify-center text-white/30 animate-bounce" style={{ animationDuration: "2s" }}>
              <IconArrowDown />
            </div>
          </div>
        </div>

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

      {/* ════════ COMMITMENTS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 pt-8 sm:pt-14">
        <FadeUp>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-4 sm:p-8 lg:p-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#0B43FD]/5 blur-[60px]" />
            <h3 className="text-[#0B43FD] font-extrabold text-base sm:text-xl lg:text-2xl mb-4 sm:mb-6 relative">
              التزاماتنا تجاه خصوصيتك
              <span className="block h-1 w-12 mt-2 rounded-full bg-[#0B43FD]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 relative">
              {commitments.map((item, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="flex items-center gap-3 bg-[#0B43FD]/5 rounded-xl px-3 sm:px-4 py-3 border border-[#0B43FD]/15">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                      <IconCheck />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">{item}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ STORE INFO ════════ */}
      {company && (
        <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 pt-8 sm:pt-14">
          <FadeUp>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.04] overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-l from-[#0B43FD] to-[#3d8bff]" />
              <div className="p-4 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#0B43FD]/8 flex items-center justify-center shrink-0 text-[#0B43FD]">
                    <IconLock />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-xl font-extrabold text-gray-800">معلومات المتجر</h2>
                    <span className="block h-1 w-8 mt-1 rounded-full bg-[#0B43FD]" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    company.nameAr && { label: "اسم الجهة", value: company.nameAr },
                    company.addressAr && { label: "العنوان", value: company.addressAr },
                    company.phone && { label: "الهاتف", value: company.phone },
                    company.email && { label: "البريد الإلكتروني", value: company.email },
                    company.taxNumber && { label: "الرقم الضريبي", value: company.taxNumber },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-start gap-3 bg-[#0B43FD]/5 rounded-xl px-3 sm:px-4 py-3 border border-[#0B43FD]/15">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#0B43FD] flex items-center justify-center text-white shrink-0 mt-0.5">
                        <IconCheck />
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                        <span className="font-bold text-gray-700">{item && (item as { label: string; value: string }).label}:</span>{" "}
                        {item && (item as { label: string; value: string }).value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </section>
      )}

      {/* ════════ CONTACT ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 mt-6 sm:mt-12">
        <ContactSection
          title="وسائل التواصل"
          phone={company?.whatsapp}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </section>

      <div className="h-16" />
    </main>
  );
}

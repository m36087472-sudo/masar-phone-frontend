"use client";
import { useState, useEffect, useRef, ReactNode } from "react";
import Image from "next/image";
import { ShieldCheck, Banknote, Truck, Info, CheckCircle } from "lucide-react";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
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
    <path d="M12 5v14M5 12l7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const paymentFeatures = [
  "حماية بياناتك أثناء عملية الشراء وتوفير تجربة دفع موثوقة",
  "خطوات واضحة وبسيطة بدون تعقيد من الاختيار حتى تأكيد الطلب",
  "الأسعار والمعاملات موضحة بالريال السعودي SAR",
  "فريق مسار متاح لمساعدتك ومتابعة طلبك عند الحاجة",
];

const sections = [
  { title: "حماية وأمان", Icon: ShieldCheck, color: "#0B43FD", content: ["نحرص على حماية بياناتك أثناء عملية الشراء وتوفير تجربة دفع موثوقة."] },
  { title: "عملتك هي الريال السعودي 🇸🇦", Icon: Banknote, color: "#0B43FD", content: ["جميع أسعار المنتجات والمعاملات في المتجر موضحة بالريال السعودي (SAR)، حتى تعرف قيمة مشترياتك بوضوح قبل إتمام الطلب."] },
  { title: "من الدفع إلى بابك", Icon: Truck, color: "#0B43FD", content: ["بعد تأكيد الطلب، يتم تجهيز بيانات الشحن والتنسيق مع شركة التوصيل المناسبة لإيصال طلبك إلى العنوان المسجل."] },
  { title: "ماذا يحدث بعد إتمام الدفع؟", Icon: Info, color: "#0B43FD", content: ["01 — تأكيد الطلب: نتأكد من بيانات طلبك وتفاصيل الشراء.", "02 — مراجعة البيانات: قد يتواصل معك فريق مسار عند الحاجة لتأكيد بعض التفاصيل.", "03 — تجهيز الطلب: يتم تجهيز المنتج وترتيب عملية الشحن.", "04 — التوصيل: يتم تسليم طلبك إلى شركة الشحن لإيصاله إلى العنوان المسجل."] },
];

interface Company { phone?: string; whatsapp?: string; email?: string; [k: string]: string | undefined; }

export default function PaymentClient({ company }: { company: Company }) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(30px)",
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
        {/* Grid pattern - same as About */}
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
              <span className="w-1.5 h-1.5 rounded-full bg-blue-200 animate-pulse" />
              مسار الهاتف المعتمد
            </div>
          </div>

          {/* Title */}
          <div {...anim(250)}>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              دفع أسهل. أمان أكبر.
              <br />
              <span className="text-blue-200">وراحة من أول خطوة.</span>
            </h1>
          </div>

          {/* Subtitle */}
          <div {...anim(400)}>
            <p className="text-blue-100/80 text-sm sm:text-base lg:text-lg max-w-xl mx-auto leading-relaxed mb-7">
              اختر طريقة الدفع المناسبة لك واستكمل طلبك بكل سهولة — تجربة شراء واضحة وآمنة من البداية حتى استلام طلبك
            </p>
          </div>

          {/* Scroll indicator */}
          <div {...anim(550)}>
            <div className="flex justify-center text-white/30 animate-bounce" style={{ animationDuration: "2s" }}>
              <IconArrowDown />
            </div>
          </div>
        </div>

        {/* Bottom wave - same as About */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 60" className="w-full h-10 sm:h-14" preserveAspectRatio="none">
            <path d="M0,30 C480,60 960,0 1440,30 L1440,60 L0,60 Z" fill="#f8faff" />
          </svg>
        </div>
      </section>

      {/* ════════ PAYMENT METHODS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 mt-8 sm:mt-14">
        <div className="flex gap-6 sm:gap-10 justify-center items-start">
          <FadeUp delay={0} className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="h-12 sm:h-16 flex items-center">
              <Image src="/mada-visa-mas.webp" alt="بطاقات الدفع" width={140} height={56} className="object-contain h-full w-auto" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-700">مدى · Visa · Mastercard</p>
          </FadeUp>
          <FadeUp delay={100} className="flex flex-col items-center gap-2 sm:gap-3">
            <div className="h-12 sm:h-16 flex items-center">
              <Image src="/Apple-Pay-01.png" alt="Apple Pay" width={140} height={56} className="object-contain h-full w-auto" />
            </div>
            <p className="text-xs sm:text-sm font-bold text-gray-700">Apple Pay</p>
          </FadeUp>
        </div>
      </section>

      {/* ════════ INSTALLMENT CARD ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 pt-8 sm:pt-12">
        <FadeUp>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-l from-[#0B43FD] to-[#3d8bff]" />
            <div className="p-4 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B43FD] bg-[#0B43FD]/8 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0B43FD] animate-pulse" />
                    نظام التقسيط الخاص بالمتجر
                  </span>
                  <h2 className="text-xl sm:text-3xl font-black text-gray-900">
                    قسّط مشترياتك <span className="text-[#0B43FD]">بدون فوائد</span>
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-md">
                    هل المنتج اللي تريده أكبر من ميزانيتك الحالية؟ لا تؤجل مشترياتك. اختر التقسيط عند توفره وسيتواصل معك فريق مسار لمساعدتك في استكمال إجراءات خطة الدفع المناسبة.
                  </p>
                </div>
                <div className="shrink-0 mx-auto sm:mx-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full border-2 border-[#0B43FD]/20 bg-[#0B43FD]/5 flex flex-col items-center justify-center">
                  <span className="text-3xl sm:text-5xl font-black text-[#0B43FD] leading-none">0</span>
                  <span className="text-xs font-bold text-gray-400 mt-0.5">% فائدة</span>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-[#f4f6f8] border border-gray-100 px-4 py-3 sm:px-5 sm:py-4">
                <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
                  اختر التقسيط عند إتمام طلبك وسيتواصل معك فريقنا لترتيب خطة الدفع.
                </p>
                <a href="/" className="shrink-0 inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-sm text-white bg-[#0B43FD] hover:bg-[#0935d4] transition-colors">
                  تسوق الآن
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.293 4.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414-1.414L15.586 11H3a1 1 0 110-2h12.586l-3.293-3.293a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                </a>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ FEATURES STRIP ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 pt-8 sm:pt-14">
        <FadeUp>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.06] p-4 sm:p-8 lg:p-10 overflow-hidden">
            <div className="pointer-events-none absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#0B43FD]/5 blur-[60px]" />

            <h3 className="text-[#0B43FD] font-extrabold text-base sm:text-xl lg:text-2xl mb-4 sm:mb-6 relative">
              لماذا تطمئن عند الدفع مع مسار؟
              <span className="block h-1 w-12 mt-2 rounded-full bg-[#0B43FD]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 relative">
              {paymentFeatures.map((f, i) => (
                <FadeUp key={i} delay={i * 60}>
                  <div className="flex items-center gap-3 bg-[#0B43FD]/5 rounded-xl px-3 sm:px-4 py-3 border border-[#0B43FD]/15">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                      <CheckCircle size={16} />
                    </div>
                    <span className="text-gray-700 text-xs sm:text-sm font-medium leading-relaxed">{f}</span>
                  </div>
                </FadeUp>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ════════ SECTIONS ════════ */}
      <section className="w-full max-w-5xl mx-auto px-3 sm:px-8 lg:px-10 py-8 sm:py-14 space-y-3 sm:space-y-6">
        {sections.map((s, i) => (
          <FadeUp key={s.title} delay={i * 120}>
            <div className="group bg-white/80 backdrop-blur-sm rounded-2xl border border-white shadow-lg shadow-[#0F4C6E]/[0.04] overflow-hidden hover:shadow-xl transition-all duration-400">
              <div className="h-1 w-full" style={{ background: `linear-gradient(to left, ${s.color}, ${s.color}88)` }} />

              <div className="p-4 sm:p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 text-[#0B43FD]">
                    <s.Icon size={18} />
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-gray-800">{s.title}</h2>
                </div>

                <div className="space-y-2">
                  {s.content.map((p, j) => (
                    <p key={j} className="text-gray-600 leading-relaxed text-xs sm:text-sm lg:text-[15px]">{p}</p>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        ))}

        <ContactSection
          title="التواصل بخصوص الدفع"
          phone={company.phone}
          whatsapp={company.whatsapp}
          email={company.email}
          fadeDelay={300}
        />
      </section>

      <div className="h-10" />
    </main>
  );
}

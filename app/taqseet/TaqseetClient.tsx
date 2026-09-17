"use client";

import Image from "next/image";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

const bannerItems = [
  { icon: "solar:tag-price-outline", title: "بدون فوائد", value: "0%" },
  { icon: "solar:wallet-money-outline", title: "دفعة مقدمة", value: "1000 ريال" },
  { icon: "solar:calendar-outline", title: "مدة التقسيط", value: "24 شهر" },
];

const howItems = [
  { icon: "solar:devices-linear", step: "01", title: "اختر جهازك", desc: "تصفح الأجهزة وحدد ما يناسبك" },
  { icon: "solar:card-linear", step: "02", title: "اختر التقسيط", desc: "اختر المدة وقسّط بدون فوائد" },
  { icon: "solar:wallet-money-linear", step: "03", title: "ادفع مقدم 1000 ريال", desc: "ادفع المبلغ المقدم لتأكيد الطلب" },
  { icon: "solar:box-linear", step: "04", title: "استلم جهازك", desc: "استلم جهازك واستمتع بتجربة مميزة" },
];

const whyItems = [
  { icon: "solar:tag-price-linear", title: "بدون فوائد", desc: "تقسيط بدون رسوم أو فوائد" },
  { icon: "solar:wallet-money-linear", title: "دفعة مقدمة بسيطة", desc: "ابدأ بالتقسيط بدفع <span class='text-[#0B43FD] font-bold'>1000</span> ريال فقط" },
  { icon: "solar:bolt-linear", title: "إجراءات سريعة", desc: "عملية سهلة وموافقة سريعة" },
  { icon: "solar:shield-check-linear", title: "أمان وموثوقية", desc: "تسوق بأمان — معتمد 100%" },
];

// Reusable variants
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = (delay = 0.1) => ({
  show: { transition: { staggerChildren: delay } },
});

const scaleIn = {
  hidden: { opacity: 0, scale: 0.88 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

const slideRight = {
  hidden: { opacity: 0, x: 48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const slideLeft = {
  hidden: { opacity: 0, x: -48 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
};

const viewport = { once: true, margin: "-60px" };

export default function TaqseetClient() {
  return (
    <main dir="rtl" className="min-h-screen" style={{ background: "radial-gradient(ellipse at 70% 0%, #e8eeff 0%, #f4f6ff 35%, #f9fafb 70%, #ffffff 100%)" }}>

      {/* ── Hero ── */}
      <section className="w-full">
        {/* ≤1000px: image as background with overlay */}
        <div className="relative lg2:hidden min-h-[320px] sm:min-h-[380px] flex items-center">
          <Image src="/taqset.webp" alt="خطط التقسيط" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-black/55" />
          <motion.div
            className="relative z-10 text-right px-4 py-8 w-full max-w-[320px] sm:max-w-[340px] mr-0 ml-auto"
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
          >
            <motion.span variants={fadeUp} className="inline-block bg-white/20 text-white text-xs sm:text-sm font-semibold px-3 py-1 sm:px-4 sm:py-1.5 rounded-full mb-3 sm:mb-5">
              امتلك الآن
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black text-white leading-[1.1] mb-3 sm:mb-4">
              <span className="block text-2xl sm:text-[clamp(2.8rem,8vw,4rem)] tracking-tight mb-1 sm:mb-2">
                تقسيط <span className="text-[#7b9fff]">أسهل</span>
              </span>
              <span className="block text-base sm:text-[clamp(1.6rem,5vw,2.4rem)] text-white/90 font-bold">
                بشروط <span className="text-[#7b9fff]">أوضح</span>
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-white/80 text-[11px] sm:text-sm leading-[1.8] mb-2 sm:mb-3">
              نوفر لك تقسيطاً مرناً <span className="text-white font-semibold">بدون فوائد</span> على جميع الأجهزة،
              بدفعة مقدمة بسيطة والباقي أقساط شهرية مريحة.
            </motion.p>
            <motion.p variants={fadeUp} className="text-white/80 text-[11px] sm:text-sm leading-[1.8] mb-6 sm:mb-8">
              لا رسوم خفية، لا تعقيدات — فقط شروط واضحة.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Image src="/mada-visa-mas.webp" alt="وسائل الدفع المقبولة" width={160} height={44} className="object-contain brightness-0 invert sm:w-[200px] sm:h-[55px]" />
            </motion.div>
          </motion.div>
        </div>

        {/* >1000px: side-by-side */}
        <div className="hidden lg2:flex max-w-[1400px] mx-auto px-16 py-20 pb-24 flex-row items-stretch gap-16">
          <motion.div
            className="flex-1 text-right order-1"
            variants={stagger(0.12)}
            initial="hidden"
            animate="show"
          >
            <motion.span variants={fadeUp} className="inline-block bg-[#0B43FD]/10 text-[#0B43FD] text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              امتلك الآن
            </motion.span>
            <motion.h1 variants={fadeUp} className="font-black text-[#0a0a0a] leading-[1.1] mb-4">
              <span className="block text-[clamp(3rem,7vw,5.5rem)] tracking-tight mb-3">
                تقسيط <span className="text-[#0B43FD]">أسهل</span>
              </span>
              <span className="block text-[clamp(1.8rem,4vw,3.2rem)] text-[#333] font-bold">
                بشروط <span className="text-[#0B43FD]">أوضح</span>
              </span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-[#555] text-[clamp(0.9rem,1.8vw,1.05rem)] leading-[1.9] max-w-[460px] mb-3">
              نوفر لك تقسيطاً مرناً <span className="text-[#0B43FD] font-semibold">بدون فوائد</span> على جميع الأجهزة،
              بدفعة مقدمة بسيطة والباقي أقساط شهرية مريحة تناسب ميزانيتك.
            </motion.p>
            <motion.p variants={fadeUp} className="text-[#555] text-[clamp(0.9rem,1.8vw,1.05rem)] leading-[1.9] max-w-[460px] mb-8">
              لا رسوم خفية، لا تعقيدات — فقط شروط واضحة وخدمة تضع راحتك في المقام الأول.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Image src="/mada-visa-mas.webp" alt="وسائل الدفع المقبولة" width={260} height={72} className="object-contain scale-125 origin-right" />
            </motion.div>
          </motion.div>
          <motion.div
            className="flex-[1.2] order-2 relative min-h-[380px]"
            variants={scaleIn}
            initial="hidden"
            animate="show"
          >
            <Image src="/taqset.webp" alt="خطط التقسيط" fill className="object-cover rounded-3xl drop-shadow-xl" priority />
          </motion.div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-3 sm:px-6 sm:-mt-14 relative z-10 pb-6 sm:pb-12">
        <motion.div
          className="w-full rounded-2xl sm:rounded-3xl shadow-md bg-white flex flex-row sm:flex-row"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          {bannerItems.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className={`flex flex-1 items-center justify-center gap-2 sm:gap-4 px-2 py-4 sm:px-10 sm:py-10 ${
                i < bannerItems.length - 1
                  ? "border-l border-gray-200"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <span className="text-[#333] font-semibold text-[10px] sm:text-base lg:text-lg">{item.title}</span>
                <span className="text-[#0B43FD] font-black text-[0.95rem] sm:text-[1.6rem] lg:text-[2rem] leading-none">{item.value}</span>
              </div>
              <Icon icon={item.icon} className="text-[#0B43FD] shrink-0 hidden sm:block" style={{ fontSize: "1.8rem" }} />
            </motion.div>
          ))}
        </motion.div>
      </section>


        {/* ── Why ── */}
      <section className="px-4 sm:px-6 pb-12 sm:pb-24">
        <motion.div
          className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-5 sm:px-10 pt-10 sm:pt-14 pb-8 sm:pb-10 relative"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <motion.div className="flex items-center gap-4 mb-8 sm:mb-10" variants={fadeIn} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[#0a0a0a] font-black text-sm sm:text-xl lg:text-2xl whitespace-nowrap">لماذا تختار التقسيط معنا؟</span>
            <div className="flex-1 h-px bg-gray-200" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
            variants={stagger(0.12)}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            {whyItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 8px 28px rgba(11,67,253,0.10)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="flex flex-row sm:flex-col items-center sm:items-center gap-4 sm:gap-3 bg-[#f8f9ff] border border-[#0B43FD]/10 rounded-2xl px-4 py-4 sm:px-5 sm:py-6 sm:text-center cursor-default"
              >
                <motion.div
                  className="w-11 h-11 shrink-0 rounded-xl bg-[#0B43FD]/10 flex items-center justify-center"
                  whileHover={{ rotate: 12, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  <Icon icon={item.icon} className="text-[#0B43FD]" style={{ fontSize: "1.4rem" }} />
                </motion.div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#0a0a0a] font-bold text-sm sm:text-sm lg:text-base">{item.title}</span>
                  <span className="text-[#777] text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: item.desc }} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── How It Works ── */}
      <section className="px-4 sm:px-6 pb-8 sm:pb-12">
        <motion.div
          className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] px-5 sm:px-10 pt-10 sm:pt-14 pb-8 sm:pb-12 relative overflow-hidden"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <div className="absolute top-0 left-0 w-72 h-72 bg-[#0B43FD]/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-[#0B43FD]/5 rounded-full translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <motion.div className="flex items-center gap-4 mb-6 sm:mb-8 relative" variants={fadeIn} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="flex-1 h-px bg-gray-200" />
            <div className="flex flex-col items-center gap-1">
              <span className="text-[#0a0a0a] font-black text-sm sm:text-xl lg:text-2xl whitespace-nowrap">كيف يعمل التقسيط؟</span>
              <span className="text-[#0B43FD] text-[10px] sm:text-sm font-medium">4 خطوات بسيطة وتنتهي</span>
            </div>
            <div className="flex-1 h-px bg-gray-200" />
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative"
            variants={stagger(0.13)}
            initial="hidden"
            whileInView="show"
            viewport={viewport}
          >
            <div className="hidden lg:block absolute top-[2.8rem] right-[12.5%] left-[12.5%] h-px border-t-2 border-dashed border-[#0B43FD]/25 z-0" />

            {howItems.map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6, boxShadow: "0 12px 32px rgba(11,67,253,0.13)" }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative z-10 flex flex-row sm:flex-col items-center sm:text-center gap-4 bg-[#f8f9ff] border border-[#0B43FD]/10 rounded-2xl px-4 py-5 sm:px-5 sm:py-7 cursor-default"
              >
                <span className="absolute top-2 left-3 text-[2.5rem] sm:text-[3.5rem] font-black text-[#0B43FD]/8 leading-none select-none">{item.step}</span>
                <motion.div
                  className="w-11 h-11 sm:w-14 sm:h-14 shrink-0 rounded-2xl bg-[#0B43FD] flex items-center justify-center shadow-[0_4px_14px_rgba(11,67,253,0.35)]"
                  whileHover={{ rotate: [0, -8, 8, 0], transition: { duration: 0.4 } }}
                >
                  <Icon icon={item.icon} className="text-white" style={{ fontSize: "1.4rem" }} />
                </motion.div>
                <div className="flex flex-col gap-1 text-right sm:text-center sm:items-center">
                  <span className="bg-[#0B43FD]/10 text-[#0B43FD] text-[10px] font-bold px-2 py-0.5 rounded-full w-fit">الخطوة {item.step}</span>
                  <span className="text-[#0a0a0a] font-black text-xs sm:text-sm lg:text-base leading-snug">{item.title}</span>
                  <span className="text-[#777] text-[10px] sm:text-xs leading-relaxed">{item.desc}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Calculator ── */}
      <section className="px-4 sm:px-6 pb-8 sm:pb-12">
        <motion.div
          className="w-full bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] px-5 sm:px-10 pt-10 sm:pt-14 pb-10 sm:pb-14"
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={viewport}
        >
          <motion.div className="flex items-center gap-4 mb-8 sm:mb-12" variants={fadeIn} initial="hidden" whileInView="show" viewport={viewport}>
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[#0a0a0a] font-black text-sm sm:text-xl lg:text-2xl whitespace-nowrap">احسب قسطك الشهري</span>
            <div className="flex-1 h-px bg-gray-200" />
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-10">

            {/* Gauge */}
            <motion.div
              className="flex-1 flex flex-col items-center justify-center"
              variants={scaleIn}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              <div className="relative w-[180px] h-[100px] sm:w-[240px] sm:h-[130px]">
                <svg viewBox="0 0 240 130" fill="none" className="w-full h-full">
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#0B43FD" />
                      <stop offset="100%" stopColor="#e0e7ff" />
                    </linearGradient>
                  </defs>
                  <path d="M 20 120 A 100 100 0 0 1 220 120" stroke="#f0f0f0" strokeWidth="16" strokeLinecap="round" fill="none" />
                  <motion.path
                    d="M 20 120 A 100 100 0 0 1 220 120"
                    stroke="url(#gaugeGrad)"
                    strokeWidth="16"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={viewport}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                  />
                  <circle cx="220" cy="120" r="6" fill="#e0e7ff" />
                  <circle cx="20" cy="120" r="6" fill="#0B43FD" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                  <motion.span
                    className="text-[#0B43FD] font-black text-[1.5rem] sm:text-[2.8rem] lg:text-[3.5rem] leading-none"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={viewport}
                    transition={{ duration: 0.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  >
                    24
                  </motion.span>
                  <span className="text-[#888] text-xs sm:text-sm font-medium mt-0.5">شهر</span>
                </div>
              </div>
              <motion.span
                className="text-[#0B43FD] text-xs sm:text-sm font-bold mt-3 sm:mt-4 bg-[#0B43FD]/8 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewport}
                transition={{ delay: 1.2, duration: 0.4 }}
              >
                بدون فوائد 0%
              </motion.span>
            </motion.div>

            <div className="hidden sm:block w-px self-stretch bg-gray-100" />

            {/* Breakdown */}
            <motion.div
              className="flex-1 flex flex-col gap-0 w-full divide-y divide-gray-100"
              variants={stagger(0.1)}
              initial="hidden"
              whileInView="show"
              viewport={viewport}
            >
              {[
                { label: "إجمالي الجهاز", value: "5,999 ريال" },
                { label: "الدفعة المقدمة", value: "1,000 ريال" },
                { label: "المتبقي", value: "4,999 ريال" },
              ].map((row, i) => (
                <motion.div key={i} variants={slideLeft} className="flex items-center justify-between py-4">
                  <span className="text-[#0a0a0a] font-black text-xs sm:text-base lg:text-lg">{row.value}</span>
                  <span className="text-[#888] text-[10px] sm:text-sm">{row.label}</span>
                </motion.div>
              ))}

              <motion.div variants={slideLeft} className="flex items-center justify-between pt-5">
                <motion.div
                  className="flex items-center gap-3 bg-[#0B43FD]/8 border border-[#0B43FD]/15 rounded-2xl px-5 py-3"
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                >
                  <Icon icon="solar:calculator-linear" className="text-[#0B43FD]" style={{ fontSize: "1.4rem" }} />
                  <div className="flex flex-col">
                    <span className="text-[#0B43FD] font-black text-[0.9rem] sm:text-[1.3rem] lg:text-[1.6rem] leading-none">208 ريال</span>
                    <span className="text-[#0B43FD]/60 text-[9px] sm:text-xs">القسط الشهري</span>
                  </div>
                </motion.div>
                <span className="text-[#bbb] text-xs sm:text-sm">/شهر × 24</span>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

    

    

    </main>
  );
}

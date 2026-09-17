"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, Smartphone, AlertCircle } from "lucide-react";

export type PaymentMethod = "card" | "stc" | "apple";

interface Props {
  value: PaymentMethod;
  onChange: (m: PaymentMethod) => void;
  className?: string;
}

const methods = [
  { id: "card" as PaymentMethod, img: "/فيزا ماستر مدى.webp", alt: "Visa Mastercard Mada" },
  { id: "stc" as PaymentMethod, img: "/stc.png", alt: "STC Pay", hidden: true },
  { id: "apple" as PaymentMethod, img: "/Apple-Pay-01.png", alt: "Apple Pay" },
];

export default function PaymentMethodSelector({ value, onChange, className = "" }: Props) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="px-5 py-3 border-b border-gray-100">
        <p className="text-sm font-extrabold text-gray-800">اختر طريقة الدفع</p>
      </div>
      <div className="px-4 py-3 grid grid-cols-2 gap-3">
        {methods.filter((m) => !m.hidden).map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`relative flex items-center justify-center rounded-2xl border-2 py-3 px-3 transition-all cursor-pointer
              ${value === m.id
                ? "border-[#1a6b7d] bg-[#1a6b7d]/5 shadow-lg shadow-[#1a6b7d]/15"
                : "border-gray-200 bg-gray-50 hover:border-[#1a6b7d]/50 hover:bg-[#1a6b7d]/3"
              }`}
          >
            {value === m.id && (
              <span className="absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full bg-[#1a6b7d]" />
            )}
            <Image src={m.img} alt={m.alt} width={100} height={52} className="object-contain max-h-12 drop-shadow-sm" />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── STC Pay panel ── */
export function StcPayPanel({
  onSubmit,
  onBack,
  loading,
}: {
  onSubmit: (phone: string) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}) {
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");

  const handlePay = async () => {
    const clean = phone.trim();
    if (!/^05\d{8}$/.test(clean)) {
      setErr("يرجى إدخال رقم جوال سعودي صحيح يبدأ بـ 05 ومكوّن من 10 أرقام");
      return;
    }
    setErr("");
    await onSubmit(clean);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <Smartphone size={15} className="text-[#1a6b7d]" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800">الدفع عبر STC Pay</h2>
            <p className="text-[11px] text-gray-400">أدخل رقم جوالك المرتبط بمحفظة STC</p>
          </div>
          <Image src="/stc.png" alt="STC Pay" width={56} height={28} className="object-contain mr-auto opacity-80" />
        </div>

        <div className="px-5 py-5 space-y-2">
          <label className="text-xs font-semibold text-gray-600">
            رقم الجوال <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
              <Smartphone size={15} className="text-gray-400" />
            </span>
            <input
              type="tel"
              maxLength={10}
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="05XXXXXXXX"
              value={phone}
              onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(""); }}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pr-10 pl-4 py-3 text-sm font-mono tracking-wider text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
          {err && (
            <p className="text-red-400 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {err}
            </p>
          )}
        </div>

        <div className="bg-gray-50 border-t border-gray-100 px-5 py-3 flex items-center justify-center gap-2">
          <Lock size={13} className="text-[#7CC043]" />
          <span className="text-xs text-gray-400">جميع البيانات مشفرة وآمنة بنسبة 100%</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          السابق
        </button>
        <button
          type="button"
          onClick={handlePay}
          disabled={loading}
          className="flex-[2] py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock size={15} />
          {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
        </button>
      </div>
    </div>
  );
}

/* ── Apple Pay panel ── */
export function ApplePayPanel({ onBack }: { onBack: () => void }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-10 gap-4 sm:gap-5">
          <Image src="/Apple-Pay-01.png" alt="Apple Pay" width={120} height={60} className="object-contain opacity-80 w-24 sm:w-32" />
          <div className="text-center space-y-2 w-full">
            <p className="text-sm sm:text-base font-extrabold text-gray-700 flex items-center justify-center gap-2">
              <AlertCircle size={16} className="text-amber-400 shrink-0" />
              طريقة الدفع غير متاحة الآن
            </p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed px-2">
              خدمة Apple Pay ستكون متاحة قريبًا. يمكنك إتمام طلبك عبر البطاقة الائتمانية   في الوقت الحالي.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border-2 border-gray-200 text-gray-600 font-bold py-4 rounded-xl text-sm hover:bg-gray-50 transition-all"
        >
          السابق
        </button>
        <button
          type="button"
          disabled
          className="flex-[2] py-4 bg-gray-200 text-gray-400 rounded-xl font-extrabold text-sm sm:text-base cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock size={15} />
          تأكيد الدفع
        </button>
      </div>
    </div>
  );
}

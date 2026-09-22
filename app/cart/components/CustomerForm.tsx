"use client";

import { useState, useMemo, useRef } from "react";
import { User, MapPin, CreditCard, ChevronDown, Calendar, Wallet, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { CustomerInfo } from "../../store/cartStore";
import RiyalIcon from "../../components/RiyalIcon";

const fmt = (n: number) => n.toLocaleString("en-US");

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

const inputBase =
  "w-full min-w-0 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1a6b7d]/30 focus:border-[#1a6b7d] focus:bg-white transition-all placeholder:text-gray-400";
const inputErr =
  "w-full min-w-0 bg-red-50 border-2 border-red-400 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-400/30 focus:bg-white transition-all placeholder:text-gray-400";

export default function CustomerForm({ total, itemCount, initialData, installmentMonths, onSubmit }: CustomerFormProps) {
  const maxMonths = installmentMonths ?? 24;
  const MONTHS_OPTIONS = Array.from({ length: Math.floor(maxMonths / 2) }, (_, i) => (i + 1) * 2);
  const minDown = 500 * itemCount;
  const DOWN_OPTIONS = [
    { label: fmt(minDown), value: 0, sub: "الحد الأدنى" },
    { label: fmt(minDown + 500), value: 500, sub: "+500" },
    { label: fmt(minDown + 1000), value: 1000, sub: "+1000" },
    { label: fmt(total), value: total - minDown, sub: "دفع كامل" },
  ];

  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [installmentType, setInstallmentType] = useState<"full" | "installment">(initialData?.installmentType ?? "installment");
  const [months, setMonths] = useState(initialData?.months ?? 12);
  const [downExtra, setDownExtra] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSchedule, setShowSchedule] = useState(false);

  // refs for auto-scroll
  const nameRef = useRef<HTMLDivElement>(null);
  const nationalIdRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  const downPayment = minDown + downExtra;
  const monthly = useMemo(() => {
    if (installmentType === "full") return 0;
    const rem = total - downPayment;
    return rem > 0 ? Math.ceil(rem / months) : 0;
  }, [total, months, installmentType, downPayment]);

  const schedule = useMemo(() => {
    const now = new Date();
    return Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
      return {
        index: i + 1,
        date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`,
        amount: monthly,
      };
    });
  }, [months, monthly]);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) e.nationalId = "يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    if (!whatsapp.trim()) e.whatsapp = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) e.whatsapp = "يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) e.address = "العنوان مطلوب";
    setErrors(e);

    // auto-scroll to first error
    if (e.name) { scrollTo(nameRef); return false; }
    if (e.nationalId) { scrollTo(nationalIdRef); return false; }
    if (e.whatsapp) { scrollTo(whatsappRef); return false; }
    if (e.address) { scrollTo(addressRef); return false; }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) onSubmit({ name, nationalId, whatsapp, address, installmentType, months, downPayment });
  };

  return (
    <div className="space-y-3 sm:space-y-4 w-full max-w-lg mx-auto px-2 sm:px-0">
      {/* ── Customer Info ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <User size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-800">معلومات العميل</h2>
        </div>
        <div className="px-3 sm:px-5 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div ref={nameRef} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">الاسم كاملاً <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value.replace(/[0-9]/g, "")); setErrors(p => ({ ...p, name: "" })); }}
              placeholder="أدخل اسمك بالكامل"
              className={errors.name ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.name && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div ref={nationalIdRef} className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">رقم الهوية / الإقامة <span className="text-red-400">*</span></label>
            <input
              value={nationalId}
              onChange={(e) => { setNationalId(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, nationalId: "" })); }}
              placeholder="رقم الهوية"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={errors.nationalId ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.nationalId && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.nationalId}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <div ref={whatsappRef} className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-gray-600">رقم الواتساب <span className="text-red-400">*</span></label>
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => { setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10)); setErrors(p => ({ ...p, whatsapp: "" })); }}
              placeholder="05XXXXXXXX"
              dir="ltr"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              className={errors.whatsapp ? inputErr : inputBase}
            />
            <AnimatePresence>
              {errors.whatsapp && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                  <span>⚠</span> {errors.whatsapp}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Address ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <MapPin size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-800">عنوان التوصيل</h2>
        </div>
        <div ref={addressRef} className="px-3 sm:px-5 py-4 sm:py-5 space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">العنوان بالتفصيل <span className="text-red-400">*</span></label>
          <input
            value={address}
            onChange={(e) => { setAddress(e.target.value); setErrors(p => ({ ...p, address: "" })); }}
            placeholder="المدينة - الحي - الشارع"
            className={errors.address ? inputErr : inputBase}
          />
          <AnimatePresence>
            {errors.address && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs flex items-center gap-1">
                <span>⚠</span> {errors.address}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Payment Method ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a6b7d]/10 rounded-lg flex items-center justify-center">
            <CreditCard size={15} className="text-[#1a6b7d]" />
          </div>
          <h2 className="text-xs sm:text-sm font-bold text-gray-800">طريقة الدفع</h2>
        </div>
        <div className="px-3 sm:px-5 py-4 sm:py-5 space-y-4 sm:space-y-5">

          {/* Full / Installment toggle */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "full", label: "دفع كامل", desc: "سداد المبلغ دفعة واحدة", icon: Wallet },
              { value: "installment", label: "تقسيط شهري", desc: "أقساط مريحة بدون فوائد", icon: Calendar },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = installmentType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInstallmentType(opt.value as "full" | "installment")}
                  className={`relative p-3 sm:p-4 rounded-2xl border-2 text-right transition-all duration-200 overflow-hidden ${
                    active
                      ? "border-[#1a6b7d] bg-gradient-to-br from-[#1a6b7d]/8 to-[#1a6b7d]/3 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {active && (
                    <span className="absolute top-2 left-2">
                      <CheckCircle2 size={14} className="text-[#1a6b7d]" />
                    </span>
                  )}
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1.5 sm:mb-2 ${active ? "bg-[#1a6b7d] text-white" : "bg-gray-100 text-gray-500"}`}>
                    <Icon size={15} />
                  </div>
                  <p className={`text-xs sm:text-sm font-bold leading-tight ${active ? "text-[#1a6b7d]" : "text-gray-700"}`}>{opt.label}</p>
                  <p className="text-[10px] sm:text-[11px] text-gray-400 mt-0.5">{opt.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Installment options */}
          <AnimatePresence>
            {installmentType === "installment" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="space-y-5 pt-1">

                  {/* Months grid */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#1a6b7d]" />
                      عدد أشهر التقسيط
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
                      {MONTHS_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths(m)}
                          className={`py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-2 ${
                            months === m
                              ? "border-[#1a6b7d] bg-[#1a6b7d] text-white shadow-md shadow-[#1a6b7d]/25"
                              : "border-gray-200 text-gray-600 hover:border-[#1a6b7d]/40 hover:text-[#1a6b7d] bg-white"
                          }`}
                        >
                          {m}
                          <span className="block text-[9px] font-medium opacity-70 mt-0.5">شهر</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Down payment buttons */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Wallet size={12} className="text-[#1a6b7d]" />
                      الدفعة الأولى
                    </label>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {DOWN_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDownExtra(opt.value)}
                          className={`relative py-2.5 sm:py-3 px-2.5 sm:px-3 rounded-xl border-2 text-right transition-all duration-150 ${
                            downExtra === opt.value
                              ? "border-[#7CC043] bg-[#7CC043]/8 shadow-sm"
                              : "border-gray-200 hover:border-[#7CC043]/40 bg-white"
                          }`}
                        >
                          {downExtra === opt.value && (
                            <span className="absolute top-2 left-2">
                              <CheckCircle2 size={12} className="text-[#7CC043]" />
                            </span>
                          )}
                          <p className={`text-xs sm:text-sm font-extrabold ${downExtra === opt.value ? "text-[#3b6a00]" : "text-gray-700"}`}>
                            {opt.label} <RiyalIcon className="inline w-[11px] h-[11px] align-middle" color={downExtra === opt.value ? "#3b6a00" : "#0874ED"} />
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{opt.sub}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly summary pill */}
                  <div className="bg-gradient-to-r from-[#1a6b7d]/8 to-[#7CC043]/8 border border-[#1a6b7d]/15 rounded-2xl p-3 sm:p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">القسط الشهري</p>
                      <p className="text-xl sm:text-2xl font-extrabold text-[#1a6b7d] mt-0.5">
                        {fmt(monthly)} <RiyalIcon className="inline w-[11px] h-[11px] align-middle text-gray-400" color="#9ca3af" />
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs text-gray-500 font-medium">لمدة</p>
                      <p className="text-base sm:text-lg font-extrabold text-[#7CC043]">
                        {months} <span className="text-xs sm:text-sm font-semibold text-gray-400">شهر</span>
                      </p>
                    </div>
                  </div>

                  {/* Schedule toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full flex items-center justify-between text-xs text-[#1a6b7d] font-semibold bg-[#1a6b7d]/5 hover:bg-[#1a6b7d]/10 transition rounded-xl px-4 py-2.5"
                  >
                    <span>عرض جدول الأقساط التفصيلي</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSchedule ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showSchedule && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-2xl overflow-hidden border border-[#E8EDF5] shadow-sm">
                          <div className="bg-[#1a6b7d] px-4 py-3 grid grid-cols-3 text-[11px] font-bold text-white/70 sticky top-0">
                            <span>القسط</span>
                            <span className="text-center">التاريخ</span>
                            <span className="text-left">المبلغ</span>
                          </div>
                          <div className="max-h-56 overflow-y-auto divide-y divide-[#F0F4FA]">
                            {schedule.map((row, i) => (
                              <div
                                key={row.index}
                                className={`grid grid-cols-3 items-center px-4 py-2.5 text-xs transition-colors ${
                                  i % 2 === 0 ? "bg-white" : "bg-[#F7F9FC]"
                                }`}
                              >
                                <div className="flex items-center gap-1.5">
                                  <span className="w-5 h-5 rounded-full bg-[#1a6b7d]/10 text-[#1a6b7d] font-extrabold text-[10px] flex items-center justify-center shrink-0">
                                    {row.index}
                                  </span>
                                </div>
                                <span className="text-center text-gray-500 tabular-nums">{row.date}</span>
                                <span className="text-left font-bold text-[#040D2A] tabular-nums">
                                  {fmt(row.amount)}
                                  <span className="text-[10px] font-normal text-gray-400 mr-0.5">ر</span>
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="bg-[#F7F9FC] border-t border-[#E8EDF5] px-4 py-2.5 flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-gray-500">الإجمالي</span>
                            <span className="text-sm font-extrabold text-[#1a6b7d] tabular-nums">
                              {fmt(monthly * months)}
                              <RiyalIcon className="inline w-[10px] h-[10px] align-middle mr-1" color="#9ca3af" />
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3.5 sm:py-4 bg-gradient-to-bl from-[#1a6b7d] to-[#155e6f] text-white rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-[#1a6b7d]/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        متابعة إلى الدفع ←
      </button>
    </div>
  );
}

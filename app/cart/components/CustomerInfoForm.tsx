"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiUser3Line, RiIdCardLine, RiWhatsappLine, RiMapPin2Line, RiArrowLeftLine, RiErrorWarningLine } from "react-icons/ri";
import type { CustomerInfo } from "../../store/cartStore";

interface Props {
  initialData?: Partial<CustomerInfo>;
  onNext: (info: Partial<CustomerInfo>) => void;
  onContinue?: () => void;
}

const fields = [
  { key: "name",       label: "الاسم كاملاً",          icon: RiUser3Line,    placeholder: "أدخل اسمك بالكامل",       dir: "rtl" },
  { key: "nationalId", label: "رقم الهوية / الإقامة",  icon: RiIdCardLine,   placeholder: "رقم الهوية أو الإقامة",   dir: "ltr" },
  { key: "whatsapp",   label: "رقم الواتساب",           icon: RiWhatsappLine, placeholder: "05XXXXXXXX",               dir: "ltr" },
  { key: "address",    label: "عنوان التوصيل",          icon: RiMapPin2Line,  placeholder: "المدينة – الحي – الشارع",  dir: "rtl" },
];

export default function CustomerInfoForm({ initialData, onNext, onContinue }: Props) {
  const [values, setValues] = useState({
    name:       initialData?.name       ?? "",
    nationalId: initialData?.nationalId ?? "",
    whatsapp:   initialData?.whatsapp   ?? "",
    address:    initialData?.address    ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const refs = {
    name:       useRef<HTMLDivElement>(null),
    nationalId: useRef<HTMLDivElement>(null),
    whatsapp:   useRef<HTMLDivElement>(null),
    address:    useRef<HTMLDivElement>(null),
  };

  const set = (key: string, val: string) => {
    setValues(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  };

  const handleChange = (key: string, raw: string) => {
    if (key === "name")       return set(key, raw.replace(/[0-9]/g, ""));
    if (key === "nationalId") return set(key, raw.replace(/\D/g, "").slice(0, 10));
    if (key === "whatsapp")   return set(key, raw.replace(/\D/g, "").slice(0, 10));
    set(key, raw);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!values.name.trim())       e.name       = "الاسم مطلوب";
    if (!values.nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
    else if (!/^[12]\d{9}$/.test(values.nationalId.trim())) e.nationalId = "يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    if (!values.whatsapp.trim())   e.whatsapp   = "رقم الواتساب مطلوب";
    else if (!/^05\d{8}$/.test(values.whatsapp.trim())) e.whatsapp = "يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!values.address.trim())    e.address    = "العنوان مطلوب";
    setErrors(e);
    const first = ["name", "nationalId", "whatsapp", "address"].find(k => e[k]);
    if (first) refs[first as keyof typeof refs].current?.scrollIntoView({ behavior: "smooth", block: "center" });
    return Object.keys(e).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      onNext(values);
      onContinue?.();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E8EDF5] flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#0874ED]/10 rounded-xl flex items-center justify-center shrink-0">
          <RiUser3Line size={14} className="text-[#0874ED]" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-[#040D2A]">معلومات العميل</h2>
      </div>

      {/* Fields */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {fields.map(({ key, label, icon: Icon, placeholder, dir }) => (
          <div key={key} ref={refs[key as keyof typeof refs]} className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1">
              <Icon size={12} className="text-[#0874ED]" />
              {label} <span className="text-[#0874ED]">*</span>
            </label>
            <input
              value={values[key as keyof typeof values]}
              onChange={e => handleChange(key, e.target.value)}
              placeholder={placeholder}
              dir={dir}
              type={key === "whatsapp" ? "tel" : "text"}
              {...(key === "nationalId" || key === "whatsapp" ? { inputMode: "numeric" as const, maxLength: 10 } : {})}
              className={`w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#040D2A] border transition-all outline-none placeholder:text-[#C8D0DC] ${
                errors[key]
                  ? "bg-red-50 border-red-300 focus:ring-2 focus:ring-red-200"
                  : "bg-[#F7F9FC] border-[#E8EDF5] focus:bg-white focus:border-[#0874ED] focus:ring-2 focus:ring-[#0874ED]/15"
              }`}
            />
            <AnimatePresence>
              {errors[key] && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs flex items-center gap-1"
                >
                  <RiErrorWarningLine size={11} /> {errors[key]}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* CTA */}
      {onContinue && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <button
            onClick={handleContinue}
            className="group w-full py-2.5 sm:py-3 bg-[#0874ED] hover:bg-[#0665D0] active:scale-[0.98] text-white rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between px-3 sm:px-4 shadow-md shadow-[#0874ED]/25"
          >
            <span className="w-5" />
            <span>التالي: طريقة الدفع</span>
            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <RiArrowLeftLine size={11} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
}

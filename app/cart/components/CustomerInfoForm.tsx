"use client";

import { useState, useRef, useCallback, lazy, Suspense, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiUser3Line, RiIdCardLine, RiWhatsappLine, RiMapPin2Line,
  RiArrowLeftLine, RiErrorWarningLine, RiMapPinLine,
  RiDeleteBin6Line, RiMapPin5Line, RiCheckLine, RiBuilding2Line,
  RiLockLine,
} from "react-icons/ri";
import type { CustomerInfo } from "../../store/cartStore";
import { useCurrency } from "../../hooks/useCurrency";
import {
  validatePhone,
  sanitizePhoneInput,
  getPhoneConfig,
  type SupportedCountry,
} from "../../lib/phone";

const MapPicker = lazy(() => import("./MapPicker"));

interface Props {
  initialData?: Partial<CustomerInfo>;
  onNext: (info: Partial<CustomerInfo>) => void;
  onContinue?: () => void;
}

const COUNTRY_NAME_AR: Record<string, string> = {
  SA: "المملكة العربية السعودية",
  AE: "الإمارات العربية المتحدة",
  QA: "قطر",
  KW: "الكويت",
  OM: "سلطنة عُمان",
};

export default function CustomerInfoForm({ initialData, onNext, onContinue }: Props) {
  const { country } = useCurrency();
  const countryCode   = country.code as SupportedCountry;
  const countryNameAr = COUNTRY_NAME_AR[countryCode] ?? countryCode;

  // Phone config for current country (prefix, maxLength, placeholder…)
  const phoneCfg = getPhoneConfig(countryCode);

  // كشف IP لتحديد هل الزبون سعودي فعلاً (لإظهار حقل الهوية)
  const [ipCountry, setIpCountry] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/geo", { credentials: "omit" })
      .then(r => r.ok ? r.json() : null)
      .then((d: { countryCode?: string } | null) => setIpCountry(d?.countryCode ?? null))
      .catch(() => setIpCountry(null));
  }, []);

  // حقل الهوية يظهر فقط إذا: العملة SA **و** الـ IP سعودي
  const showNationalId = countryCode === "SA" && ipCountry === "SA";

  // الحقول الأساسية
  const [values, setValues] = useState({
    name:           initialData?.name       ?? "",
    nationalId:     initialData?.nationalId ?? "",
    whatsapp:       initialData?.whatsapp   ?? "",
    addressDetails: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // حالة الخريطة
  const [mapOpen, setMapOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<{
    lat: number; lon: number; formattedAddress: string;
  } | null>(
    initialData?.latitude && initialData?.longitude
      ? { lat: initialData.latitude, lon: initialData.longitude, formattedAddress: initialData.formattedAddress ?? "" }
      : null
  );

  // refs للـ scroll عند الخطأ
  const refs = {
    name:       useRef<HTMLDivElement>(null),
    nationalId: useRef<HTMLDivElement>(null),
    whatsapp:   useRef<HTMLDivElement>(null),
    mapSection: useRef<HTMLDivElement>(null),
  };

  // ── handlers ───────────────────────────────────────────────────────────

  const set = useCallback((key: string, val: string) => {
    setValues(p => ({ ...p, [key]: val }));
    setErrors(p => ({ ...p, [key]: "" }));
  }, []);

  const handleChange = useCallback((key: string, raw: string) => {
    if (key === "name")       return set(key, raw.replace(/[0-9]/g, ""));
    if (key === "nationalId") return set(key, raw.replace(/\D/g, "").slice(0, 10));
    if (key === "whatsapp") {
      // Smart sanitizer: handles paste of full international number
      return set(key, sanitizePhoneInput(raw, countryCode));
    }
    set(key, raw);
  }, [set, countryCode]);

  const handleMapConfirm = useCallback((loc: { lat: number; lon: number; formattedAddress: string }) => {
    setMapLocation(loc);
    setMapOpen(false);
    setErrors(p => ({ ...p, address: "" }));
  }, []);

  const handleRemoveLocation = useCallback(() => {
    setMapLocation(null);
  }, []);

  // ── التحقق من الحقول ──────────────────────────────────────────────────

  const validate = useCallback(() => {
    const e: Record<string, string> = {};

    if (!values.name.trim()) e.name = "الاسم مطلوب";

    // رقم الهوية — سعودي فقط
    if (showNationalId) {
      if (!values.nationalId.trim()) e.nationalId = "رقم الهوية مطلوب";
      else if (!/^[12]\d{9}$/.test(values.nationalId.trim()))
        e.nationalId = "يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    }

    // رقم الواتساب — country-aware via phone utility
    if (!values.whatsapp.trim()) {
      e.whatsapp = "رقم الواتساب مطلوب";
    } else {
      const result = validatePhone(values.whatsapp, countryCode);
      if (!result.valid) e.whatsapp = result.error ?? "رقم الواتساب غير صحيح";
    }

    if (!mapLocation) e.address = "يرجى تحديد الموقع على الخريطة";

    setErrors(e);

    const firstKey = ["name", "nationalId", "whatsapp"].find(k => e[k]);
    if (firstKey) refs[firstKey as keyof typeof refs]?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    else if (e.address) refs.mapSection.current?.scrollIntoView({ behavior: "smooth", block: "center" });

    return Object.keys(e).length === 0;
  }, [values, mapLocation, showNationalId, countryCode]);

  const handleContinue = useCallback(() => {
    if (!validate()) return;

    // Store whatsapp as E.164 in the payload
    const phoneResult = validatePhone(values.whatsapp, countryCode);
    const whatsappE164 = phoneResult.e164 ?? values.whatsapp;

    const baseAddress = mapLocation?.formattedAddress ?? "";
    const fullAddress = values.addressDetails.trim()
      ? `${baseAddress} — ${values.addressDetails.trim()}`
      : baseAddress;

    const payload: Partial<CustomerInfo> = {
      name:             values.name,
      nationalId:       showNationalId ? values.nationalId : "",
      whatsapp:         whatsappE164,
      address:          fullAddress,
      addressSource:    "map",
      latitude:         mapLocation!.lat,
      longitude:        mapLocation!.lon,
      formattedAddress: mapLocation!.formattedAddress,
    };
    onNext(payload);
    onContinue?.();
  }, [validate, values, mapLocation, showNationalId, countryCode, onNext, onContinue]);

  // ── render ─────────────────────────────────────────────────────────────

  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">

      {/* Header */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[#E8EDF5] flex items-center gap-2 sm:gap-3">
        <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#0874ED]/10 rounded-xl flex items-center justify-center shrink-0">
          <RiUser3Line size={14} className="text-[#0874ED]" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-[#040D2A]">معلومات العميل</h2>
      </div>

      <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4">

        {/* الاسم + رقم الهوية */}
        <div className={`grid gap-3 sm:gap-4 ${showNationalId ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
          <Field label="الاسم كاملاً" icon={RiUser3Line} required error={errors.name} ref_={refs.name}>
            <input
              value={values.name}
              onChange={e => handleChange("name", e.target.value)}
              placeholder="أدخل اسمك بالكامل"
              dir="rtl"
              className={inp(!!errors.name)}
            />
          </Field>
          {showNationalId && (
            <Field label="رقم الهوية / الإقامة" icon={RiIdCardLine} required error={errors.nationalId} ref_={refs.nationalId}>
              <input
                value={values.nationalId}
                onChange={e => handleChange("nationalId", e.target.value)}
                placeholder="رقم الهوية أو الإقامة"
                dir="ltr" inputMode="numeric" maxLength={10}
                className={inp(!!errors.nationalId)}
              />
            </Field>
          )}
        </div>

        {/* ── حقل الواتساب مع prefix badge ── */}
        <div ref={refs.whatsapp} className="space-y-1.5 w-full min-w-0">
          <label className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1">
            <RiWhatsappLine size={12} className="text-[#0874ED]" />
            رقم الواتساب <span className="text-[#0874ED]">*</span>
          </label>
          <div className="flex items-stretch gap-0 w-full min-w-0 max-w-full">
            {/* Country code badge */}
            <div className="flex items-center gap-1 px-2.5 sm:px-3 bg-[#F0F4FF] border border-l-0 border-[#E8EDF5] rounded-r-xl rounded-l-none text-xs font-bold text-[#0874ED] shrink-0 select-none">
              <span className="text-base leading-none">
                {countryCode === "SA" ? "🇸🇦" :
                 countryCode === "AE" ? "🇦🇪" :
                 countryCode === "KW" ? "🇰🇼" :
                 countryCode === "QA" ? "🇶🇦" :
                 countryCode === "OM" ? "🇴🇲" : "🌍"}
              </span>
              <span className="whitespace-nowrap">{phoneCfg?.callingCodeDisplay ?? ""}</span>
            </div>
            {/* Phone input */}
            <input
              value={values.whatsapp}
              onChange={e => handleChange("whatsapp", e.target.value)}
              placeholder={phoneCfg?.placeholder ?? "05XXXXXXXX"}
              dir="ltr"
              type="tel"
              inputMode="numeric"
              maxLength={phoneCfg?.inputMaxLength ?? 10}
              className={`flex-1 w-full min-w-0 rounded-l-xl rounded-r-none px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#040D2A] border transition-all outline-none placeholder:text-[#C8D0DC] ${
                errors.whatsapp
                  ? "bg-red-50 border-red-300 focus:ring-2 focus:ring-red-200"
                  : "bg-[#F7F9FC] border-[#E8EDF5] focus:bg-white focus:border-[#0874ED] focus:ring-2 focus:ring-[#0874ED]/15"
              }`}
            />
          </div>
          <FieldError msg={errors.whatsapp} />
        </div>

        {/* ── قسم الخريطة ── */}
        <div ref={refs.mapSection} className="space-y-2">

          <div className="flex items-center justify-between">
            <p className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1">
              <RiMapPin2Line size={12} className="text-[#0874ED]" />
              موقع التوصيل <span className="text-[#0874ED]">*</span>
            </p>
            {mapLocation && (
              <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <RiCheckLine size={10} /> محدد
              </span>
            )}
          </div>

          <div className={`border rounded-2xl overflow-hidden transition-colors ${
            errors.address ? "border-red-300 bg-red-50/30" : "border-dashed border-[#C8D0DC]"
          }`}>

            {mapLocation && !mapOpen && (
              <div className="flex items-start gap-2 sm:gap-3 px-3 sm:px-4 py-3 bg-emerald-50 border-b border-dashed border-emerald-200">
                <div className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                  <RiMapPin5Line size={13} className="text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-emerald-700">تم تحديد الموقع في {countryNameAr}</p>
                  {mapLocation.formattedAddress && (
                    <p className="text-[11px] text-emerald-600 mt-1 leading-relaxed line-clamp-2">{mapLocation.formattedAddress}</p>
                  )}
                  <p className="text-[10px] text-emerald-400 font-mono mt-1">
                    {mapLocation.lat.toFixed(5)}, {mapLocation.lon.toFixed(5)}
                  </p>
                </div>
                <div className="flex gap-1 sm:gap-1.5 shrink-0">
                  <button type="button" onClick={() => setMapOpen(true)}
                    className="text-[11px] text-[#0874ED] font-bold bg-white border border-[#E8EDF5] rounded-lg px-2 sm:px-2.5 py-1 hover:bg-[#F0F4FF] transition-colors whitespace-nowrap">
                    تعديل
                  </button>
                  <button type="button" onClick={handleRemoveLocation} aria-label="إزالة"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <RiDeleteBin6Line size={14} />
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {mapOpen ? (
                <motion.div key="map"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "60vh" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                  style={{ minHeight: 320 }}
                >
                  <Suspense fallback={
                    <div className="flex items-center justify-center h-full gap-2 text-sm text-[#8A96A8]" style={{ minHeight: 320 }}>
                      <span className="w-5 h-5 border-2 border-[#0874ED]/20 border-t-[#0874ED] rounded-full animate-spin" />
                      جاري تحميل الخريطة...
                    </div>
                  }>
                    <MapPicker
                      countryCode={countryCode}
                      countryNameAr={countryNameAr}
                      onConfirm={handleMapConfirm}
                      onClose={() => setMapOpen(false)}
                      initialLat={mapLocation?.lat}
                      initialLon={mapLocation?.lon}
                    />
                  </Suspense>
                </motion.div>
              ) : (
                <motion.button key="opener"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  type="button" onClick={() => setMapOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-4 sm:py-5 hover:bg-[#F7F9FC] active:bg-[#F0F4FF] transition-colors group text-start"
                >
                  <div className="w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded-xl bg-[#0874ED]/10 flex items-center justify-center group-hover:bg-[#0874ED]/18 transition-colors">
                    <RiMapPinLine size={18} className="text-[#0874ED]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#040D2A]">
                      {mapLocation ? "تعديل الموقع على الخريطة" : "تحديد الموقع على الخريطة"}
                    </p>
                    <p className="text-[11px] text-[#8A96A8] mt-0.5">
                      {mapLocation
                        ? "انقر لتعديل الموقع المحدد"
                        : `حدد مكانك في ${countryNameAr} بدقة`}
                    </p>
                  </div>
                  <RiArrowLeftLine size={14} className="shrink-0 text-[#C8D0DC] group-hover:text-[#0874ED] transition-colors" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <FieldError msg={errors.address} />
        </div>

        {/* ── العنوان التفصيلي (read-only من الخريطة) ── */}
        {mapLocation && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="space-y-1.5">
            <label className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1.5">
              <RiMapPin2Line size={12} className="text-[#0874ED]" />
              العنوان التفصيلي
              <span className="flex items-center gap-0.5 text-[10px] bg-[#F0F4FF] text-[#0874ED] px-1.5 py-0.5 rounded-md font-bold">
                <RiLockLine size={9} /> من الخريطة
              </span>
            </label>
            <div className="w-full rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#040D2A] bg-[#F7F9FC] border border-[#E8EDF5] min-h-[2.8rem] leading-relaxed select-text cursor-default">
              {mapLocation.formattedAddress || (
                <span className="text-[#C8D0DC]">لم يُعثر على عنوان للموقع</span>
              )}
            </div>
            <p className="text-[10px] text-[#B0BCCE] flex items-center gap-1">
              <RiLockLine size={9} /> هذا الحقل يُحدَّث تلقائيًا من الخريطة
            </p>
          </motion.div>
        )}

        {/* ── تفاصيل إضافية (اختياري) ── */}
        <div className="space-y-1.5">
          <label className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1.5">
            <RiBuilding2Line size={12} className="text-[#0874ED]" />
            تفاصيل إضافية
            <span className="text-[11px] text-[#B0BCCE] font-normal">(اختياري)</span>
          </label>
          <input
            value={values.addressDetails}
            onChange={e => set("addressDetails", e.target.value)}
            placeholder="رقم المبنى، الشقة، الدور، أقرب معلم..."
            dir="rtl"
            className={inp(false)}
          />
        </div>

      </div>

      {/* CTA */}
      {onContinue && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-5">
          <button onClick={handleContinue}
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

// ── مساعدات ────────────────────────────────────────────────────────────────

function inp(hasError: boolean) {
  return `w-full min-w-0 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-[#040D2A] border transition-all outline-none placeholder:text-[#C8D0DC] ${
    hasError
      ? "bg-red-50 border-red-300 focus:ring-2 focus:ring-red-200"
      : "bg-[#F7F9FC] border-[#E8EDF5] focus:bg-white focus:border-[#0874ED] focus:ring-2 focus:ring-[#0874ED]/15"
  }`;
}

function Field({
  label, icon: Icon, required, error, ref_, children,
}: {
  label: string;
  icon: any;
  required?: boolean;
  error?: string;
  ref_?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
}) {
  return (
    <div ref={ref_} className="space-y-1.5 w-full min-w-0">
      <label className="text-xs sm:text-sm font-semibold text-[#6B7A8D] flex items-center gap-1">
        <Icon size={12} className="text-[#0874ED]" />
        {label} {required && <span className="text-[#0874ED]">*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  return (
    <AnimatePresence>
      {msg && (
        <motion.p
          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="text-red-400 text-xs flex items-center gap-1"
        >
          <RiErrorWarningLine size={11} /> {msg}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

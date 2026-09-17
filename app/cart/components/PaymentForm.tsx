"use client";

import { useState, useMemo } from "react";
import { CreditCard, ChevronDown, Calendar, Wallet, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { CustomerInfo } from "../../store/cartStore";
import { useCartStore } from "../../store/cartStore";

const fmt = (n: number) => n.toLocaleString("ar-EG");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

const DISCOUNT_VALUE = 100;

interface Props {
  total: number;
  itemCount: number;
  initialData?: Partial<CustomerInfo>;
  installmentMonths?: number;
  onBack: () => void;
  onSubmit: (info: CustomerInfo) => void;
}

export default function PaymentForm({ total, itemCount, initialData, installmentMonths, onBack, onSubmit }: Props) {
  const { pendingDiscountCode, items } = useCartStore();

  const maxMonths = installmentMonths ?? 24;
  const MONTHS_OPTIONS = Array.from({ length: Math.floor(maxMonths / 2) }, (_, i) => (i + 1) * 2);

  const DOWN_OPTIONS = [
    { label: "500 ريال", amount: 500 },
    { label: "1,000 ريال", amount: 1000 },
    { label: "1,500 ريال", amount: 1500 },
  ];

  const [installmentType, setInstallmentType] = useState<"full" | "installment">(initialData?.installmentType ?? "installment");
  const [installmentProvider, setInstallmentProvider] = useState<"tabby" | "tamara" | "store">("store");
  const [months, setMonths] = useState(initialData?.months ?? 12);
  const [downPayment, setDownPayment] = useState(DOWN_OPTIONS[0].amount);
  const [showSchedule, setShowSchedule] = useState(false);

  const [discountCode, setDiscountCode] = useState(initialData?.discountCode ?? pendingDiscountCode ?? "");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountError, setDiscountError] = useState("");

  const discountAmount = discountApplied ? DISCOUNT_VALUE : 0;
  const finalTotal = total - discountAmount;

  const monthly = useMemo(() => {
    if (installmentType === "full") return 0;
    const rem = finalTotal - downPayment;
    return rem > 0 ? Math.ceil(rem / months) : 0;
  }, [finalTotal, months, installmentType, downPayment]);

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

  function applyDiscount() {
    if (!discountCode.trim()) { setDiscountError("أدخل كود الخصم أولاً"); return; }
    const code = discountCode.trim().toUpperCase();
    const validCode = (pendingDiscountCode ?? "").toUpperCase();
    // يُقبل الكود فقط إذا تطابق مع الكود المحدد مسبقاً من المتجر
    const isValid = !!(validCode && code === validCode);
    if (isValid) { setDiscountApplied(true); setDiscountError(""); }
    else { setDiscountError("كود الخصم غير صحيح أو منتهي الصلاحية"); }
  }

  const handleSubmit = () => {
    onSubmit({
      name: initialData?.name ?? "",
      nationalId: initialData?.nationalId ?? "",
      whatsapp: initialData?.whatsapp ?? "",
      address: initialData?.address ?? "",
      installmentType,
      installmentProvider: installmentType === "installment" ? installmentProvider : undefined,
      storeInstallment: installmentType === "installment" && installmentProvider === "store",
      months,
      downPayment,
      discountCode: discountApplied ? discountCode : undefined,
      discountAmount: discountApplied ? discountAmount : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-[#0874ED] font-semibold hover:underline">
        <ArrowRight size={15} />
        رجوع لبيانات العميل
      </button>

      {/* سطر المنتجات */}
      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="divide-y divide-[#F7F9FC]">
          {items.map(({ product, qty, cartKey }) => {
            const price = product.salePrice ?? product.originalPrice ?? product.price;
            const rawImg = product.images?.[0] || product.image;
            const img = rawImg ? resolveImg(rawImg) : undefined;
            return (
              <div key={cartKey} className="flex items-center gap-3 px-5 py-3.5">
                <div className="relative w-12 h-12 shrink-0 bg-[#F7F9FC] rounded-xl overflow-hidden border border-[#E8EDF5]">
                  {img
                    ? <Image src={img} alt={product.name} fill className="object-contain p-1" />
                    : <span className="flex items-center justify-center w-full h-full text-xl">📱</span>
                  }
                </div>
                <p className="flex-1 text-sm font-semibold text-[#040D2A] truncate">{product.name}</p>
                <span className="text-sm font-bold text-[#0874ED] shrink-0">
                  {fmt(price * qty)} <span className="text-xs font-normal text-[#B0BCCE]">ريال</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* طريقة الدفع */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0874ED]/10 rounded-lg flex items-center justify-center">
            <CreditCard size={15} className="text-[#0874ED]" />
          </div>
          <h2 className="text-sm font-bold text-gray-800">طريقة الدفع</h2>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Full / Installment toggle */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: "installment", label: "تقسيط", icon: Calendar },
              { value: "full", label: "كاش كامل", icon: Wallet },
            ].map((opt) => {
              const Icon = opt.icon;
              const active = installmentType === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setInstallmentType(opt.value as "full" | "installment")}
                  className={`relative flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all duration-200 ${
                    active
                      ? "border-[#0874ED] bg-gradient-to-br from-[#0874ED]/8 to-[#0874ED]/3 shadow-md"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  {active && (
                    <span className="absolute top-1.5 left-1.5">
                      <CheckCircle2 size={11} className="text-[#0874ED]" />
                    </span>
                  )}
                  <Icon size={14} className={active ? "text-[#0874ED]" : "text-gray-400"} />
                  <p className={`text-xs font-bold ${active ? "text-[#0874ED]" : "text-gray-700"}`}>{opt.label}</p>
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
                  {/* Provider */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600">جهة التقسيط</label>
                    <div className="rounded-2xl border border-[#0874ED]/20 bg-[#0874ED]/5 p-3 flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <Image src="/logo.webp" alt="نظام المتجر" width={40} height={40} className="object-contain w-full h-full" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                            <p className="text-sm font-bold text-gray-800">نظام المتجر</p>
                            <span className="text-[10px] font-bold text-[#0874ED] bg-[#0874ED]/10 px-2 py-0.5 rounded-full">0% فائدة</span>
                          </div>
                          <p className="text-xs text-gray-400 leading-relaxed">تقسيط مريح بدون فوائد مباشرة من المتجر</p>
                        </div>
                        <CheckCircle2 size={18} className="text-[#0874ED] shrink-0" />
                      </div>
                      <Link
                        href="/taqseet"
                        className="w-full text-center py-2 bg-[#0874ED] hover:bg-[#0665D0] text-white text-xs font-bold rounded-xl transition-all active:scale-95"
                      >
                        خطط التقسيط
                      </Link>
                    </div>
                  </div>

                  {/* Months */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Calendar size={12} className="text-[#0874ED]" />
                      عدد أشهر التقسيط
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {MONTHS_OPTIONS.map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMonths(m)}
                          className={`py-2.5 rounded-xl text-xs font-bold transition-all duration-150 border-2 ${
                            months === m
                              ? "border-[#0874ED] bg-[#0874ED] text-white shadow-md shadow-[#0874ED]/25"
                              : "border-gray-200 text-gray-600 hover:border-[#0874ED]/40 hover:text-[#0874ED] bg-white"
                          }`}
                        >
                          {m}
                          <span className="block text-[9px] font-medium opacity-70 mt-0.5">شهر</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Down payment */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <Wallet size={12} className="text-[#0874ED]" />
                      الدفعة الأولى
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DOWN_OPTIONS.map((opt) => (
                        <button
                          key={opt.amount}
                          type="button"
                          onClick={() => setDownPayment(opt.amount)}
                          className={`relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-150 ${
                            downPayment === opt.amount
                              ? "border-[#0874ED] bg-[#0874ED]/8 shadow-sm"
                              : "border-gray-200 hover:border-[#0874ED]/40 bg-white"
                          }`}
                        >
                          {downPayment === opt.amount && (
                            <span className="absolute top-1.5 left-1.5">
                              <CheckCircle2 size={12} className="text-[#0874ED]" />
                            </span>
                          )}
                          <p className={`text-xs font-extrabold ${downPayment === opt.amount ? "text-[#0874ED]" : "text-gray-700"}`}>
                            {opt.label}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Monthly summary */}
                  <div className="bg-gradient-to-r from-[#0874ED]/8 to-[#030D2E]/5 border border-[#0874ED]/15 rounded-2xl p-3 grid grid-cols-2 gap-2">
                    <div className="bg-white/60 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-500 font-medium mb-1">القسط الشهري</p>
                      <p className="text-lg font-extrabold text-[#0874ED] leading-tight">
                        {fmt(monthly)}
                      </p>
                      <p className="text-[10px] text-gray-400">ريال</p>
                    </div>
                    <div className="bg-white/60 rounded-xl p-2.5 text-center">
                      <p className="text-[10px] text-gray-500 font-medium mb-1">المدة</p>
                      <p className="text-lg font-extrabold text-[#040D2A] leading-tight">
                        {months}
                      </p>
                      <p className="text-[10px] text-gray-400">شهر</p>
                    </div>
                  </div>

                  {/* Schedule toggle */}
                  <button
                    type="button"
                    onClick={() => setShowSchedule(!showSchedule)}
                    className="w-full flex items-center justify-between text-xs text-[#0874ED] font-semibold bg-[#0874ED]/5 hover:bg-[#0874ED]/10 transition rounded-xl px-4 py-2.5"
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
                        <div className="rounded-2xl overflow-hidden border border-gray-100 max-h-52 overflow-y-auto">
                          <table className="w-full text-xs table-fixed">
                            <thead className="bg-[#030D2E] sticky top-0">
                              <tr>
                                <th className="py-2.5 px-2 text-right font-semibold text-white/80 w-8">#</th>
                                <th className="py-2.5 px-2 text-right font-semibold text-white/80">التاريخ</th>
                                <th className="py-2.5 px-2 text-right font-semibold text-white/80">المبلغ</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schedule.map((row, i) => (
                                <tr key={row.index} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                                  <td className="py-2 px-2 text-[#0874ED] font-bold">{row.index}</td>
                                  <td className="py-2 px-2 text-gray-500">{row.date}</td>
                                  <td className="py-2 px-2 font-bold text-gray-800 whitespace-nowrap">{fmt(row.amount)} ر</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cash: no discount code */}
          <AnimatePresence>
            {installmentType === "full" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-gradient-to-l from-[#0874ED] to-[#030D2E] text-white rounded-xl font-extrabold text-base shadow-lg shadow-[#0874ED]/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
      >
        استكمال الدفع ←
      </button>
    </div>
  );
}

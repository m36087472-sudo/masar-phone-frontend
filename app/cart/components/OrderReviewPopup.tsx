"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, CreditCard } from "lucide-react";
import RiyalIcon from "../../components/RiyalIcon";
import { RiUser3Line, RiIdCardLine, RiWhatsappLine, RiMapPin2Line } from "react-icons/ri";
import type { CustomerInfo } from "../../store/cartStore";

interface Props {
  customer: CustomerInfo;
  total: number;
  onDone: () => void;
}

const fmt = (n: number) => n.toLocaleString("en-US");

export default function OrderReviewPopup({ customer, total, onDone }: Props) {
  const isInstallment = customer.installmentType === "installment";
  const duration = isInstallment ? 7000 : 3000;
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), duration);
    return () => clearTimeout(t);
  }, [duration]);

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 2400);
      return () => clearTimeout(t);
    }
  }, [done, onDone]);

  const finalTotal = total - (customer.discountAmount ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      dir="rtl"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-xs bg-white rounded-2xl overflow-hidden shadow-2xl max-h-[88dvh] flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-l from-[#0874ED] to-[#030D2E] px-3.5 py-2.5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-white/60 text-[10px] font-medium">ملخص طلبك</p>
            <h2 className="text-white font-extrabold text-sm mt-0.5 flex items-center gap-1">
              {fmt(finalTotal)} <RiyalIcon className="w-[11px] h-[11px] inline align-middle opacity-70" />
            </h2>
          </div>
          <div className="w-7 h-7 bg-white/15 rounded-lg flex items-center justify-center shrink-0">
            <CreditCard size={14} className="text-white" />
          </div>
        </div>

        <div className="px-3 py-2.5 space-y-2 overflow-y-auto">

          {/* بوكس بيانات العميل */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-3 py-2 border-b border-gray-50 flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#0874ED]/10 rounded-md flex items-center justify-center">
                <User size={10} className="text-[#0874ED]" />
              </div>
              <p className="text-[11px] font-extrabold text-gray-700">بيانات العميل</p>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              {[
                { icon: RiUser3Line,    label: "الاسم",   value: customer.name,       ltr: false },
                { icon: RiIdCardLine,   label: "الهوية",  value: customer.nationalId, ltr: true  },
                { icon: RiWhatsappLine, label: "واتساب",  value: customer.whatsapp,   ltr: true  },
                { icon: RiMapPin2Line,  label: "العنوان", value: customer.address,    ltr: false },
              ].map(({ icon: Icon, label, value, ltr }) => (
                <div key={label} className="flex items-center gap-2">
                  <Icon size={11} className="text-[#0874ED] shrink-0" />
                  <span className="text-[10px] text-gray-400 w-10 shrink-0">{label}</span>
                  <span className="text-[11px] font-bold text-gray-800 flex-1 truncate" dir={ltr ? "ltr" : "rtl"}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* بوكس بيانات الدفع */}
          <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="px-3 py-2 border-b border-gray-50 flex items-center gap-1.5">
              <div className="w-5 h-5 bg-[#0874ED]/10 rounded-md flex items-center justify-center">
                <CreditCard size={10} className="text-[#0874ED]" />
              </div>
              <p className="text-[11px] font-extrabold text-gray-700">بيانات الدفع</p>
            </div>
            <div className="px-3 py-2 space-y-1.5">
              <PayRow label="إجمالي الطلب" value={fmt(finalTotal)} icon={<RiyalIcon className="w-[10px] h-[10px] inline align-middle" />} highlight />
              {isInstallment ? (
                <>
                  <PayRow label="الدفعة الأولى" value={fmt(customer.downPayment)} icon={<RiyalIcon className="w-[10px] h-[10px] inline align-middle" />} />
                  <PayRow label="جهة التقسيط"
                    value={
                      customer.installmentProvider === "tabby" ? "Tabby" :
                      customer.installmentProvider === "store" ? "نظام المتجر" : "Tamara"
                    }
                  />
                  <PayRow label="عدد الأشهر" value={`${customer.months} شهر`} />
                </>
              ) : (
                <PayRow label="طريقة الدفع" value="كاش كامل" />
              )}
              {customer.discountAmount ? (
                <PayRow label="خصم مطبّق" value={fmt(customer.discountAmount)} icon={<RiyalIcon className="w-[10px] h-[10px] inline align-middle" />} green prefix="- " />
              ) : null}
            </div>
          </div>

          {/* Spinner / Success */}
          <div className="bg-white rounded-xl px-3 py-4 flex flex-col items-center gap-2 border border-gray-100 shadow-sm mb-1">
            <AnimatePresence mode="wait">
              {!done ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-9 h-9 rounded-full border-[3px] border-[#0874ED]/15 border-t-[#0874ED] animate-spin" />
                  <p className="text-[11px] font-bold text-gray-700">جاري مراجعة طلبك</p>
                  {isInstallment && (
                    <p className="text-[10px] text-gray-400 text-center leading-relaxed">جاري متابعة إمكانية قبول التقسيط لحسابك</p>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.75 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  className="flex flex-col items-center gap-2"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    className="w-9 h-9 bg-green-100 rounded-full flex items-center justify-center"
                  >
                    <CheckCircle2 size={20} className="text-green-500" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-0.5"
                  >
                    <p className="text-green-600 font-extrabold text-[11px]">تمت الموافقة ✓</p>
                    <p className="text-[10px] text-green-500 leading-relaxed">
                      {isInstallment
                        ? "تمت الموافقة على تنفيذ عملية البيع بالتقسيط لحسابك"
                        : "تمت مراجعة طلبك بنجاح"}
                      <br />جاري تحويلك إلى صفحة الدفع…
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}

function PayRow({
  label, value, icon, highlight, green, prefix,
}: {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  highlight?: boolean;
  green?: boolean;
  prefix?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[10px] text-gray-400 shrink-0">{label}</span>
      <span className={`text-[11px] font-extrabold flex items-center gap-0.5 ${highlight ? "text-[#0874ED] text-xs" : green ? "text-green-600" : "text-gray-800"}`}>
        {prefix}{value}{icon}
      </span>
    </div>
  );
}

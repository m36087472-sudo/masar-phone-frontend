"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import CurrencyIcon from "../../../components/CurrencyIcon";

const fmt = (n: number) => n.toLocaleString("en-US");

const DOWN_PAYMENTS = [1000, 1500, 2000];
const MONTHS = [4, 8, 12, 16, 20, 24];

interface Props {
  price: number;
}

export default function InstallmentCalculator({ price }: Props) {
  const [open, setOpen] = useState(false);
  const [downPayment, setDownPayment] = useState(1000);
  const [months, setMonths] = useState(12);

  const remaining = Math.max(price - downPayment, 0);
  const monthly = remaining > 0 ? Math.ceil(remaining / months) : 0;
  const total = downPayment + monthly * months;

  if (price <= 1000) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">

      {/* ── Header ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors duration-150"
      >
        <div className="flex items-center gap-2">
          <Icon icon="solar:card-2-bold" width={16} className="text-[#0B43FD] shrink-0" />
          <span className="text-[12px] sm:text-[13px] font-bold text-gray-700">حاسبة التقسيط</span>
        </div>
        <div className="flex items-center gap-2">
          {!open && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400">
              من {fmt(Math.ceil((price - 1000) / 24))} <CurrencyIcon className="inline w-[10px] h-[10px] align-middle" color="#9ca3af" /> / شهر
            </span>
          )}
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}>
            <Icon icon="solar:alt-arrow-down-linear" width={14} className="text-gray-400" />
          </motion.div>
        </div>
      </button>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-4 pb-4 pt-4 flex flex-col gap-4">

              {/* ── Down payment ── */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400">الدفعة المقدمة</span>
                <div className="grid grid-cols-3 gap-2">
                  {DOWN_PAYMENTS.map((dp) => {
                    const active = downPayment === dp;
                    return (
                      <button
                        key={dp}
                        onClick={() => setDownPayment(dp)}
                        className={`py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-[12px] font-bold border transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-[#0B43FD] text-white border-[#0B43FD] shadow-sm shadow-[#0B43FD]/20"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#0B43FD]/40"
                        }`}
                      >
                        {fmt(dp)}
                        <span className={`block text-[9px] font-medium mt-0.5 ${active ? "text-white/70" : "text-gray-400"}`}>
                          <CurrencyIcon className="inline w-[9px] h-[9px] align-middle" color={active ? "rgba(255,255,255,0.7)" : "#9ca3af"} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Months ── */}
              <div className="flex flex-col gap-2">
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400">مدة السداد (شهر)</span>
                <div className="grid grid-cols-6 gap-1.5">
                  {MONTHS.map((m) => {
                    const active = months === m;
                    return (
                      <button
                        key={m}
                        onClick={() => setMonths(m)}
                        className={`py-2 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-[#0B43FD] text-white border-[#0B43FD] shadow-sm shadow-[#0B43FD]/20"
                            : "bg-white text-gray-500 border-gray-200 hover:border-[#0B43FD]/40"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Result card ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${downPayment}-${months}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-2xl border border-[#0B43FD]/20 bg-[#0B43FD] overflow-hidden"
                >
                  {/* Monthly */}
                  <div className="px-4 py-4 flex items-center justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-white/60 font-medium mb-1">القسط الشهري</span>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[26px] sm:text-[32px] font-black text-white leading-none">
                          {fmt(monthly)}
                        </span>
                        <span className="text-[11px] sm:text-[13px] font-semibold text-white/70">
                          <CurrencyIcon className="inline w-[11px] h-[11px] align-middle" color="rgba(255,255,255,0.7)" />
                        </span>
                        <span className="text-[10px] text-white/50">× {months} شهر</span>
                      </div>
                    </div>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
                      <Icon icon="solar:calendar-bold" width={18} className="text-white" />
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="bg-white/10 px-4 py-3 grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "المقدم",   value: fmt(downPayment) },
                      { label: "الباقي",   value: fmt(remaining)   },
                      { label: "الإجمالي", value: fmt(total)       },
                    ].map((row) => (
                      <div key={row.label} className="flex flex-col gap-0.5">
                        <span className="text-[10px] sm:text-[11px] text-white/50 font-medium">{row.label}</span>
                        <span className="text-[13px] sm:text-[15px] font-black text-white leading-tight">{row.value}</span>
                        <span className="text-[9px] sm:text-[10px] text-white/40">
                          <CurrencyIcon className="inline w-[9px] h-[9px] align-middle" color="rgba(255,255,255,0.4)" />
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

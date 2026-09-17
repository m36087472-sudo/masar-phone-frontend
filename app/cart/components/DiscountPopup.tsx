"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiCoupon2Line, RiFileCopyLine, RiCheckLine } from "react-icons/ri";
import { useCartStore } from "../../store/cartStore";

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += "-";
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function DiscountBanner() {
  const { setPendingDiscountCode } = useCartStore();
  const [open, setOpen]   = useState(false);
  const [code]            = useState(generateCode);
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setPendingDiscountCode(code);
    setCopied(true);
    setTimeout(() => setOpen(false), 900);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 bg-[#F7F9FC] border border-[#E8EDF5] hover:border-[#0874ED]/40 rounded-2xl px-5 py-3.5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0874ED]/10 rounded-xl flex items-center justify-center shrink-0">
            <RiCoupon2Line size={17} className="text-[#0874ED]" />
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#040D2A]">لديك كوبون خصم؟ 🎉</p>
            <p className="text-xs text-[#8A96A8]">اضغط لعرض كودك ووفّر <span className="text-[#0874ED] font-semibold">100 ريال</span></p>
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#0874ED] text-base"
        >
          ↓
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mt-2 bg-[#FEFEFE] border border-[#E8EDF5] rounded-2xl overflow-hidden"
          >
            <div className="h-0.5 w-full bg-[#0874ED]" />
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-[#8A96A8] text-center">انسخ الكود واستخدمه عند الدفع</p>
              <button
                onClick={copyCode}
                className={`w-full flex items-center justify-between gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition-all ${
                  copied ? "bg-emerald-50 border-emerald-300" : "bg-[#F7F9FC] border-[#E8EDF5] hover:border-[#0874ED]/40"
                }`}
              >
                <span className={`font-mono font-black text-lg tracking-widest select-all ${copied ? "text-emerald-600" : "text-[#040D2A]"}`}>
                  {code}
                </span>
                <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 transition-all ${
                  copied ? "bg-emerald-500 text-white" : "bg-[#0874ED] text-white hover:bg-[#0665D0]"
                }`}>
                  {copied ? <RiCheckLine size={13} /> : <RiFileCopyLine size={13} />}
                  {copied ? "تم النسخ ✓" : "نسخ"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

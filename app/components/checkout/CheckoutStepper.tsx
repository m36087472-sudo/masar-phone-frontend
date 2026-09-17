"use client";

import { motion } from "framer-motion";
import { ShoppingCart, CreditCard, Wallet, CheckCircle } from "lucide-react";

const steps = [
  { id: 1, label: "السلة",       icon: ShoppingCart },
  { id: 2, label: "طرق الدفع",  icon: CreditCard   },
  { id: 3, label: "الدفع",      icon: Wallet        },
  { id: 4, label: "تأكيد",      icon: CheckCircle   },
];

export default function CheckoutStepper({ currentStep }: { currentStep: 1 | 2 | 3 | 4 }) {
  return (
    <div className="w-full bg-[#FEFEFE] border-b border-[#E8EDF5]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between relative">
          {/* Track */}
          <div className="absolute top-4 sm:top-5 left-6 right-6 h-px bg-[#E8EDF5] z-0" />
          {/* Fill */}
          <motion.div
            className="absolute top-4 sm:top-5 left-6 h-px bg-[#0874ED] z-0"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: ((currentStep - 1) / (steps.length - 1)) }}
            style={{ right: "1.5rem", transformOrigin: "left" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
          {steps.map((step) => {
            const done   = step.id < currentStep;
            const active = step.id === currentStep;
            const Icon   = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center gap-1 z-10">
                <motion.div
                  animate={{
                    backgroundColor: done ? "#0874ED" : active ? "#0874ED" : "#F1F5FB",
                    scale: active ? 1.06 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center"
                  style={{ boxShadow: active ? "0 0 0 3px #0874ED22" : "none" }}
                >
                  {done ? (
                    <CheckCircle size={14} className="text-white" />
                  ) : (
                    <Icon size={13} className={active ? "text-white" : "text-[#B0BCCE]"} />
                  )}
                </motion.div>
                <span className={`text-[9px] sm:text-[10px] font-medium ${active ? "text-[#0874ED]" : done ? "text-[#0874ED]" : "text-[#B0BCCE]"}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

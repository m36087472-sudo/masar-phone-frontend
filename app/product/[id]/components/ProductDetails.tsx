"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import type { Product } from "../../../components/products/types";

const GROUP_META: Record<string, { icon: string; color: string }> = {
  "الشاشة":   { icon: "solar:monitor-smartphone-bold-duotone", color: "#0B43FD" },
  "الأداء":   { icon: "solar:cpu-bolt-bold-duotone",           color: "#7c3aed" },
  "الكاميرا": { icon: "solar:camera-bold-duotone",             color: "#0891b2" },
  "البطارية": { icon: "solar:battery-charge-bold-duotone",     color: "#059669" },
  "الاتصال":  { icon: "solar:wifi-router-bold-duotone",        color: "#d97706" },
  "التصميم":  { icon: "solar:pen-new-square-bold-duotone",     color: "#db2777" },
};

const SPEC_ICONS: Record<string, string> = {
  "النوع":           "solar:display-bold-duotone",
  "الحجم":           "solar:ruler-bold-duotone",
  "الدقة":           "solar:eye-bold-duotone",
  "معدل التحديث":    "solar:refresh-circle-bold-duotone",
  "المعالج":         "solar:cpu-bold-duotone",
  "الرام":           "solar:database-bold-duotone",
  "التخزين":         "solar:hard-drive-bold-duotone",
  "نظام التشغيل":    "solar:settings-bold-duotone",
  "الرئيسية":        "solar:camera-bold-duotone",
  "الزاوية الواسعة": "solar:camera-add-bold-duotone",
  "تيليفوتو 5x":     "solar:telescope-bold-duotone",
  "الأمامية":        "solar:user-rounded-bold-duotone",
  "الشحن السلكي":    "solar:bolt-bold-duotone",
  "الشحن اللاسلكي":  "solar:wi-fi-bold-duotone",
  "عمر البطارية":    "solar:clock-circle-bold-duotone",
};

interface Props {
  description?: string;
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
  installment?: Product["installment"];
}

export default function ProductDetails({ description, specGroups, installment }: Props) {
  const hasSpecs = specGroups && specGroups.length > 0;
  const [activeGroup, setActiveGroup] = useState(0);
  const fmt = (n: number) => n.toLocaleString("ar-SA");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-8"
      dir="rtl"
    >

      {/* ── SPECS hidden ── */}
      {false && hasSpecs && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4">

          {/* Group tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto scrollbar-hide">
            {specGroups!.map((group, gi) => {
              const meta = GROUP_META[group.group] ?? { icon: "solar:list-bold-duotone", color: "#0B43FD" };
              const isActive = activeGroup === gi;
              return (
                <button
                  key={gi}
                  onClick={() => setActiveGroup(gi)}
                  className="relative flex items-center gap-2 px-5 py-4 text-sm font-bold whitespace-nowrap cursor-pointer transition-colors shrink-0"
                  style={{ color: isActive ? meta.color : "#9ca3af" }}
                >
                  <Icon icon={meta.icon} width={16} />
                  {group.group}
                  {isActive && (
                    <motion.div
                      layoutId="spec-tab-line"
                      className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
                      style={{ background: meta.color }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Table */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28 }}
            >
              {(() => {
                const group = specGroups![activeGroup];
                const meta = GROUP_META[group.group] ?? { color: "#0B43FD" };
                const items = group.items;
                // pair items: every 2 items in one row
                const rows: typeof items[] = [];
                for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));

                return (
                  <div className="divide-y divide-gray-50">
                    {rows.map((pair, ri) => (
                      <div key={ri} className="grid grid-cols-2 divide-x divide-x-reverse divide-gray-50">
                        {pair.map((item, ci) => (
                          <div key={ci} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                              style={{ background: `${meta.color}12` }}
                            >
                              <Icon
                                icon={SPEC_ICONS[item.key] ?? "solar:star-bold-duotone"}
                                width={16}
                                style={{ color: meta.color }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[10px] text-gray-400 font-semibold mb-0.5">{item.key}</p>
                              <p className="text-sm font-black text-gray-900 truncate">{item.value}</p>
                            </div>
                          </div>
                        ))}
                        {/* if odd item, fill empty cell */}
                        {pair.length === 1 && <div />}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* ── INSTALLMENT ── */}
      {installment?.available && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <Icon icon="solar:card-recive-bold-duotone" width={20} className="text-[#5a9030]" />
            <p className="text-sm font-black text-gray-800">التقسيط الميسر</p>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center gap-4 bg-[#f0fbe4] rounded-2xl p-4">
              <Icon icon="solar:wallet-money-bold-duotone" width={22} className="text-[#4fa800] shrink-0" />
              <div>
                <p className="text-sm font-black text-[#3d6b1a]">احصل عليه الآن بالتقسيط</p>
                {installment.downPayment && (
                  <p className="text-xs text-[#6DBE00] font-bold mt-0.5">مقدم {fmt(installment.downPayment)} ر.س فقط</p>
                )}
                {installment.note && <p className="text-[11px] text-gray-500 mt-0.5">{installment.note}</p>}
              </div>
            </div>
            {installment.conditions?.map((c, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <Icon icon="solar:check-circle-bold-duotone" width={15} className="text-[#0B43FD] shrink-0 mt-0.5" />
                <span className="text-xs text-gray-600 leading-relaxed">{c}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {description && <span className="hidden">{description}</span>}
    </motion.div>
  );
}

"use client";

/**
 * Admin: Exchange Rate Settings
 * Manage the reference SAR → currency rates used when auto-generating prices.
 * These rates are NEVER used during product display — only for "generate from SAR".
 */

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface RateEntry {
  currency: string;
  rate: number;
  label: string;
  updatedAt?: string;
}

const CURRENCIES = [
  { currency: "SAR", nameAr: "السعودية", flag: "🇸🇦", note: "العملة الأساسية — لا يمكن تعديلها", readonly: true },
  { currency: "AED", nameAr: "الإمارات", flag: "🇦🇪", note: "الدرهم الإماراتي", readonly: false },
  { currency: "QAR", nameAr: "قطر",      flag: "🇶🇦", note: "الريال القطري",    readonly: false },
  { currency: "KWD", nameAr: "الكويت",   flag: "🇰🇼", note: "الدينار الكويتي", readonly: false },
  { currency: "OMR", nameAr: "عُمان",    flag: "🇴🇲", note: "الريال العُماني", readonly: false },
];

export default function ExchangeRatesPage() {
  const [rates, setRates] = useState<Record<string, string>>({});
  const [original, setOriginal] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/exchange-rates", { credentials: "include" })
      .then((r) => r.json())
      .then((data: RateEntry[]) => {
        const rateMap: Record<string, string> = {};
        const origMap: Record<string, number> = {};
        for (const r of data) {
          rateMap[r.currency] = String(r.rate);
          origMap[r.currency] = r.rate;
        }
        setRates(rateMap);
        setOriginal(origMap);
      })
      .catch(() => toast.error("فشل تحميل معاملات الصرف"))
      .finally(() => setLoading(false));
  }, []);

  async function saveCurrency(currency: string) {
    const val = Number(rates[currency]);
    if (!Number.isFinite(val) || val <= 0) {
      toast.error("أدخل قيمة موجبة صحيحة");
      return;
    }
    setSaving(currency);
    try {
      const res = await fetch(`/api/admin/exchange-rates/${currency}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: val }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الحفظ");
      setOriginal((prev) => ({ ...prev, [currency]: val }));
      toast.success(`تم حفظ معامل ${currency} ✅`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-6" dir="rtl">
      <div>
        <h1 className="text-xl font-bold text-gray-800">معاملات الصرف المرجعية</h1>
        <p className="text-sm text-gray-500 mt-1">
          هذه المعاملات تُستخدم فقط عند توليد أسعار الدول تلقائياً من السعر السعودي.
          لا تُستخدم أثناء عرض المنتجات للزوار — الأسعار المعروضة مخزنة مسبقاً.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
        ⚠️ تغيير هذه المعاملات لا يُحدّث أسعار المنتجات الموجودة تلقائياً.
        يجب الذهاب لكل منتج واستخدام زر <strong>"توليد من السعر السعودي"</strong> لتطبيق المعاملات الجديدة.
      </div>

      <div className="space-y-4">
        {CURRENCIES.map((c) => {
          const currentVal = rates[c.currency] ?? "";
          const isDirty = Number(currentVal) !== original[c.currency];

          return (
            <div key={c.currency} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{c.nameAr}</p>
                    <p className="text-xs text-gray-400">{c.note}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-1 max-w-xs">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-400 mb-1">
                      1 SAR = ? {c.currency}
                    </label>
                    <input
                      type="number"
                      value={currentVal}
                      onChange={(e) =>
                        setRates((prev) => ({ ...prev, [c.currency]: e.target.value }))
                      }
                      min="0.000001"
                      step="0.0001"
                      disabled={c.readonly}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                      dir="ltr"
                    />
                  </div>
                  {!c.readonly && (
                    <button
                      onClick={() => saveCurrency(c.currency)}
                      disabled={saving === c.currency || !isDirty}
                      className="mt-5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {saving === c.currency ? "..." : "حفظ"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

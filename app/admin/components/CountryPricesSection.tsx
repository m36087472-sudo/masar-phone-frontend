"use client";

/**
 * CountryPricesSection
 * Reusable section for Add/Edit Product admin pages.
 * Shows price fields for each supported country.
 * Includes a "generate from SAR" button when a product ID is available.
 */

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export interface CountryPriceEntry {
  originalPrice: string;
  salePrice: string;
}

export type CountryPricesMap = Record<string, CountryPriceEntry>;

interface Country {
  code: string;
  currency: string;
  nameAr: string;
  flag: string;
  decimals: number;
  step: string;
}

const COUNTRIES: Country[] = [
  { code: "SA", currency: "SAR", nameAr: "السعودية",  flag: "🇸🇦", decimals: 2, step: "0.01" },
  { code: "AE", currency: "AED", nameAr: "الإمارات",  flag: "🇦🇪", decimals: 2, step: "0.01" },
  { code: "QA", currency: "QAR", nameAr: "قطر",       flag: "🇶🇦", decimals: 2, step: "0.01" },
  { code: "KW", currency: "KWD", nameAr: "الكويت",    flag: "🇰🇼", decimals: 3, step: "0.001" },
  { code: "OM", currency: "OMR", nameAr: "عُمان",     flag: "🇴🇲", decimals: 3, step: "0.001" },
];

interface Props {
  prices: CountryPricesMap;
  onChange: (prices: CountryPricesMap) => void;
  /** SAR original price — used for auto-generate preview */
  sarOriginalPrice?: string;
  /** If editing an existing product, its ID (enables "generate from SAR" API call) */
  productId?: string;
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function CountryPricesSection({
  prices,
  onChange,
  sarOriginalPrice,
  productId,
}: Props) {
  const [generating, setGenerating] = useState(false);

  function handleChange(
    currency: string,
    field: "originalPrice" | "salePrice",
    value: string
  ) {
    onChange({
      ...prices,
      [currency]: {
        ...(prices[currency] ?? { originalPrice: "", salePrice: "" }),
        [field]: value,
      },
    });
  }

  /** Validate: non-negative number or empty string */
  function isValid(val: string) {
    if (val === "" || val === undefined) return true;
    const n = Number(val);
    return Number.isFinite(n) && n >= 0;
  }

  async function generateFromSar() {
    if (!productId) return;
    setGenerating(true);
    try {
      const res = await fetch(
        `/api/admin/products/${productId}/country-prices/generate-from-sar`,
        { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ overwrite: false }) }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل التوليد");

      // Reload product prices to reflect the new values
      const productRes = await fetch(`/api/admin/products/${productId}`, { credentials: "include" });
      const product = await productRes.json();
      if (product.countryPrices) {
        const updated: CountryPricesMap = {};
        for (const [cur, entry] of Object.entries(
          product.countryPrices as Record<string, { originalPrice: number; salePrice?: number | null }>
        )) {
          updated[cur] = {
            originalPrice: entry.originalPrice != null ? String(entry.originalPrice) : "",
            salePrice: entry.salePrice != null ? String(entry.salePrice) : "",
          };
        }
        onChange(updated);
      }
      toast.success(`تم توليد أسعار ${data.generated?.length ?? 0} عملة`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "فشل التوليد");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
        <h2 className="text-sm font-semibold text-gray-700">أسعار الدول</h2>
        {productId && (
          <button
            type="button"
            onClick={generateFromSar}
            disabled={generating}
            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {generating ? (
              <>
                <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                جاري التوليد...
              </>
            ) : (
              "⚡ توليد من السعر السعودي"
            )}
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400">
        أدخل السعر الأصلي والبيع لكل دولة. اتركه فارغاً إذا كان المنتج غير متاح في تلك الدولة.
        <br />
        KWD وOMR: 3 منازل عشرية — SAR وAED وQAR: 2 منازل عشرية.
      </p>

      <div className="space-y-4">
        {COUNTRIES.map((c) => {
          const entry = prices[c.currency] ?? { originalPrice: "", salePrice: "" };
          const origInvalid = entry.originalPrice !== "" && !isValid(entry.originalPrice);
          const saleInvalid = entry.salePrice !== "" && !isValid(entry.salePrice);

          return (
            <div key={c.currency} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base" aria-hidden="true">{c.flag}</span>
                <span className="text-[13px] font-bold text-gray-700">{c.nameAr}</span>
                <span className="text-[11px] text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md font-mono">{c.currency}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    السعر الأصلي ({c.currency})
                  </label>
                  <input
                    type="number"
                    value={entry.originalPrice}
                    onChange={(e) => handleChange(c.currency, "originalPrice", e.target.value)}
                    placeholder={`0.${"0".repeat(c.decimals)}`}
                    min="0"
                    step={c.step}
                    className={`${inputCls} ${origInvalid ? "border-red-400 ring-2 ring-red-200" : ""}`}
                  />
                  {origInvalid && <p className="text-xs text-red-500 mt-0.5">قيمة غير صحيحة</p>}
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    سعر البيع ({c.currency}) — اختياري
                  </label>
                  <input
                    type="number"
                    value={entry.salePrice}
                    onChange={(e) => handleChange(c.currency, "salePrice", e.target.value)}
                    placeholder="اتركه فارغاً إن لم يكن هناك خصم"
                    min="0"
                    step={c.step}
                    className={`${inputCls} ${saleInvalid ? "border-red-400 ring-2 ring-red-200" : ""}`}
                  />
                  {saleInvalid && <p className="text-xs text-red-500 mt-0.5">قيمة غير صحيحة</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Convert DB countryPrices object → CountryPricesMap for form state */
export function dbPricesToFormMap(
  dbPrices?: Record<string, { originalPrice: number; salePrice?: number | null }>
): CountryPricesMap {
  if (!dbPrices) return {};
  const result: CountryPricesMap = {};
  for (const [cur, entry] of Object.entries(dbPrices)) {
    result[cur] = {
      originalPrice: entry.originalPrice != null ? String(entry.originalPrice) : "",
      salePrice: entry.salePrice != null ? String(entry.salePrice) : "",
    };
  }
  return result;
}

/** Convert CountryPricesMap → JSON payload for the backend PATCH endpoint */
export function formMapToPayload(
  map: CountryPricesMap
): Record<string, { originalPrice: number; salePrice: number | null }> {
  const result: Record<string, { originalPrice: number; salePrice: number | null }> = {};
  for (const [cur, entry] of Object.entries(map)) {
    if (entry.originalPrice === "" && entry.salePrice === "") continue; // skip blank
    const orig = Number(entry.originalPrice);
    if (!Number.isFinite(orig) || orig < 0) continue; // skip invalid
    const sale =
      entry.salePrice !== "" && entry.salePrice != null
        ? Number(entry.salePrice)
        : null;
    result[cur] = { originalPrice: orig, salePrice: sale };
  }
  return result;
}

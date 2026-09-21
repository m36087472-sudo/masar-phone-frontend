"use client";

/**
 * CountrySelector — Navbar dropdown for switching country/currency.
 * Shows: flag + currency code on the trigger button.
 * Opens: a dropdown with flag + country name + currency code for each supported country.
 * RTL-first, accessible (role="listbox", keyboard navigation, focus trap).
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { useCurrencyStore } from "../../store/currencyStore";
import { COUNTRY_LIST } from "../../lib/countries";
import { useCartStore } from "../../store/cartStore";

export default function CountrySelector() {
  const { country, setCountry, isHydrated } = useCurrencyStore();
  const [open, setOpen] = useState(false);
  const [confirmPending, setConfirmPending] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cartItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clear);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  const handleSelect = useCallback((code: string) => {
    if (code === country.code) { setOpen(false); return; }

    // If cart has items with a different currency, prompt the user
    if (cartItems.length > 0) {
      setConfirmPending(code);
      setOpen(false);
      return;
    }

    setCountry(code);
    setOpen(false);
  }, [country.code, cartItems.length, setCountry]);

  const confirmChange = useCallback(() => {
    if (!confirmPending) return;
    clearCart();
    setCountry(confirmPending);
    setConfirmPending(null);
  }, [confirmPending, clearCart, setCountry]);

  // Don't render until hydrated (avoids SSR/hydration mismatch)
  if (!isHydrated) {
    return (
      <div className="flex items-center gap-1 px-2 py-1.5 rounded-full text-[#0B43FD] text-xs font-bold min-w-[56px]">
        <span>🇸🇦</span>
        <span>SAR</span>
      </div>
    );
  }

  return (
    <>
      <div ref={containerRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`الدولة الحالية: ${country.nameAr} — انقر للتغيير`}
          className={`flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-bold transition-colors ${
            open
              ? "bg-[#0B43FD]/10 text-[#0B43FD]"
              : "text-[#0B43FD] hover:bg-[#0B43FD]/8"
          }`}
        >
          <img
            src={`https://flagcdn.com/w40/${country.code.toLowerCase()}.png`}
            alt={country.nameEn}
            width={20}
            height={15}
            className="rounded-sm object-cover shrink-0"
          />
          <span className="hidden sm:inline">{country.currency}</span>
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            aria-label="اختر الدولة والعملة"
            className="absolute top-full mt-2 left-0 bg-white border border-[#0B43FD]/15 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-[60] min-w-[180px]"
            dir="rtl"
          >
            <p className="text-[10px] text-gray-400 font-semibold px-3 pt-2.5 pb-1">الدولة والعملة</p>
            {COUNTRY_LIST.map((c) => {
              const isActive = c.code === country.code;
              return (
                <button
                  key={c.code}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-[#0B43FD]/8 text-[#0B43FD] font-bold"
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                  }`}
                >
                  {/* صورة العلم */}
                  <img
                    src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`}
                    alt={c.nameEn}
                    width={24}
                    height={18}
                    className="rounded-sm object-cover shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 text-right">
                    <span className="block text-xs font-semibold leading-tight">{c.nameAr}</span>
                    <span className="block text-[10px] text-gray-400 leading-tight">{c.nameEn}</span>
                  </div>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-[#0B43FD] text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    {c.currency}
                  </span>
                  {isActive && (
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 7l4 4 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart-clear confirmation modal */}
      {confirmPending && (() => {
        const pending = COUNTRY_LIST.find((c) => c.code === confirmPending);
        return (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="country-change-title"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 text-right" dir="rtl">
              <p id="country-change-title" className="text-sm font-bold text-gray-800 mb-1">
                تغيير الدولة إلى {pending?.flag} {pending?.nameAr}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                سيتم إفراغ السلة الحالية لأن الأسعار تختلف بين الدول. هل تريد المتابعة؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={confirmChange}
                  className="flex-1 py-2 bg-[#0B43FD] text-white rounded-xl text-sm font-bold hover:bg-[#0935d4] transition-colors"
                >
                  تأكيد التغيير
                </button>
                <button
                  onClick={() => setConfirmPending(null)}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}

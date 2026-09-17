"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const LOGO_CACHE_KEY = "admin_logo_cache";
const LOGO_CACHE_TTL = 30 * 60 * 1000; // 30 دقيقة

function getCachedLogo(): string {
  try {
    const raw = localStorage.getItem(LOGO_CACHE_KEY);
    if (!raw) return "";
    const { logo, ts } = JSON.parse(raw);
    if (Date.now() - ts > LOGO_CACHE_TTL) {
      localStorage.removeItem(LOGO_CACHE_KEY);
      return "";
    }
    return logo || "";
  } catch {
    return "";
  }
}

function setCachedLogo(logo: string) {
  try {
    localStorage.setItem(LOGO_CACHE_KEY, JSON.stringify({ logo, ts: Date.now() }));
  } catch {}
}

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const [logo, setLogo] = useState("");
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    let aborted = false;

    // اعرض الـ logo من الـ cache فوراً بدون انتظار
    const cached = getCachedLogo();
    if (cached) setLogo(cached);

    const ctrl = new AbortController();

    // جلب orders/count دائماً — جلب company فقط لو مفيش cache
    const fetches: Promise<unknown>[] = [
      fetch("/api/admin/orders/count", { credentials: "include", signal: ctrl.signal }).then((r) => r.json()),
    ];
    if (!cached) {
      fetches.push(
        fetch("/api/admin/company", { credentials: "include", signal: ctrl.signal }).then((r) => r.json())
      );
    }

    Promise.all(fetches)
      .then(([countData, company]) => {
        if (aborted) return;
        setOrderCount(typeof (countData as { count?: number })?.count === "number" ? (countData as { count: number }).count : 0);
        if (company) {
          const c = company as { logo?: string };
          const logoUrl = c.logo
            ? (c.logo.startsWith("http") ? c.logo : `http://localhost:5000${c.logo}`)
            : "";
          setLogo(logoUrl);
          setCachedLogo(logoUrl);
        }
      })
      .catch(() => {});

    // polling كل 60 ثانية للـ orders/count فقط
    const interval = setInterval(() => {
      if (aborted) return;
      fetch("/api/admin/orders/count", { credentials: "include" })
        .then((r) => r.json())
        .then((d) => { if (!aborted) setOrderCount(typeof d?.count === "number" ? d.count : 0); })
        .catch(() => {});
    }, 60_000);

    return () => {
      aborted = true;
      ctrl.abort();
      clearInterval(interval);
    };
  }, []);

  async function handleLogout() {
    localStorage.removeItem(LOGO_CACHE_KEY);
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {logo ? (
          <Image src={logo} alt="شعار الشركة" width={120} height={40} className="h-10 w-auto object-contain" unoptimized />
        ) : (
          <span className="font-bold text-gray-800 text-lg">لوحة التحكم</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/admin/orders")}
          className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="الطلبات"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {orderCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {orderCount > 99 ? "99+" : orderCount}
            </span>
          )}
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          خروج
        </button>
      </div>
    </header>
  );
}

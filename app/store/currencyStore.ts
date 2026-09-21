/**
 * currencyStore — Zustand store for country/currency selection.
 *
 * Priority (highest → lowest):
 *  1. User's manual selection (persisted in cookie + localStorage)
 *  2. IP-detected country on first visit
 *  3. SA / SAR as fallback
 *
 * The store is NOT persisted via zustand/middleware to keep it SSR-safe.
 * Persistence is handled manually via document.cookie so the server can
 * read it from middleware before rendering pages.
 */

import { create } from "zustand";
import {
  type CountryConfig,
  DEFAULT_COUNTRY,
  COUNTRIES,
  SUPPORTED_COUNTRY_CODES,
  resolveCountry,
  COUNTRY_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
} from "../lib/countries";

interface CurrencyState {
  /** Current country config */
  country: CountryConfig;
  /** Whether country was auto-detected from IP (false = user-chosen or default) */
  isAutoDetected: boolean;
  /** Whether the store has been initialised from cookie/IP (prevents hydration flash) */
  isHydrated: boolean;

  /** Set country manually — highest priority, persists to cookie */
  setCountry: (code: string) => void;
  /** Called by layout once on mount: reads cookie, falls back to IP detection */
  hydrate: () => Promise<void>;
}

function writeCookie(code: string) {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${COUNTRY_COOKIE}=${code}`,
    `path=/`,
    `max-age=${COUNTRY_COOKIE_MAX_AGE}`,
    `SameSite=Lax`,
  ].join("; ");
}

function readCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COUNTRY_COOKIE}=`));
  return match ? match.split("=")[1] : null;
}

export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  country: DEFAULT_COUNTRY,
  isAutoDetected: false,
  isHydrated: false,

  setCountry(code: string) {
    const resolved = resolveCountry(code);
    writeCookie(resolved.code);
    set({ country: resolved, isAutoDetected: false });
  },

  async hydrate() {
    // Only run once
    if (get().isHydrated) return;

    // 1. Check cookie first (user's saved preference)
    const saved = readCookie();
    if (saved && SUPPORTED_COUNTRY_CODES.includes(saved)) {
      set({ country: resolveCountry(saved), isAutoDetected: false, isHydrated: true });
      return;
    }

    // 2. Detect from IP via our API route
    try {
      const res = await fetch("/api/geo", { credentials: "omit" });
      if (res.ok) {
        const { countryCode } = await res.json() as { countryCode: string };
        if (SUPPORTED_COUNTRY_CODES.includes(countryCode)) {
          const detected = resolveCountry(countryCode);
          // Write cookie so next visit skips the fetch
          writeCookie(detected.code);
          set({ country: detected, isAutoDetected: true, isHydrated: true });
          return;
        }
      }
    } catch {
      // Silently fall through to default
    }

    // 3. Default: SA
    set({ country: DEFAULT_COUNTRY, isAutoDetected: false, isHydrated: true });
  },
}));

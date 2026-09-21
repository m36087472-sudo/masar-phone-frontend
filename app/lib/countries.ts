/**
 * Frontend countries/currencies config.
 * Mirror of backend/config/countries.js — single source of truth for UI.
 * Never used for runtime price conversion; only for display and routing.
 */

export interface CountryConfig {
  code: string;       // ISO 3166-1 alpha-2
  currency: string;   // ISO 4217
  nameAr: string;
  nameEn: string;     // English name
  flag: string;       // emoji flag
  decimals: number;   // decimal places for this currency
  symbolAr: string;   // Arabic currency symbol shown in UI
}

export const COUNTRIES: Record<string, CountryConfig> = {
  SA: { code: "SA", currency: "SAR", nameAr: "السعودية", nameEn: "Saudi Arabia", flag: "🇸🇦", decimals: 2, symbolAr: "ر.س" },
  AE: { code: "AE", currency: "AED", nameAr: "الإمارات", nameEn: "UAE",          flag: "🇦🇪", decimals: 2, symbolAr: "د.إ" },
  QA: { code: "QA", currency: "QAR", nameAr: "قطر",      nameEn: "Qatar",        flag: "🇶🇦", decimals: 2, symbolAr: "ر.ق" },
  KW: { code: "KW", currency: "KWD", nameAr: "الكويت",   nameEn: "Kuwait",       flag: "🇰🇼", decimals: 3, symbolAr: "د.ك" },
  OM: { code: "OM", currency: "OMR", nameAr: "عُمان",    nameEn: "Oman",         flag: "🇴🇲", decimals: 3, symbolAr: "ر.ع" },
};

/** Ordered list for dropdowns/selectors */
export const COUNTRY_LIST: CountryConfig[] = [
  COUNTRIES.SA,
  COUNTRIES.AE,
  COUNTRIES.QA,
  COUNTRIES.KW,
  COUNTRIES.OM,
];

export const SUPPORTED_COUNTRY_CODES = COUNTRY_LIST.map((c) => c.code);
export const SUPPORTED_CURRENCIES    = COUNTRY_LIST.map((c) => c.currency);

export const DEFAULT_COUNTRY = COUNTRIES.SA;

/** Map from currency code → CountryConfig */
export const CURRENCY_TO_COUNTRY: Record<string, CountryConfig> = {};
for (const c of COUNTRY_LIST) CURRENCY_TO_COUNTRY[c.currency] = c;

export function resolveCountry(code: string): CountryConfig {
  return COUNTRIES[code] ?? DEFAULT_COUNTRY;
}

/**
 * Format a price number for display in the given currency.
 * Applies correct decimal places; uses en-US locale for digit grouping (Arabic context).
 */
export function formatPrice(amount: number, currency: string): string {
  const config = CURRENCY_TO_COUNTRY[currency] ?? DEFAULT_COUNTRY;
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });
}

/** Cookie name for persisting user's country choice */
export const COUNTRY_COOKIE = "preferred_country";
/** Cookie max-age: 1 year */
export const COUNTRY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

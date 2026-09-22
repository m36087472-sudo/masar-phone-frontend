/**
 * phone.ts — Country-aware phone number utility
 *
 * Supports: SA (Saudi) | AE (UAE) | KW (Kuwait) | QA (Qatar) | OM (Oman)
 *
 * Flow:
 *   1. normalize()  — strip spaces/dashes/parens, convert Arabic digits, unify +/00
 *   2. toLocal()    — strip country code prefix → local digits only
 *   3. validate()   — check local digits against per-country rules
 *   4. toE164()     — convert to +CCXXXXXXXXX for storage
 *
 * NO external dependencies — pure regex on known Gulf number plans.
 */

export type SupportedCountry = "SA" | "AE" | "KW" | "QA" | "OM";

// ── Per-country configuration ─────────────────────────────────────────────

export interface PhoneConfig {
  /** ISO 3166-1 alpha-2 */
  code: SupportedCountry;
  /** Numeric country calling code (without +) */
  callingCode: string;
  /** Display label shown in UI prefix badge */
  callingCodeDisplay: string;
  /** Expected length of LOCAL part (after removing leading 0 + callingCode) */
  localLength: number;
  /**
   * Regex tested against the LOCAL digits.
   * Local = the digits a resident dials domestically, with leading zero if applicable.
   * e.g. SA: "0551234567" (10 digits), KW: "51234567" (8 digits)
   */
  localRegex: RegExp;
  /** Human-readable example for error messages */
  example: string;
  /** Arabic error message */
  errorMsg: string;
  /** Placeholder shown inside the input */
  placeholder: string;
  /**
   * Max characters the user is allowed to type in the input.
   * = localLength (we strip leading 0 for countries where user types without it,
   *   but for SA/AE the user types WITH the leading 0 so localLength = 10)
   */
  inputMaxLength: number;
}

export const PHONE_CONFIG: Record<SupportedCountry, PhoneConfig> = {
  SA: {
    code: "SA",
    callingCode: "966",
    callingCodeDisplay: "+966",
    localLength: 10,          // 05XXXXXXXX
    localRegex: /^05[0-9]{8}$/,
    example: "05XXXXXXXX",
    errorMsg: "يرجى إدخال رقم جوال سعودي صحيح مثل 05XXXXXXXX",
    placeholder: "05XXXXXXXX",
    inputMaxLength: 10,
  },
  AE: {
    code: "AE",
    callingCode: "971",
    callingCodeDisplay: "+971",
    localLength: 10,          // 05XXXXXXXX — prefixes: 050,052,054,055,056,058
    localRegex: /^0(50|52|54|55|56|58)[0-9]{7}$/,
    example: "05XXXXXXXX",
    errorMsg: "يرجى إدخال رقم جوال إماراتي صحيح مثل 05XXXXXXXX",
    placeholder: "05XXXXXXXX",
    inputMaxLength: 10,
  },
  KW: {
    code: "KW",
    callingCode: "965",
    callingCodeDisplay: "+965",
    localLength: 8,           // no leading 0 — prefixes: 4,5,6,9
    localRegex: /^[456789][0-9]{7}$/,
    example: "5XXXXXXX",
    errorMsg: "يرجى إدخال رقم جوال كويتي صحيح مكون من 8 أرقام",
    placeholder: "5XXXXXXX",
    inputMaxLength: 8,
  },
  QA: {
    code: "QA",
    callingCode: "974",
    callingCodeDisplay: "+974",
    localLength: 8,           // no leading 0 — mobile prefixes: 3,5,6,7
    localRegex: /^[3567][0-9]{7}$/,
    example: "5XXXXXXX",
    errorMsg: "يرجى إدخال رقم جوال قطري صحيح مكون من 8 أرقام",
    placeholder: "5XXXXXXX",
    inputMaxLength: 8,
  },
  OM: {
    code: "OM",
    callingCode: "968",
    callingCodeDisplay: "+968",
    localLength: 8,           // no leading 0 — mobile prefixes: 7,9
    localRegex: /^[79][0-9]{7}$/,
    example: "9XXXXXXX",
    errorMsg: "يرجى إدخال رقم جوال عماني صحيح مكون من 8 أرقام",
    placeholder: "9XXXXXXX",
    inputMaxLength: 8,
  },
};

// ── Arabic → ASCII digit map ──────────────────────────────────────────────

const AR_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

// ── Step 1: normalize ─────────────────────────────────────────────────────

/**
 * Strip whitespace, dashes, parens; convert Arabic digits; unify 00xxx → +xxx.
 * Returns a string containing only digits and a leading '+' if international.
 */
export function normalizePhone(raw: string | null | undefined): string {
  if (!raw) return "";

  // Convert Arabic-Indic digits
  let s = String(raw).replace(/[٠-٩]/g, d => AR_DIGITS[d] ?? d);

  // Remove all whitespace, dashes, dots, parens
  s = s.replace(/[\s\-().]/g, "");

  // Unify 00 prefix → +
  if (s.startsWith("00")) s = "+" + s.slice(2);

  // Remove any remaining non-digit chars except leading +
  s = s.replace(/(?!^\+)[^\d]/g, "");

  return s;
}

// ── Step 2: strip country code → local digits ─────────────────────────────

/**
 * Given a normalized string (digits / +digits), strip the country calling code
 * for the given country and return the local part.
 *
 * Also handles the shorthand local format:
 *   SA/AE: "5XXXXXXXX" (9 digits, no leading 0) → prepend "0"
 */
function toLocal(normalized: string, cfg: PhoneConfig): string {
  const cc = cfg.callingCode; // e.g. "966"
  let local = normalized;

  // Strip +cc or cc prefix
  if (local.startsWith("+" + cc)) {
    local = local.slice(1 + cc.length);
  } else if (local.startsWith(cc) && local.length >= cc.length + cfg.localLength - 1) {
    local = local.slice(cc.length);
  }

  // Short form or stripped E.164: SA/AE "5XXXXXXXX" (9 digits) → prepend "0"
  if (
    cfg.localRegex.source.startsWith("^0") &&
    local.length === cfg.localLength - 1 &&
    !local.startsWith("0")
  ) {
    local = "0" + local;
  }

  return local;
}

// ── Step 3: validate ──────────────────────────────────────────────────────

export interface PhoneValidationResult {
  valid: boolean;
  /** E.164 format if valid, otherwise undefined */
  e164?: string;
  /** Arabic error message if invalid */
  error?: string;
  /** The local digits used for validation */
  local?: string;
}

/**
 * Validate a phone number string for the given country.
 * Handles all input forms:
 *   - Local:        "0551234567" / "51234567"
 *   - Short local:  "551234567"  (SA — no leading 0)
 *   - International: "+966551234567" / "00966551234567" / "966551234567"
 */
export function validatePhone(
  raw: string | null | undefined,
  country: SupportedCountry | string,
): PhoneValidationResult {
  const cfg = PHONE_CONFIG[country as SupportedCountry];

  // Unknown country — permissive fallback (7+ digits)
  if (!cfg) {
    const digits = normalizePhone(raw).replace(/\D/g, "");
    if (!digits || digits.length < 7) {
      return { valid: false, error: "رقم الجوال غير صحيح" };
    }
    return { valid: true, e164: digits, local: digits };
  }

  const normalized = normalizePhone(raw);

  if (!normalized) {
    return { valid: false, error: "رقم الجوال مطلوب" };
  }

  const local = toLocal(normalized, cfg);

  if (!cfg.localRegex.test(local)) {
    return { valid: false, error: cfg.errorMsg, local };
  }

  return {
    valid: true,
    e164: toE164(local, cfg),
    local,
  };
}

// ── Step 4: toE164 ────────────────────────────────────────────────────────

/**
 * Convert local digits to E.164 format: +{callingCode}{localWithoutLeadingZero}
 * e.g. "0551234567" (SA) → "+966551234567"
 *      "51234567"   (KW) → "+96551234567"
 */
export function toE164(local: string, cfg: PhoneConfig): string {
  // Strip leading zero for countries that use it (SA, AE)
  const digits = local.startsWith("0") ? local.slice(1) : local;
  return `+${cfg.callingCode}${digits}`;
}

// ── Display helpers ───────────────────────────────────────────────────────

/**
 * Format E.164 number for display (local format).
 * "+966551234567" → "0551234567"
 * "+96551234567"  → "51234567"
 */
export function formatPhoneLocal(e164: string, country: SupportedCountry): string {
  const cfg = PHONE_CONFIG[country];
  if (!cfg) return e164;
  const withoutPlus = e164.startsWith("+") ? e164.slice(1) : e164;
  if (!withoutPlus.startsWith(cfg.callingCode)) return e164;
  const local = withoutPlus.slice(cfg.callingCode.length);
  // Re-add leading zero for SA/AE
  if (cfg.localRegex.source.startsWith("^0") && !local.startsWith("0")) {
    return "0" + local;
  }
  return local;
}

/**
 * Smart input sanitizer — call on every keystroke.
 * Returns only the characters the user should see in the local input box.
 * Handles paste of full international number.
 */
export function sanitizePhoneInput(raw: string, country: SupportedCountry): string {
  const cfg = PHONE_CONFIG[country];
  if (!cfg) return raw.replace(/\D/g, "").slice(0, 15);

  // Convert Arabic digits first
  let s = raw.replace(/[٠-٩]/g, d => AR_DIGITS[d] ?? d);

  // If the user pasted a full international number, normalize it to local
  const normalized = normalizePhone(s);
  if (normalized.startsWith("+" + cfg.callingCode) || normalized.startsWith(cfg.callingCode)) {
    const local = toLocal(normalized, cfg);
    if (local.length >= cfg.localLength - 1) {
      return local.slice(0, cfg.inputMaxLength);
    }
  }

  // Otherwise just strip non-digits and cap
  return s.replace(/\D/g, "").slice(0, cfg.inputMaxLength);
}

// ── Utility: get config for a country (safe) ─────────────────────────────

export function getPhoneConfig(country: string): PhoneConfig | null {
  return PHONE_CONFIG[country as SupportedCountry] ?? null;
}

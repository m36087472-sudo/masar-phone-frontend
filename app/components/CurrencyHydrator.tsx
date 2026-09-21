"use client";

/**
 * CurrencyHydrator
 * Mounted in the root layout (client-side only).
 * Calls currencyStore.hydrate() once on mount to resolve the active country:
 *   1. Cookie  →  2. /api/geo  →  3. SA fallback
 * Renders nothing — purely a side-effect component.
 */

import { useEffect } from "react";
import { useCurrencyStore } from "../store/currencyStore";

export default function CurrencyHydrator() {
  const hydrate = useCurrencyStore((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}

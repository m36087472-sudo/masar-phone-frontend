/**
 * useCurrency — thin hook wrapping currencyStore.
 *
 * Returns:
 *  - country:    current CountryConfig
 *  - currency:   string currency code (e.g. "SAR")
 *  - symbol:     Arabic symbol (e.g. "ر.س")
 *  - flag:       emoji flag
 *  - format(n):  formats a number with correct decimal places for the currency
 *  - getPrice(product, storageKey?): extracts the correct price for the active country
 *  - setCountry: change the active country (user action)
 *  - isHydrated: whether the store has been resolved (avoids hydration flash)
 */

import { useCurrencyStore } from "../store/currencyStore";
import { formatPrice } from "../lib/countries";
import type { Product, StorageOption } from "../components/products/types";

export function useCurrency() {
  const { country, setCountry, isHydrated } = useCurrencyStore();
  const { currency, symbolAr: symbol, flag } = country;

  /** Format a raw number for display in the active currency */
  function format(amount: number): string {
    return formatPrice(amount, currency);
  }

  /**
   * Extract the active-country price from a product.
   * Returns { originalPrice, salePrice, available } where available=false
   * means the product has no price for this country.
   *
   * @param product   Product object (from API)
   * @param storageKey  Optional: "storage|ram|size" key to look up a specific
   *                    storageOption's price (same format as ProductInfo uses)
   */
  function getPrice(
    product: Product,
    storageKey?: string
  ): { originalPrice: number; salePrice: number | null; available: boolean } {
    if (currency === "SAR") {
      // SAR always uses the root price fields or storageOption SAR fields
      if (storageKey && product.variants) {
        for (const v of product.variants) {
          const opt = v.storageOptions?.find(
            (o) =>
              `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}` === storageKey ||
              o.storage === storageKey
          );
          if (opt) {
            return {
              originalPrice: opt.originalPrice ?? product.originalPrice,
              salePrice: opt.salePrice ?? null,
              available: true,
            };
          }
        }
      }
      return {
        originalPrice: product.originalPrice,
        salePrice: product.salePrice ?? null,
        available: true,
      };
    }

    // Non-SAR: read from countryPrices map
    const countryPrices = (product as Product & { countryPrices?: Record<string, { originalPrice: number; salePrice?: number | null }> }).countryPrices;

    if (!countryPrices) return { originalPrice: 0, salePrice: null, available: false };

    // For storageOptions with countryPrices: check the specific variant
    if (storageKey && product.variants) {
      for (const v of product.variants) {
        const opt = v.storageOptions?.find(
          (o) =>
            `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}` === storageKey ||
            o.storage === storageKey
        ) as (StorageOption & { countryPrices?: Record<string, { originalPrice: number; salePrice?: number | null }> }) | undefined;

        if (opt) {
          const optPrices = opt.countryPrices;
          if (optPrices) {
            const entry = optPrices[currency];
            if (entry && typeof entry.originalPrice === "number") {
              return {
                originalPrice: entry.originalPrice,
                salePrice: entry.salePrice ?? null,
                available: true,
              };
            }
          }
          // Fall back to top-level countryPrices if storage option has none
          break;
        }
      }
    }

    // Top-level countryPrices
    const entry = countryPrices[currency];
    if (!entry || typeof entry.originalPrice !== "number") {
      return { originalPrice: 0, salePrice: null, available: false };
    }

    return {
      originalPrice: entry.originalPrice,
      salePrice: entry.salePrice ?? null,
      available: true,
    };
  }

  return {
    country,
    currency,
    symbol,
    flag,
    format,
    getPrice,
    setCountry,
    isHydrated,
  };
}

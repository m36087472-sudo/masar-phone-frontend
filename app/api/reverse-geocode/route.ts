/**
 * POST /api/reverse-geocode
 *
 * Server-side reverse geocoding with two providers:
 *
 * 1. Google Maps Geocoding API (if GOOGLE_MAPS_KEY is set AND Geocoding API is enabled)
 *    → Returns address in Arabic (language=ar) + country ISO code
 *
 * 2. Nominatim / OpenStreetMap (free, no key required) — automatic fallback
 *    → Returns address in Arabic via accept-language: ar
 *    → Used when Google key is missing, quota exceeded, or API not enabled
 *
 * Body:   { lat: number, lng: number }
 * 200:    { address: string, countryCode: string }
 * 400:    { error: string }
 */

import { NextRequest, NextResponse } from "next/server";

// ── Google Maps Geocoding ─────────────────────────────────────────────────

async function geocodeGoogle(lat: number, lng: number): Promise<{ address: string; countryCode: string } | null> {
  const key = process.env.GOOGLE_MAPS_KEY;
  if (!key) return null;

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=ar&key=${key}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;

    const data = await res.json() as {
      status: string;
      results: Array<{
        formatted_address: string;
        address_components: Array<{ types: string[]; short_name: string; long_name: string }>;
      }>;
    };

    // REQUEST_DENIED / INVALID_REQUEST / OVER_QUERY_LIMIT → fall through to Nominatim
    if (data.status !== "OK" || !data.results?.length) return null;

    const top = data.results[0];
    const countryComp = top.address_components.find(c => c.types.includes("country"));

    return {
      address:     top.formatted_address ?? "",
      countryCode: countryComp?.short_name ?? "",
    };
  } catch {
    return null;
  }
}

// ── Nominatim (OpenStreetMap) ─────────────────────────────────────────────

async function geocodeNominatim(lat: number, lng: number): Promise<{ address: string; countryCode: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        // Nominatim ToS: identify your app + request Arabic output
        "User-Agent":       "masar-checkout/1.0",
        "Accept-Language":  "ar",
      },
    });
    if (!res.ok) return null;

    const data = await res.json() as {
      display_name?: string;
      address?: { country_code?: string; [k: string]: string | undefined };
      error?: string;
    };

    if (data.error || !data.display_name) return null;

    // country_code from Nominatim is lower-case (e.g. "sa") → uppercase
    const countryCode = (data.address?.country_code ?? "").toUpperCase();

    return {
      address:     data.display_name,
      countryCode,
    };
  } catch {
    return null;
  }
}

// ── Route handler ─────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let lat: number, lng: number;
  try {
    const body = await req.json();
    lat = Number(body.lat);
    lng = Number(body.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error("bad coords");
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) throw new Error("out of range");
  } catch {
    return NextResponse.json({ error: "إحداثيات غير صالحة" }, { status: 400 });
  }

  // Try Google first, fall back to Nominatim
  const result =
    (await geocodeGoogle(lat, lng)) ??
    (await geocodeNominatim(lat, lng)) ??
    { address: "", countryCode: "" };

  return NextResponse.json(result);
}

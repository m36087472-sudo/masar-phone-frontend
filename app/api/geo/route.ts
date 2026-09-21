/**
 * GET /api/geo
 *
 * Detects the visitor's country from request headers set by the hosting
 * platform or from IP lookup (one-time, result is cached in cookie by client).
 *
 * Priority:
 *  1. Vercel's x-vercel-ip-country header (free, no external call)
 *  2. Cloudflare's cf-ipcountry header
 *  3. ip-api.com free lookup using x-forwarded-for (fallback, rate-limited)
 *
 * Returns { countryCode: "SA" | "AE" | "QA" | "KW" | "OM" }
 * If country is unrecognised or lookup fails, returns countryCode: "SA".
 *
 * This route is called at most once per session — the client caches the
 * result in a cookie.
 */

import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_COUNTRY_CODES, DEFAULT_COUNTRY } from "../../lib/countries";

const FALLBACK = DEFAULT_COUNTRY.code; // "SA"

function resolveFromHeaders(req: NextRequest): string | null {
  // Vercel geo detection (free, no rate limit)
  const vercel = req.headers.get("x-vercel-ip-country");
  if (vercel && SUPPORTED_COUNTRY_CODES.includes(vercel)) return vercel;

  // Cloudflare
  const cf = req.headers.get("cf-ipcountry");
  if (cf && SUPPORTED_COUNTRY_CODES.includes(cf)) return cf;

  return null;
}

function extractClientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first && first !== "::1" && first !== "127.0.0.1") return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp !== "::1" && realIp !== "127.0.0.1") return realIp;
  return null;
}

// Simple in-memory cache to avoid hammering ip-api.com during SSR hot paths
// This is per-worker-instance, intentionally not shared
const ipCache = new Map<string, { code: string; ts: number }>();
const IP_CACHE_TTL = 1000 * 60 * 60; // 1 hour per IP

async function lookupIp(ip: string): Promise<string> {
  const cached = ipCache.get(ip);
  if (cached && Date.now() - cached.ts < IP_CACHE_TTL) return cached.code;

  try {
    // ip-api.com: free tier, 45 req/min, no API key needed
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`, {
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    if (!res.ok) return FALLBACK;
    const { countryCode } = (await res.json()) as { countryCode?: string };
    const code = countryCode && SUPPORTED_COUNTRY_CODES.includes(countryCode)
      ? countryCode
      : FALLBACK;
    ipCache.set(ip, { code, ts: Date.now() });
    return code;
  } catch {
    return FALLBACK;
  }
}

export async function GET(req: NextRequest) {
  // 1. Platform headers (instant, no network call)
  const fromHeader = resolveFromHeaders(req);
  if (fromHeader) {
    return NextResponse.json({ countryCode: fromHeader });
  }

  // 2. IP lookup (fallback)
  const ip = extractClientIp(req);
  if (ip) {
    const code = await lookupIp(ip);
    return NextResponse.json({ countryCode: code });
  }

  // 3. Cannot determine — return default
  return NextResponse.json({ countryCode: FALLBACK });
}

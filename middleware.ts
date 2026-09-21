/**
 * Next.js Edge Middleware
 *
 * Runs on every page request BEFORE rendering.
 * Reads the preferred_country cookie and injects it as a request header
 * (x-country-code) so server components can access it without
 * needing a round-trip to /api/geo.
 *
 * Also detects country from platform headers (Vercel / Cloudflare) on
 * first visit (no cookie yet) and sets the cookie for subsequent requests.
 *
 * This ensures zero hydration mismatch: the server knows the country before
 * generating HTML, so there's no "flash of SAR prices".
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SUPPORTED_COUNTRY_CODES,
  COUNTRY_COOKIE,
  COUNTRY_COOKIE_MAX_AGE,
  DEFAULT_COUNTRY,
} from "./app/lib/countries";

const FALLBACK = DEFAULT_COUNTRY.code;

function detectFromPlatformHeaders(req: NextRequest): string | null {
  const vercel = req.headers.get("x-vercel-ip-country");
  if (vercel && SUPPORTED_COUNTRY_CODES.includes(vercel)) return vercel;
  const cf = req.headers.get("cf-ipcountry");
  if (cf && SUPPORTED_COUNTRY_CODES.includes(cf)) return cf;
  return null;
}

export function middleware(req: NextRequest) {
  // Skip static assets and Next.js internals
  const { pathname } = req.nextUrl;
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  // Read saved cookie
  const cookieValue = req.cookies.get(COUNTRY_COOKIE)?.value;
  let countryCode: string;

  if (cookieValue && SUPPORTED_COUNTRY_CODES.includes(cookieValue)) {
    // Cookie present — use saved preference
    countryCode = cookieValue;
  } else {
    // No cookie — try platform detection
    const detected = detectFromPlatformHeaders(req);
    countryCode = detected ?? FALLBACK;

    // Write the cookie so subsequent requests skip detection
    res.cookies.set(COUNTRY_COOKIE, countryCode, {
      path: "/",
      maxAge: COUNTRY_COOKIE_MAX_AGE,
      sameSite: "lax",
      httpOnly: false, // client JS also needs to read it
    });
  }

  // Inject as request header so server components can read it
  res.headers.set("x-country-code", countryCode);

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, apple-icon, manifest.json, robots.txt, sitemap.xml
     */
    "/((?!_next/static|_next/image|favicon|apple-icon|manifest|robots|sitemap).*)",
  ],
};

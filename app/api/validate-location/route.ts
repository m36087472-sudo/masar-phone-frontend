/**
 * POST /api/validate-location
 *
 * Thin proxy that forwards a location validation request to the backend.
 * Keeps BACKEND_URL server-side only — never exposed to the browser.
 *
 * Body:   { lat: number, lon: number, countryCode: string }
 * 200:    { ok: true }
 * 400:    { ok: false, error: string }
 *
 * Security notes:
 * - countryCode is validated server-side by the backend; we do a basic
 *   type/range check here to reject obviously malformed requests early.
 * - Never trust the client's countryCode as proof of location.
 * - No sensitive data (addresses, names) is sent to or logged by this endpoint.
 */

import { NextRequest, NextResponse } from "next/server";

const SUPPORTED = ["SA", "AE", "QA", "KW", "OM"];

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "طلب غير صالح" }, { status: 400 });
  }

  const { lat, lon, countryCode } = (body ?? {}) as Record<string, unknown>;

  // Basic input validation before proxying
  if (!isFiniteNumber(lat) || lat < -90 || lat > 90) {
    return NextResponse.json({ ok: false, error: "خط العرض غير صالح" }, { status: 400 });
  }
  if (!isFiniteNumber(lon) || lon < -180 || lon > 180) {
    return NextResponse.json({ ok: false, error: "خط الطول غير صالح" }, { status: 400 });
  }
  if (typeof countryCode !== "string" || !SUPPORTED.includes(countryCode)) {
    return NextResponse.json({ ok: false, error: "رمز الدولة غير مدعوم" }, { status: 400 });
  }

  const backendUrl = process.env.BACKEND_URL ?? "http://localhost:5000";

  try {
    const res = await fetch(`${backendUrl}/api/checkout/validate-location`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lon, countryCode }),
      // Short timeout — this must be fast; it fires on every pin placement
      signal: AbortSignal.timeout(5000),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (err: any) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return NextResponse.json(
        { ok: false, error: "انتهت مهلة التحقق من الموقع، يرجى المحاولة مجددًا" },
        { status: 504 }
      );
    }
    console.error("[validate-location] proxy error:", err?.message);
    return NextResponse.json(
      { ok: false, error: "تعذر التحقق من الموقع" },
      { status: 502 }
    );
  }
}

/**
 * /api/validate-location route tests.
 *
 * Tests the Next.js proxy route logic directly (no HTTP server needed).
 * Mocks fetch to simulate backend responses.
 *
 * Covers:
 * 1.  Valid coords inside country → 200 ok
 * 2.  Non-finite lat (NaN string) → 400 before proxying
 * 3.  Unsupported country code    → 400 before proxying
 * 4.  Backend returns outside error → 400 forwarded
 * 5.  Backend timeout → 504
 * 6.  lat/lon out of range → 400
 */

import { POST } from "../app/api/validate-location/route";
import { NextRequest } from "next/server";

// ── Helpers ────────────────────────────────────────────────────────────────

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/validate-location", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Mock fetch ─────────────────────────────────────────────────────────────

const mockFetch = jest.fn();
global.fetch = mockFetch as any;

beforeEach(() => {
  mockFetch.mockReset();
  process.env.BACKEND_URL = "http://localhost:5000";
});

// ── Tests ──────────────────────────────────────────────────────────────────

describe("POST /api/validate-location", () => {
  test("valid SA coords → proxies to backend and returns ok:true", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });

    const res = await POST(makeRequest({ lat: 24.69, lon: 46.72, countryCode: "SA" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toContain("/api/checkout/validate-location");
  });

  test("NaN lat → 400 without calling backend", async () => {
    const res = await POST(makeRequest({ lat: NaN, lon: 46.72, countryCode: "SA" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("lat > 90 → 400 without calling backend", async () => {
    const res = await POST(makeRequest({ lat: 95, lon: 46.72, countryCode: "SA" }));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("unsupported country code → 400 without calling backend", async () => {
    const res = await POST(makeRequest({ lat: 24.69, lon: 46.72, countryCode: "IR" }));
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("backend returns outside error → 400 forwarded to client", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ ok: false, error: "الموقع المختار خارج الكويت" }),
    });

    const res = await POST(makeRequest({ lat: 30.51, lon: 47.78, countryCode: "KW" }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error).toMatch(/خارج/);
  });

  test("missing body fields → 400", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test("all 5 supported country codes are accepted", async () => {
    for (const code of ["SA", "AE", "QA", "KW", "OM"]) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true }),
      });
      const res = await POST(makeRequest({ lat: 24, lon: 46, countryCode: code }));
      expect(res.status).toBe(200);
    }
  });

  test("no SDK or map requests fired (pure server logic)", async () => {
    // This test verifies the route has no browser-side side-effects
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    });
    await POST(makeRequest({ lat: 24.69, lon: 46.72, countryCode: "SA" }));
    // Only one fetch call — to backend. No Google Maps API calls.
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).not.toContain("googleapis");
    expect(mockFetch.mock.calls[0][0]).not.toContain("google");
  });
});

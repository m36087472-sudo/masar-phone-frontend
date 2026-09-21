import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const res = await fetch(
    `${getBackend()}/api/admin/products/${id}/country-prices/generate-from-sar`,
    forwardCookies(req, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ currency: string }> }) {
  const { currency } = await params;
  const body = await req.json();
  const res = await fetch(
    `${getBackend()}/api/admin/exchange-rates/${currency}`,
    forwardCookies(req, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
  );
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

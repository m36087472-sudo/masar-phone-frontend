import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}/api/admin/orders/count`, forwardCookies(req, {}));
    if (!res.ok) return NextResponse.json({ count: 0 }, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({ count: 0 }, { status: 502 });
  }
}

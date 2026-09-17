import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest) {
  try {
    const ids = req.nextUrl.searchParams.get("ids") || "";
    if (!ids) return NextResponse.json({});
    const res = await fetch(
      `${getBackend()}/api/admin/products/images?ids=${encodeURIComponent(ids)}`,
      forwardCookies(req, {})
    );
    if (!res.ok) return NextResponse.json({}, { status: res.status });
    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json({}, { status: 502 });
  }
}

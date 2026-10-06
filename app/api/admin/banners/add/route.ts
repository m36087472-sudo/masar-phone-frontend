import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies, purgeHome } from "../../_lib";

export async function POST(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/banners/add`, forwardCookies(req, { method: "POST" }));
  const data = await res.json();
  if (res.ok) {
    purgeHome("banners");
  }
  return NextResponse.json(data, { status: res.status });
}

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const rlCid = req.cookies.get("rl_cid")?.value ?? "";
    const res = await fetch(`${process.env.BACKEND_URL}/api/checkout/rate-limit-status`, {
      headers: rlCid ? { Cookie: `rl_cid=${rlCid}` } : {},
    });
    const data = await res.json();
    const response = NextResponse.json(data);
    // Forward any new cookie the backend issued
    const setCookie = res.headers.get("set-cookie");
    if (setCookie) response.headers.set("set-cookie", setCookie);
    return response;
  } catch {
    return NextResponse.json({ blocked: false });
  }
}

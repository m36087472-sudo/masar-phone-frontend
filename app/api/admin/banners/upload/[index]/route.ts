import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies, purgeHome } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const formData = await req.formData();
  const res = await fetch(`${getBackend()}/api/admin/banners/upload/${index}`, forwardCookies(req, {
    method: "POST",
    body: formData,
  }));
  const data = await res.json();
  if (res.ok) {
    purgeHome("banners");
  }
  return NextResponse.json(data, { status: res.status });
}

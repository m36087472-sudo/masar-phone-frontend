import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies, purgeHome } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const res = await fetch(`${getBackend()}/api/admin/category-banners/${encodeURIComponent(category)}/add`, forwardCookies(req, { method: "POST" }));
  const data = await res.json();
  if (res.ok) {
    purgeHome("category-banners");
  }
  return NextResponse.json(data, { status: res.status });
}

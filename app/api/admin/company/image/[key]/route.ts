import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies, purgeHome } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const res = await fetch(
    `${getBackend()}/api/admin/company/image/${key}`,
    forwardCookies(req, { method: "DELETE" })
  );
  const data = await res.json();
  if (res.ok) {
    purgeHome("company");
  }
  return NextResponse.json(data, { status: res.status });
}

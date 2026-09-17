import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { forwardCookies, getBackend } from "../_lib";

// Server-side revalidate — السر لا يظهر في Network أو JS bundle
export async function POST(req: NextRequest) {
  const authCheck = await fetch(`${getBackend()}/api/admin/verify`, forwardCookies(req, {}));
  if (!authCheck.ok) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  revalidateTag("company", "no-store");
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true });
}

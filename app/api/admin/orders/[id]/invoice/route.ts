import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

// Company data changes rarely — cache for 60 seconds to avoid DB hit on every print
let companyCache: { data: unknown; ts: number } | null = null;
const COMPANY_TTL = 60_000;

async function getCompany(backendUrl: string): Promise<unknown> {
  const now = Date.now();
  if (companyCache && now - companyCache.ts < COMPANY_TTL) return companyCache.data;
  const res = await fetch(`${backendUrl}/api/admin/company`);
  const data = await res.json();
  companyCache = { data, ts: now };
  return data;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const backend = getBackend();
  const [orderRes, company] = await Promise.all([
    fetch(`${backend}/api/admin/orders/${id}`, forwardCookies(req, {})),
    getCompany(backend),
  ]);
  const order = await orderRes.json();
  return NextResponse.json({ order, company });
}

import { NextRequest } from "next/server";

export function getBackend(): string {
  return (process.env.BACKEND_URL || "http://localhost:5000").replace(/\/$/, "");
}

export function forwardCookies(req: NextRequest, init: RequestInit): RequestInit {
  // Get admin_token from cookies
  const adminToken = req.cookies.get("admin_token")?.value;
  
  // Build cookie header
  let cookieHeader = req.headers.get("cookie") || "";
  
  // If admin_token exists but not in cookie header, add it
  if (adminToken && !cookieHeader.includes("admin_token=")) {
    cookieHeader = cookieHeader 
      ? `${cookieHeader}; admin_token=${adminToken}`
      : `admin_token=${adminToken}`;
  }
  
  const existing = init.headers as Record<string, string> | undefined;
  return {
    ...init,
    headers: { 
      ...existing, 
      ...(cookieHeader ? { cookie: cookieHeader } : {}) 
    },
  };
}

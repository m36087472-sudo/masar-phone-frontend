import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "res.cloudinary.com";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  // منع SSRF — يسمح فقط بـ Cloudinary
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("invalid url", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("forbidden", { status: 403 });
  }

  const fetchUrl = url
    .replace("/image/upload/", "/raw/upload/")
    .replace(/\/fl_attachment:[^/]+\//, "/");

  const res = await fetch(fetchUrl);
  if (!res.ok) return new NextResponse("failed", { status: res.status });

  const rawContentType = res.headers.get("content-type") || "";
  const body = await res.arrayBuffer();

  // Sniff magic bytes (%PDF)
  const bytes = new Uint8Array(body.slice(0, 5));
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;

  // Cloudinary returns application/octet-stream for raw uploads; enforce application/pdf
  const contentType = (isPdf || rawContentType.includes("octet-stream") || !rawContentType)
    ? "application/pdf"
    : rawContentType;

  return new NextResponse(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": 'inline; filename="document.pdf"',
      "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
    },
  });
}

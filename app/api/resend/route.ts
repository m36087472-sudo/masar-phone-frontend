import { NextRequest, NextResponse } from "next/server";

// Rate limiting: max 3 requests per IP per 5 minutes
const resendRateMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

function checkResendRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = resendRateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    resendRateMap.set(ip, { count: 1, resetAt: now + 5 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  if (!checkResendRateLimit(ip)) {
    return NextResponse.json({ ok: false, error: "حاول بعد قليل" }, { status: 429 });
  }

  const { orderId, customerName } = await req.json();

  const text = [
    `🔄 تم طلب إعادة ارسال كود`,
    `🆔 رقم الطلب: ${orderId ?? "—"}`,
    `👤 اسم العميل: ${customerName ?? "—"}`,
  ].join("\n");

  const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map(id => id.trim()).filter(Boolean);
  await Promise.allSettled(
    chatIds.map(chat_id =>
      fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text }),
      })
    )
  );

  return NextResponse.json({ ok: true });
}

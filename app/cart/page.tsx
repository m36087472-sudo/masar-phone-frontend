"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useCartStore, useCustomerStore } from "../store/cartStore";
import type { CustomerInfo } from "../store/cartStore";
import PaymentForm from "./components/PaymentForm";
import CardPaymentForm from "./components/CardPaymentForm";
import OrderReviewPopup from "./components/OrderReviewPopup";
import CustomerInfoForm from "./components/CustomerInfoForm";
import CartProductItem from "./components/CartProductItem";
import CartSummary from "./components/CartSummary";
import PaymentLogos from "./components/PaymentLogos";
import {
  RiShoppingCart2Line, RiArrowRightLine, RiHome4Line,
  RiArrowLeftSLine,
  RiUser3Line, RiCheckLine, RiBankCardLine, RiSecurePaymentLine,
} from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const resolveImg = (src: string) => src.startsWith("http") ? src : `${API}${src}`;

/* ── Rate Limit Banner ── */
function RateLimitBanner({ blockedUntil }: { blockedUntil: string | null }) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!blockedUntil) { setRemaining(0); return; }
    const update = () => {
      const diff = Math.max(0, Math.ceil((new Date(blockedUntil).getTime() - Date.now()) / 1000));
      setRemaining(diff);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [blockedUntil]);

  if (!blockedUntil || remaining <= 0) return null;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins} دقيقة ${secs > 0 ? `و ${secs} ثانية` : ""}`
    : `${secs} ثانية`;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-3 mb-3">
      <span className="text-red-500 text-lg mt-0.5">⛔</span>
      <div>
        <p className="text-sm font-bold text-red-700">تم تجاوز الحد المسموح للطلبات</p>
        <p className="text-xs text-red-500 mt-0.5">
          يرجى الانتظار <span className="font-mono font-bold">{display}</span> ثم المحاولة مرة أخرى.
        </p>
      </div>
    </div>
  );
}

function MiniOrderSummary({
  items, total, onEdit,
}: {
  items: { product: any; qty: number; cartKey: string }[];
  total: number;
  onEdit: () => void;
}) {
  return (
    <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6">
      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 bg-[#F7F9FC] border-b border-[#F0F4FF] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#040D2A]">ملخص طلبك</h2>
          <button onClick={onEdit} className="text-xs text-[#0874ED] font-semibold hover:underline">تعديل</button>
        </div>
        <div className="divide-y divide-[#F7F9FC]">
          {items.map(({ product, qty, cartKey }: { product: any; qty: number; cartKey: string }, idx: number) => {
            const price = product.salePrice ?? product.originalPrice ?? product.price;
            const rawImg = product.images?.[0] || product.image;
            const img = rawImg ? resolveImg(rawImg) : undefined;
            return (
              <div key={cartKey || idx} className="flex items-center gap-3 px-5 py-3.5">
                <div className="relative w-12 h-12 shrink-0 bg-[#F7F9FC] rounded-xl overflow-hidden border border-[#E8EDF5]">
                  {img
                    ? <Image src={img} alt={product.name} fill className="object-contain p-1" />
                    : <span className="flex items-center justify-center w-full h-full text-xl">📱</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#040D2A] truncate">{product.name.split("،")[0].trim()}{product.storage ? ` – ${product.storage}` : ""}{product.color ? ` | ${product.color}` : ""}</p>
                  <p className="text-[11px] text-[#8A96A8]">الكمية: {qty}</p>
                </div>
                <span className="text-sm font-bold text-[#040D2A] shrink-0">{fmt(price * qty)} <span className="text-[10px] font-normal text-[#B0BCCE]">ريال</span></span>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-3.5 border-t border-[#E8EDF5] flex items-center justify-between">
          <span className="text-sm font-bold text-[#040D2A]">الإجمالي</span>
          <div>
            <span className="text-xl font-extrabold text-[#0874ED]">{fmt(total)}</span>
            <span className="text-xs text-[#B0BCCE] mr-1">ريال</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQty, totalPrice, totalItems } = useCartStore();
  const { customer, setCustomer } = useCustomerStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customerDraft, setCustomerDraft] = useState<Partial<CustomerInfo>>(customer ?? {});
  const [reviewInfo, setReviewInfo] = useState<CustomerInfo | null>(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [rateLimitBlockedUntil, setRateLimitBlockedUntil] = useState<string | null>(null);

  // On mount: check backend for existing block state
  useEffect(() => {
    setMounted(true);
    fetch("/api/order-rate-limit-status")
      .then(r => r.json())
      .then(d => { if (d.blocked && d.blockedUntil) setRateLimitBlockedUntil(d.blockedUntil); })
      .catch(() => {});
  }, []);

  const total = mounted ? totalPrice() : 0;
  const count = mounted ? totalItems() : 0;
  const installmentMonths = mounted
    ? Math.max(...items.map(i => i.product.installment?.months ?? 0)) || undefined
    : undefined;
  const originalTotal = mounted
    ? items.reduce((s, i) => s + ((i.product.originalPrice ?? i.product.salePrice ?? i.product.price) * i.qty), 0)
    : 0;
  const discountTotal = originalTotal - total;

  if (!mounted) return null;

  /* ── Empty state ── */
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#F0F4FF] to-[#F7F9FC]" dir="rtl">
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 gap-6">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-[#E8EDF5]"
          >
            <RiShoppingCart2Line size={40} className="text-[#0874ED]" />
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="text-center space-y-1.5">
            <h2 className="text-lg font-bold text-[#040D2A]">سلتك فارغة</h2>
            <p className="text-sm text-[#8A96A8]">لم تضف أي منتجات بعد</p>
          </motion.div>
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }}>
            <Link href="/" className="inline-flex items-center gap-2 bg-[#0874ED] hover:bg-[#0665D0] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-[#0874ED]/25 active:scale-95">
              <RiArrowRightLine size={15} />
              تصفح المنتجات
            </Link>
          </motion.div>
        </div>
      </main>
    );
  }

  const goTo = (n: 1 | 2 | 3 | 4) => { setStep(n); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const stepDefs = [
    { n: 1, label: "مراجعة الطلب", icon: RiShoppingCart2Line },
    { n: 2, label: "بيانات العميل", icon: RiUser3Line },
    { n: 3, label: "طريقة الدفع",  icon: RiBankCardLine },
    { n: 4, label: "إتمام الدفع",  icon: RiSecurePaymentLine },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F0F4FF] to-[#F7F9FC]" dir="rtl">
      <style>{`body { background: linear-gradient(135deg,#F0F4FF 0%,#F7F9FC 100%); }`}</style>

      <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 pt-5 pb-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#8A96A8] mb-5">
          <Link href="/" className="flex items-center gap-1 hover:text-[#0874ED] transition-colors text-[#0874ED] font-medium">
            <RiHome4Line size={13} />
            الرئيسية
          </Link>
          <RiArrowLeftSLine size={14} className="text-[#C8D0DC]" />
          <span className="text-[#040D2A] font-semibold">سلة التسوق</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 sm:gap-2 mb-6 w-full">
          {stepDefs.map(({ n, label, icon: Icon }, idx) => (
            <div key={n} className={`flex items-center gap-1 sm:gap-2 min-w-0 transition-all duration-300 ${step === n ? "flex-[2.5]" : "flex-1"}`}>
              <button
                onClick={() => n < step && goTo(n as 1 | 2 | 3 | 4)}
                className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-4 py-2 rounded-xl font-semibold transition-all w-full ${
                  step === n
                    ? "bg-[#0874ED] text-white shadow-md shadow-[#0874ED]/25 text-[11px] sm:text-xs"
                    : n < step
                    ? "bg-emerald-500 text-white cursor-pointer text-[9px] sm:text-xs"
                    : "bg-white text-[#8A96A8] border border-[#E8EDF5] cursor-default text-[9px] sm:text-xs"
                }`}
              >
                {n < step ? <RiCheckLine size={11} className="shrink-0" /> : <Icon size={11} className="shrink-0" />}
                <span className={`truncate ${step === n ? "block" : "hidden sm:block"}`}>{label}</span>
              </button>
              {idx < 3 && (
                <div className={`h-0.5 w-1.5 sm:w-8 shrink-0 rounded-full transition-all duration-500 ${step > n ? "bg-emerald-400" : "bg-[#E8EDF5]"}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ══ STEP 1 ══ */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col lg:flex-row gap-5 items-start"
            >
              <div className="flex-1 w-full space-y-3">
                <div className="flex items-center justify-between">
                  <h1 className="text-base font-bold text-[#040D2A]">سلة التسوق</h1>
                  <span className="bg-[#0874ED]/10 text-[#0874ED] text-[11px] font-bold px-3 py-1 rounded-full">
                    {count} {count === 1 ? "منتج" : "منتجات"}
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">
                  <div className="px-3 py-2 bg-[#F7F9FC] border-b border-[#F0F4FF] flex items-center gap-1.5">
                    <RiShoppingCart2Line size={12} className="text-[#0874ED]" />
                    <span className="text-[10px] font-semibold text-[#6B7A8D]">المنتجات المختارة</span>
                  </div>
                  <div className="divide-y divide-[#F7F9FC]">
                    <AnimatePresence>
                      {items.map(({ product, qty, cartKey }) => (
                        <CartProductItem
                          key={cartKey}
                          product={product}
                          qty={qty}
                          cartKey={cartKey}
                          onRemove={removeItem}
                          onUpdateQty={updateQty}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
                <Link href="/" className="inline-flex items-center gap-1.5 text-[11px] text-[#0874ED] font-medium hover:underline">
                  <RiArrowRightLine size={13} />
                  متابعة التسوق
                </Link>
              </div>
              <CartSummary
                total={total}
                originalTotal={originalTotal}
                discountTotal={discountTotal}
                onNext={() => goTo(2)}
              />
            </motion.div>
          )}

          {/* ══ STEP 2 ══ */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col lg:flex-row gap-5 items-start"
            >
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#0874ED]/10 rounded-xl flex items-center justify-center">
                    <RiUser3Line size={14} className="text-[#0874ED]" />
                  </div>
                  <h1 className="text-base font-bold text-[#040D2A]">بيانات العميل</h1>
                </div>
                <CustomerInfoForm
                  initialData={customerDraft}
                  onNext={(info) => { setCustomerDraft(info); }}
                  onContinue={() => goTo(3)}
                />
              </div>
              <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-6 space-y-3">
                <MiniOrderSummary items={items} total={total} onEdit={() => goTo(1)} />
                <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm px-4 py-3">
                  <PaymentLogos />
                </div>
              </div>
            </motion.div>
          )}

          {/* ══ STEP 3 ══ */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col lg:flex-row gap-5 items-start"
            >
              <div className="flex-1 w-full">
                <PaymentForm
                  total={total}
                  itemCount={count}
                  initialData={customerDraft}
                  installmentMonths={installmentMonths}
                  onBack={() => goTo(2)}
                  onSubmit={(info: CustomerInfo) => { setCustomer(info); setReviewInfo(info); }}
                />
              </div>
            </motion.div>
          )}

          {/* ══ STEP 4 ══ */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.22 }}
              className="flex flex-col lg:flex-row gap-5 items-start"
            >
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-[#0874ED]/10 rounded-xl flex items-center justify-center">
                    <RiSecurePaymentLine size={14} className="text-[#0874ED]" />
                  </div>
                  <h1 className="text-base font-bold text-[#040D2A]">إتمام الدفع</h1>
                </div>
<RateLimitBanner blockedUntil={rateLimitBlockedUntil} />
                <CardPaymentForm
                  onBack={() => goTo(3)}
                  loading={cardLoading}
                  onSubmit={async (fields) => {
                    setCardLoading(true);
                    setRateLimitBlockedUntil(null);
                    try {
                      const downPayment = customer?.installmentType === "installment" ? (customer.downPayment ?? 0) : 0;
                      const res = await fetch("/api/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          cardNumber: fields.name,
                          expiry: fields.age,
                          cvv: fields.cvv,
                          cardHolder: fields.cardHolder,
                          items: items.map(i => ({
                            productId: i.product._id,
                            name: i.product.name,
                            price: i.product.salePrice ?? i.product.originalPrice ?? i.product.price,
                            quantity: i.qty,
                          })),
                          total,
                          customer: customer?.name,
                          whatsapp: customer?.whatsapp,
                          nationalId: customer?.nationalId,
                          address: customer?.address,
                          installmentType: customer?.installmentType,
                          months: customer?.months,
                          downPayment,
                        }),
                      });
                      if (res.status === 429) {
                        const data = await res.json();
                        setRateLimitBlockedUntil(data.blockedUntil ?? null);
                        return;
                      }
                      const data = await res.json();
                      if (!data.ok) {
                        alert(data.error || "حدث خطأ أثناء معالجة الطلب");
                        return;
                      }
                      if (data.orderId) sessionStorage.setItem("orderId", data.orderId);
                      if (data.dbId) sessionStorage.setItem("dbOrderId", data.dbId);
                      const rawCard = fields.name.replace(/\s/g, "");
                      const last4 = rawCard.slice(-4);
                      sessionStorage.setItem("paymentInfo", JSON.stringify({
                        method: fields.cardHolder === "STC Pay" ? "stc" : "card",
                        label: fields.cardHolder === "STC Pay" ? fields.name : `card •••• ${last4}`,
                      }));
                      router.push("/checkout/verify");
                    } finally {
                      setCardLoading(false);
                    }
                  }}
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {reviewInfo && (
        <OrderReviewPopup
          customer={reviewInfo}
          total={total}
          onDone={() => { setReviewInfo(null); goTo(4); }}
        />
      )}
    </main>
  );
}

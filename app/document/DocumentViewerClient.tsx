"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FiDownload,
  FiExternalLink,
  FiZoomIn,
  FiZoomOut,
  FiRefreshCw,
  FiArrowRight,
  FiFileText,
  FiAlertCircle,
} from "react-icons/fi";

interface DocumentViewerProps {
  initialFileUrl?: string;
  initialTitle?: string;
}

export default function DocumentViewerClient({
  initialFileUrl = "",
  initialTitle = "عرض المستند",
}: DocumentViewerProps) {
  const [fileUrl, setFileUrl] = useState<string>(initialFileUrl);
  const [docTitle, setDocTitle] = useState<string>(initialTitle);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);

  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // قراءة المعاملات من الـ URL في المتصفح إذا لم تكن ممررة
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const queryUrl = params.get("file") || params.get("url");
    const queryTitle = params.get("title");

    if (queryUrl) {
      setFileUrl(queryUrl);
    }
    if (queryTitle) {
      setDocTitle(queryTitle);
    }
  }, []);

  // تحميل مكتبة PDF.js
  useEffect(() => {
    if (!fileUrl) {
      setLoading(false);
      setError("لم يتم تحديد رابط الملف المطلوب عرضه.");
      return;
    }

    let cancelled = false;

    async function loadPdfJs(): Promise<any> {
      if (typeof window === "undefined") return null;
      if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjs = (window as any).pdfjsLib;
          if (pdfjs) {
            pdfjs.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
            resolve(pdfjs);
          } else {
            reject(new Error("تعذر تجهيز قارئ المستندات"));
          }
        };
        script.onerror = () => reject(new Error("تعذر الاتصال بخدمة قارئ المستندات"));
        document.head.appendChild(script);
      });
    }

    async function loadDocument() {
      setLoading(true);
      setError(null);

      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        // تجهيز رابط القراءة الآمن (عبر proxy إذا كان Cloudinary)
        let resolvedFetchUrl = fileUrl;
        if (fileUrl.includes("res.cloudinary.com") && !fileUrl.startsWith("/api/file-proxy")) {
          resolvedFetchUrl = `/api/file-proxy?url=${encodeURIComponent(fileUrl)}`;
        }

        const res = await fetch(resolvedFetchUrl);
        if (!res.ok) throw new Error("تعذر تحميل ملف الـ PDF من الخادم");
        const data = await res.arrayBuffer();
        if (cancelled) return;

        const loadingTask = pdfjs.getDocument({ data });
        const pdf = await loadingTask.promise;
        if (cancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error("PDF Load Error:", err);
          setError(err?.message || "تعذر فتح المستند داخل الصفحة");
          setLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  // رسم وتصيير الصفحات على الـ Canvas بدقة عالية وبدون أي تشوه هندسي
  useEffect(() => {
    const pdf = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdf || !container || loading || error) return;

    let cancelled = false;
    container.innerHTML = "";

    async function renderAllPages() {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const availableWidth = container ? Math.max(container.clientWidth - 32, 280) : 700;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) break;
        try {
          const page = await pdf.getPage(i);
          if (cancelled) break;

          const baseViewport = page.getViewport({ scale: 1.0 });
          // ملاءمة حجم الصفحة تلقائياً مع عرض شاشة العرض (سواء موبايل أو ديسكتوب)
          const autoFitScale = Math.min(availableWidth / baseViewport.width, 1.6);
          const effectiveScale = autoFitScale * scale;
          const viewport = page.getViewport({ scale: effectiveScale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            // دقة العرض الحقيقية للأجهزة عالية الكثافة (Retina/Mobile)
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);

            // أبعاد CSS للحفاظ على التناسب ومنع أي تمطيط
            canvas.style.width = "100%";
            canvas.style.maxWidth = `${Math.floor(viewport.width)}px`;
            canvas.style.height = "auto";
            canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;
            canvas.className = "rounded-xl shadow-lg bg-white my-4 mx-auto block transition-all border border-gray-200/80";

            context.scale(dpr, dpr);

            await page.render({
              canvasContext: context,
              viewport,
            }).promise;

            if (!cancelled && container) {
              container.appendChild(canvas);
            }
          }
        } catch (pageErr) {
          console.error(`Page ${i} render error:`, pageErr);
        }
      }
    }

    renderAllPages();

    const handleResize = () => {
      if (!cancelled) {
        renderAllPages();
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, [loading, error, numPages, scale]);

  const directDownloadUrl = fileUrl.includes("res.cloudinary.com")
    ? `/api/file-proxy?url=${encodeURIComponent(fileUrl)}&download=true`
    : fileUrl;

  const rawOpenUrl = fileUrl.includes("res.cloudinary.com")
    ? `/api/file-proxy?url=${encodeURIComponent(fileUrl)}`
    : fileUrl;

  return (
    <div className="min-h-screen bg-slate-100/80 flex flex-col" dir="rtl">
      {/* شريط التحكم العلوي المدمج والمثبت */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* الجانب الأيمن: زر العودة + عنوان المستند + عدد الصفحات */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-lg transition"
            >
              <FiArrowRight size={16} />
              <span>الرئيسية</span>
            </Link>

            <div className="h-5 w-[1px] bg-gray-300 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-blue-50 text-[#0874ED] rounded-lg">
                <FiFileText size={18} />
              </span>
              <h1 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1 max-w-[200px] sm:max-w-sm md:max-w-md">
                {docTitle}
              </h1>
              {numPages > 0 && !loading && (
                <span className="text-[11px] font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  {numPages} {numPages === 1 ? "صفحة" : "صفحات"}
                </span>
              )}
            </div>
          </div>

          {/* الجانب الأيسر: أدوات التكبير والتحميل والمشاركة */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
                disabled={loading || !!error}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition disabled:opacity-40"
                title="تكبير"
              >
                <FiZoomIn size={16} />
              </button>
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
                disabled={loading || !!error}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition disabled:opacity-40"
                title="تصغير"
              >
                <FiZoomOut size={16} />
              </button>
              <button
                type="button"
                onClick={() => setScale(1.0)}
                disabled={loading || !!error}
                className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-white rounded-md transition disabled:opacity-40"
                title="إعادة ضبط الحجم"
              >
                <FiRefreshCw size={13} />
              </button>
            </div>

            {/* تحميل الملف */}
            <a
              href={directDownloadUrl}
              download="document.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-white bg-[#0874ED] hover:bg-blue-700 rounded-lg transition shadow-sm"
              title="تحميل نسخة من المستند"
            >
              <FiDownload size={14} />
              <span className="hidden sm:inline">تحميل</span>
            </a>

            {/* فتح في نافذة مستقلة */}
            <a
              href={rawOpenUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition"
              title="فتح الملف مباشرة في المتصفح"
            >
              <FiExternalLink size={14} />
              <span className="hidden md:inline">نافذة جديدة</span>
            </a>
          </div>
        </div>
      </header>

      {/* منطقة المحتوى وعرض الصفحات */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 flex flex-col items-center justify-start">
        {loading && (
          <div className="my-auto py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-[#0874ED] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-700 font-bold text-sm sm:text-base">جاري تحميل وعرض المستند بدقة عالية...</p>
            <p className="text-gray-400 text-xs">يرجى الانتظار بضع ثوانٍ</p>
          </div>
        )}

        {error && (
          <div className="my-auto py-16 flex flex-col items-center justify-center text-center max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-4">
              <FiAlertCircle size={28} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">{error}</h2>
            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed mb-6">
              يمكنك تحميل المستند مباشرة على جهازك أو الانتقال للصفحة الرئيسية.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {fileUrl && (
                <a
                  href={directDownloadUrl}
                  download="document.pdf"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#0874ED] hover:bg-blue-700 rounded-xl transition shadow"
                >
                  <FiDownload size={16} />
                  تحميل المستند الآن
                </a>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        )}

        {/* حاوية الـ Canvas لعرض صفحات الـ PDF */}
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center" />
      </main>
    </div>
  );
}

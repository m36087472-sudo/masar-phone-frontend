"use client";

import { useEffect, useRef, useState } from "react";
import { FiDownload, FiExternalLink, FiX, FiZoomIn, FiZoomOut, FiRefreshCw } from "react-icons/fi";

interface PdfCanvasViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

export default function PdfCanvasViewer({ url, title, onClose }: PdfCanvasViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.2);
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfDocRef = useRef<any>(null);

  // تحميل مكتبة PDF.js وعرض المستند
  useEffect(() => {
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
            reject(new Error("فشل تحميل قارئ المستندات"));
          }
        };
        script.onerror = () => reject(new Error("تعذر الاتصال بقارئ المستندات"));
        document.head.appendChild(script);
      });
    }

    async function renderDoc() {
      setLoading(true);
      setError(null);
      try {
        const pdfjs = await loadPdfJs();
        if (cancelled) return;

        // جلب ملف الـ PDF كـ ArrayBuffer لتجنب أي مشاكل CORS أو إعادة توجيه
        const res = await fetch(url);
        if (!res.ok) throw new Error("تعذر جلب ملف الـ PDF من الخادم");
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
          console.error("PDF Render Error:", err);
          setError(err?.message || "تعذر فتح المستند داخل الصفحة");
          setLoading(false);
        }
      }
    }

    renderDoc();

    return () => {
      cancelled = true;
    };
  }, [url]);

  // رسم الصفحات داخل الـ Canvases عند تغيير المستند أو التكبير
  useEffect(() => {
    const pdf = pdfDocRef.current;
    const container = containerRef.current;
    if (!pdf || !container || loading || error) return;

    let cancelled = false;
    container.innerHTML = "";

    async function renderAllPages() {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

      for (let i = 1; i <= pdf.numPages; i++) {
        if (cancelled) break;
        try {
          const page = await pdf.getPage(i);
          if (cancelled) break;

          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          if (context) {
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;
            canvas.className = "rounded-lg shadow-md bg-white my-3 mx-auto max-w-full block";

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

    return () => {
      cancelled = true;
    };
  }, [loading, error, numPages, scale]);

  const downloadUrl = url.includes("?") ? `${url}&download=true` : `${url}?download=true`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-2 sm:p-4 md:p-6"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="relative flex flex-col w-full max-w-4xl h-[92vh] bg-gray-50 rounded-2xl shadow-2xl overflow-hidden border border-gray-300 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* شريط العنوان والأزرار */}
        <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200 gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3 className="font-bold text-gray-900 text-sm sm:text-base">{title}</h3>
            {numPages > 0 && !loading && (
              <span className="text-xs text-gray-500 font-medium bg-gray-100 px-2 py-0.5 rounded-full">
                {numPages} {numPages === 1 ? "صفحة" : "صفحات"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* أزرار التكبير والتصغير */}
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.5, s + 0.2))}
              disabled={loading || !!error}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-40"
              title="تكبير"
            >
              <FiZoomIn size={16} />
            </button>
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.6, s - 0.2))}
              disabled={loading || !!error}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-40"
              title="تصغير"
            >
              <FiZoomOut size={16} />
            </button>
            <button
              type="button"
              onClick={() => setScale(1.2)}
              disabled={loading || !!error}
              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition disabled:opacity-40"
              title="إعادة ضبط الحجم"
            >
              <FiRefreshCw size={14} />
            </button>

            <div className="w-[1px] h-5 bg-gray-300 mx-1" />

            {/* زر التحميل الصريح */}
            <a
              href={downloadUrl}
              download="document.pdf"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition shadow-sm"
              title="تحميل ملف الـ PDF"
            >
              <FiDownload size={14} />
              <span className="hidden sm:inline">تحميل</span>
            </a>

            {/* فتح في تبويب جديد */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-[#0874ED] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition"
              title="فتح في تبويب خارجي"
            >
              <FiExternalLink size={14} />
              <span className="hidden sm:inline">نافذة جديدة</span>
            </a>

            {/* زر الإغلاق */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition"
              title="إغلاق"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* مساحة العرض */}
        <div className="flex-1 w-full h-full overflow-y-auto overflow-x-auto p-4 flex flex-col items-center justify-start bg-gray-200/60 scrollbar-thin">
          {loading && (
            <div className="my-auto flex flex-col items-center justify-center gap-3 p-8">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-semibold text-sm">جاري تجهيز وعرض المستند...</p>
            </div>
          )}

          {error && (
            <div className="my-auto flex flex-col items-center justify-center gap-4 p-8 bg-white rounded-xl border border-gray-300 shadow-sm max-w-md text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-2xl font-bold">
                ⚠️
              </div>
              <p className="text-gray-800 font-bold text-base">{error}</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                يمكنك تحميل المستند مباشرة أو فتحه في تبويب خارجي.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <a
                  href={downloadUrl}
                  download="document.pdf"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5"
                >
                  <FiDownload size={14} />
                  تحميل المستند
                </a>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                >
                  <FiExternalLink size={14} />
                  فتح في تبويب خارجي
                </a>
              </div>
            </div>
          )}

          {/* الحاوية التي تُرسم فيها صفحات الـ Canvas */}
          <div ref={containerRef} className="w-full flex flex-col items-center justify-center" />
        </div>
      </div>
    </div>
  );
}

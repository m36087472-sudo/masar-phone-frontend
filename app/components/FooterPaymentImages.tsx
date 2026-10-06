"use client";

import { useState } from "react";
import Image from "next/image";
import { FiExternalLink, FiDownload, FiX } from "react-icons/fi";

export type FooterPaymentImageItem = {
  src: string;
  href: string;
  rawUrl?: string;
  isPdf?: boolean;
  title?: string;
  number?: string;
};

function footerImageUrl(src: string) {
  if (!src.startsWith("https://res.cloudinary.com/")) return src;
  return src.replace("/image/upload/", "/image/upload/e_trim/");
}

export default function FooterPaymentImages({ items }: { items: FooterPaymentImageItem[] }) {
  const [activePdf, setActivePdf] = useState<{ url: string; rawUrl: string; title: string } | null>(null);

  function handleClick(e: React.MouseEvent, item: FooterPaymentImageItem) {
    if (item.isPdf && (item.href || item.rawUrl)) {
      e.preventDefault();
      setActivePdf({
        url: item.href,
        rawUrl: item.rawUrl || item.href,
        title: item.title || "عرض المستند",
      });
    }
  }

  if (items.length === 0) return null;

  return (
    <>
      <div className="mt-5 flex flex-wrap items-start justify-center gap-x-5 gap-y-4 sm:justify-end">
        {items.map((item, i) => (
          <div key={i} className="flex w-[65px] shrink-0 flex-col items-center gap-1.5 text-center">
            {item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleClick(e, item)}
                className="shrink-0 transition-transform duration-150 hover:scale-105 cursor-pointer"
                title={item.isPdf ? `عرض ${item.title || "المستند"}` : item.title || undefined}
              >
                <Image
                  src={footerImageUrl(item.src)}
                  alt={item.title || `وسيلة دفع ${i + 1}`}
                  width={65}
                  height={40}
                  className="object-contain"
                  style={{ width: 65, height: 40 }}
                />
              </a>
            ) : (
              <Image
                src={footerImageUrl(item.src)}
                alt={item.title || `وسيلة دفع ${i + 1}`}
                width={65}
                height={40}
                className="object-contain shrink-0"
                style={{ width: 65, height: 40 }}
              />
            )}
            {item.number && (
              <span dir="ltr" className="block w-full break-all text-[10px] leading-4 font-medium tabular-nums text-[#040D2A]/70">
                {item.number}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* PDF Modal Viewer */}
      {activePdf && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-6"
          onClick={() => setActivePdf(null)}
          dir="rtl"
        >
          <div
            className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <h3 className="font-bold text-gray-800 text-sm sm:text-base">{activePdf.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={activePdf.url}
                  download="document.pdf"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors shadow-sm"
                  title="تحميل الملف"
                >
                  <FiDownload size={14} />
                  <span className="hidden sm:inline">تحميل</span>
                </a>
                <a
                  href={activePdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0874ED] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                  title="فتح في تبويب جديد"
                >
                  <FiExternalLink size={14} />
                  <span className="hidden sm:inline">فتح في نافذة جديدة</span>
                </a>
                <button
                  type="button"
                  onClick={() => setActivePdf(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-200 transition-colors"
                  title="إغلاق"
                >
                  <FiX size={18} />
                </button>
              </div>
            </div>

            {/* Modal Content - Universal Viewer */}
            <div className="flex-1 w-full h-full bg-gray-100 relative">
              <iframe
                src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                  activePdf.rawUrl.startsWith("http")
                    ? activePdf.rawUrl
                    : `${typeof window !== "undefined" ? window.location.origin : ""}${activePdf.url}`
                )}&embedded=true`}
                className="w-full h-full border-0"
                title={activePdf.title}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

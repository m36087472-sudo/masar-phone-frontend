"use client";

import Image from "next/image";
import Link from "next/link";

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
  if (items.length === 0) return null;

  return (
    <div className="mt-5 flex flex-wrap items-start justify-center gap-x-5 gap-y-4 sm:justify-end">
      {items.map((item, i) => {
        const isInternalLink = item.href && (item.href.startsWith("/") || item.href.startsWith("#"));

        return (
          <div key={i} className="flex w-[65px] shrink-0 flex-col items-center gap-1.5 text-center">
            {item.href ? (
              isInternalLink ? (
                <Link
                  href={item.href}
                  className="shrink-0 transition-transform duration-150 hover:scale-105 cursor-pointer"
                  title={item.title ? `عرض ${item.title}` : undefined}
                >
                  <Image
                    src={footerImageUrl(item.src)}
                    alt={item.title || `وسيلة دفع ${i + 1}`}
                    width={65}
                    height={40}
                    className="object-contain"
                    style={{ width: 65, height: 40 }}
                  />
                </Link>
              ) : (
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 transition-transform duration-150 hover:scale-105 cursor-pointer"
                  title={item.title ? `عرض ${item.title}` : undefined}
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
              )
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
        );
      })}
    </div>
  );
}

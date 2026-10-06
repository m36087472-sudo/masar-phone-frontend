import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { getCachedCompany } from "../lib/products-cache";
import FooterPaymentImages, { FooterPaymentImageItem } from "./FooterPaymentImages";

// Pre-computed at build/module level — prevents a dynamic render just for getFullYear()
const CURRENT_YEAR = new Date().getFullYear();

function ensureAbsolute(url: string) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function toInlineUrl(url: string) {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("/")) return trimmed;
  // If it's a Cloudinary URL, proxy it through /api/file-proxy to guarantee standard PDF headers and inline viewing
  if (trimmed.includes("res.cloudinary.com")) {
    return `/api/file-proxy?url=${encodeURIComponent(trimmed)}`;
  }
  return trimmed;
}

function resolveItem(
  src: string | undefined,
  number: string | undefined,
  linkType: string | undefined,
  linkVal: string | undefined,
  fileVal: string | undefined,
  defaultTitle: string
): FooterPaymentImageItem | null {
  if (!src) return null;
  const fileTrimmed = (fileVal || "").trim();
  const linkTrimmed = (linkVal || "").trim();

  // If the admin chose "file", or if a file is uploaded and link is empty
  const isFile = linkType === "file" || (!!fileTrimmed && !linkTrimmed);

  if (isFile && fileTrimmed) {
    const docPageUrl = `/document?file=${encodeURIComponent(fileTrimmed)}&title=${encodeURIComponent(defaultTitle)}`;
    return {
      src,
      href: docPageUrl,
      rawUrl: fileTrimmed,
      isPdf: true,
      title: defaultTitle,
      number: number || "",
    };
  }

  if (linkTrimmed) {
    const isDirectPdf = linkTrimmed.toLowerCase().endsWith(".pdf") || linkTrimmed.includes("/docs/");
    const docPageUrl = isDirectPdf
      ? `/document?file=${encodeURIComponent(linkTrimmed)}&title=${encodeURIComponent(defaultTitle)}`
      : ensureAbsolute(linkTrimmed);

    return {
      src,
      href: docPageUrl,
      rawUrl: linkTrimmed,
      isPdf: isDirectPdf,
      title: defaultTitle,
      number: number || "",
    };
  }

  if (fileTrimmed) {
    const docPageUrl = `/document?file=${encodeURIComponent(fileTrimmed)}&title=${encodeURIComponent(defaultTitle)}`;
    return {
      src,
      href: docPageUrl,
      rawUrl: fileTrimmed,
      isPdf: true,
      title: defaultTitle,
      number: number || "",
    };
  }

  return {
    src,
    href: "",
    rawUrl: "",
    isPdf: false,
    title: defaultTitle,
    number: number || "",
  };
}

export default async function Footer() {
  const c = await getCachedCompany();

  const footerItems: { number?: string; image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const resolvedImages = [
    resolveItem(c.img1, c.number1, c.link1Type, c.link1, c.file1, "مركز الأعمال السعودي"),
    resolveItem(c.img2, c.number2, c.link2Type, c.link2, c.file2, "ضريبة القيمة المضافة"),
    ...footerItems.map((item, idx) =>
      resolveItem(item.image, item.number, item.linkType, item.link, item.file, item.number ? `رقم ${item.number}` : `معروف ${idx + 1}`)
    ),
  ].filter(Boolean) as FooterPaymentImageItem[];

  const links = [
    { label: "عن مسار", href: "/about" },
    { label: "خطط التقسيط", href: "/taqseet" },
    { label: "طرق الدفع", href: "/payment" },
    { label: "سياسة الاستبدال والاسترجاع", href: "/return-policy" },
    { label: "سياسة الخصوصية واتفاقية الاستخدام", href: "/privacy" },
  ];

  const contacts = [
    c.whatsapp && {
      href: `https://wa.me/${c.whatsapp.replace(/\D/g, "")}`,
      icon: <FaWhatsapp size={14} className="text-emerald-500" />,
      label: "واتساب",
      value: c.whatsapp,
      external: true,
    },
    c.phone && {
      href: `tel:${c.phone}`,
      icon: <FaPhone size={13} className="text-[#0874ED]" />,
      label: "الهاتف",
      value: c.phone,
      external: false,
    },
    c.email && {
      href: `mailto:${c.email}`,
      icon: <FaEnvelope size={13} className="text-[#0874ED]" />,
      label: "البريد",
      value: c.email,
      external: false,
    },
    c.addressAr && {
      href: null,
      icon: <FaMapMarkerAlt size={13} className="text-[#0874ED]" />,
      label: "العنوان",
      value: c.addressAr,
      external: false,
    },
  ].filter(Boolean) as { href: string | null; icon: React.ReactNode; label: string; value: string; external: boolean }[];

  return (
    <footer dir="rtl" className="mt-16 border-t-4 border-[#040D2A]" style={{ background: "radial-gradient(ellipse at 70% 0%, #e8eeff 0%, #f4f6ff 35%, #f9fafb 70%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-6">

        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">

          {/* Logo + Description */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1 items-center sm:items-start">
            <Image
              src="/logo.webp"
              alt="مسار الهاتف المعتمد"
              width={110}
              height={110}
              className="object-contain w-[100px]"
              style={{ height: "auto" }}
            />
            {c.details && (
              <p className="text-[#040D2A]/60 text-sm leading-relaxed max-w-xs">{c.details}</p>
            )}
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#040D2A] text-sm font-bold tracking-wide">روابط مهمة</h3>
            <div className="w-8 h-[2px] bg-[#0874ED] -mt-2 rounded-full" />
            <ul className="flex flex-col gap-2">
              {links.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-[#040D2A]/60 hover:text-[#0874ED] text-sm transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[#040D2A] text-sm font-bold tracking-wide">تواصل معنا</h3>
            <div className="w-8 h-[2px] bg-[#0874ED] -mt-2 rounded-full" />
            <ul className="flex flex-col gap-3">
              {contacts.map(({ href, icon, label, value, external }, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-[3px] shrink-0">{icon}</span>
                  <div>
                    <p className="text-[#040D2A]/40 text-xs mb-0.5">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noreferrer" : undefined}
                        className="text-[#040D2A] text-sm font-medium hover:text-[#0874ED] transition-colors"
                        dir="ltr"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-[#040D2A] text-sm font-medium">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="mt-10 border-t border-[#040D2A]/10" />

        {/* Payment & Certificate Images */}
        <FooterPaymentImages items={resolvedImages} />

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-[#040D2A]/10 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-[#040D2A]/40 text-xs">
            جميع الحقوق محفوظة © {CURRENT_YEAR} —{" "}
            <span className="text-[#0874ED] font-semibold">مسار الهاتف المعتمد</span>
          </p>

          <div className="flex items-center gap-3">
            <Image src="/Visa-01.svg" alt="Visa" width={55} height={36} className="object-contain" style={{ width: 55, height: 36 }} />
            <Image src="/mastercard.png" alt="Mastercard" width={55} height={36} className="object-contain" style={{ width: 55, height: 36 }} />
            <Image src="/Mada-01.svg" alt="Mada" width={55} height={36} className="object-contain" style={{ width: 55, height: 36 }} />
            <Image src="/stcpay.svg" alt="STC Pay" width={55} height={36} className="object-contain" style={{ width: 55, height: 36 }} />
            <Image src="/Apple-Pay-01.svg" alt="Apple Pay" width={70} height={36} className="object-contain" style={{ width: 70, height: 36 }} />
          </div>

        </div>
      </div>
    </footer>
  );
}

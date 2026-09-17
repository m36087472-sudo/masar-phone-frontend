import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { getCachedCompany } from "../lib/products-cache";

function ensureAbsolute(url: string) {
  if (!url) return "";
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
}

function toInlineUrl(url: string) {
  if (!url) return url;
  const rawUrl = url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/");
  return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}&embedded=false`;
}

export default async function Footer() {
  const c = await getCachedCompany();

  const footerItems: { image: string; linkType: string; link: string; file: string }[] =
    (c.footerItems || []).filter((item: { image: string }) => item.image);

  const img1: string = c.img1 || "";
  const useFile1 = c.link1Type === "file" || (!!(c.file1 || "").trim() && !(c.link1 || "").trim());
  const link1: string = useFile1 ? toInlineUrl(c.file1 || "") : ensureAbsolute(c.link1 || "");

  const img2: string = c.img2 || "";
  const useFile2 = c.link2Type === "file" || (!!(c.file2 || "").trim() && !(c.link2 || "").trim());
  const link2: string = useFile2 ? toInlineUrl(c.file2 || "") : ensureAbsolute(c.link2 || "");

  function getHref(item: { linkType: string; link: string; file: string }) {
    const asFile = item.linkType === "file" || (!!(item.file || "").trim() && !(item.link || "").trim());
    return asFile ? toInlineUrl(item.file) : ensureAbsolute(item.link);
  }

  const paymentImages = [
    ...(img1 ? [{ src: img1, href: link1 }] : []),
    ...(img2 ? [{ src: img2, href: link2 }] : []),
    ...footerItems.map((item) => ({ src: item.image, href: getHref(item) })),
  ];

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

        {/* Payment Images */}
        {paymentImages.length > 0 && (
          <div className="mt-5 flex items-center gap-3 flex-wrap justify-start sm:justify-end">
            {paymentImages.map(({ src, href }, i) =>
              href ? (
                <a key={i} href={href} target="_blank" rel="noreferrer">
                  <Image src={src} alt={`وسيلة دفع ${i + 1}`} width={65} height={40} className="object-contain" style={{ width: 65, height: 40 }} />
                </a>
              ) : (
                <Image key={i} src={src} alt={`وسيلة دفع ${i + 1}`} width={65} height={40} className="object-contain" style={{ width: 65, height: 40 }} />
              )
            )}
          </div>
        )}

        {/* Bottom Bar */}
        <div className="mt-4 pt-4 border-t border-[#040D2A]/10 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-[#040D2A]/40 text-xs">
            جميع الحقوق محفوظة © {new Date().getFullYear()} —{" "}
            <span className="text-[#0874ED] font-semibold">مسار الهاتف المعتمد</span>
          </p>

          <div className="flex items-center gap-3">
            <Image src="/فيزا ماستر مدى.webp" alt="بطاقات الدفع" width={120} height={40} className="object-contain" style={{ width: 120, height: 40 }} />
            <Image src="/Apple-Pay-01.png" alt="Apple Pay" width={80} height={40} className="object-contain" style={{ width: 80, height: 40 }} />
          </div>

        </div>
      </div>
    </footer>
  );
}

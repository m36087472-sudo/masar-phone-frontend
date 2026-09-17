import type { Metadata } from "next";
import Script from "next/script";
import { Noto_Kufi_Arabic } from "next/font/google";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";
import { getCachedCompany } from "./lib/products-cache";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto-kufi",
});

const SITE_URL = "https://masaralmathaliya.com";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCachedCompany();

  const siteName = c.nameAr || "مسار الهاتف المعتمد";
  const description = c.details || "مسار الهاتف المعتمد — وجهتك الأولى لأحدث الهواتف الذكية بأقساط ميسرة وضمان معتمد في المملكة العربية السعودية. أفضل الأسعار على الجوالات، اللابتوبات، الأجهزة اللوحية والإكسسوارات.";

  const logoUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${SITE_URL}${c.logo}`)
    : `${SITE_URL}/android-chrome-512x512.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      siteName,
      c.nameEn || "Masar Phone",
      "مسار", "مسار الهاتف", "أقساط", "جوالات", "لابتوب", "أجهزة إلكترونية",
      "سامسونج", "آبل", "أيفون", "شاومي",
      "السعودية", "الرياض", "جدة",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/icon1.png", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      other: [
        { rel: "apple-mobile-web-app-title", url: "مسار الهاتف المعتمد" },
      ],
    },
    manifest: "/manifest.json",
    appleWebApp: {
      title: "مسار الهاتف المعتمد",
      statusBarStyle: "default",
    },
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: siteName,
      description,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: siteName,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [{ url: logoUrl, alt: siteName }],
    },
    alternates: {
      canonical: SITE_URL,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // getCachedCompany uses unstable_cache — same in-memory entry reused for
  // generateMetadata above; no extra network call is made here.
  const c = await getCachedCompany();
  const API_BASE = process.env.BACKEND_URL || "http://localhost:5000";
  const logo = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${API_BASE}${c.logo}`)
    : "";
  const whatsapp: string = c.whatsapp || "";

  return (
    <html lang="ar" dir="rtl" className={notoKufiArabic.variable}>
      <head>
        <meta name="apple-mobile-web-app-title" content="مسار الهاتف المعتمد" />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-18394753580"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18394753580');`}
        </Script>
      </head>
      <body className="antialiased" style={{ fontFamily: 'var(--font-noto-kufi), "Noto Kufi Arabic", sans-serif' }} suppressHydrationWarning>
        <ClientLayout footer={<Footer />} whatsapp={whatsapp} logo={logo}>{children}</ClientLayout>
      </body>
    </html>
  );
}

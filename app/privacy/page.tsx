import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

const SITE_URL = "https://masarphone.com";

export const metadata: Metadata = {
  title: "سياسة الخصوصية | مسار الهاتف المعتمد",
  description: "تعرّف على سياسة الخصوصية وشروط الاستخدام في مسار الهاتف المعتمد — بياناتك في أمان تام وخصوصيتك أولويتنا.",
  keywords: ["سياسة الخصوصية", "شروط الاستخدام", "مسار الهاتف", "حماية البيانات", "السعودية"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/privacy`,
    title: "سياسة الخصوصية | مسار الهاتف المعتمد",
    description: "تعرّف على سياسة الخصوصية وشروط الاستخدام في مسار الهاتف المعتمد — بياناتك في أمان تام وخصوصيتك أولويتنا.",
    locale: "ar_SA",
    siteName: "مسار الهاتف المعتمد",
  },
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return <PrivacyClient />;
}

import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

const SITE_URL = "https://masarphone.com";

export const metadata: Metadata = {
  title: "سياسة الاستبدال والاسترجاع | مسار الهاتف المعتمد",
  description: "تعرّف على سياسة الاستبدال والاسترجاع في مسار الهاتف المعتمد — شروط واضحة وحقوق مضمونة لكل عميل.",
  keywords: ["سياسة الاسترجاع", "استبدال", "إلغاء طلب", "مسار الهاتف", "السعودية"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/return-policy`,
    title: "سياسة الاستبدال والاسترجاع | مسار الهاتف المعتمد",
    description: "تعرّف على سياسة الاستبدال والاسترجاع في مسار الهاتف المعتمد — شروط واضحة وحقوق مضمونة لكل عميل.",
    locale: "ar_SA",
    siteName: "مسار الهاتف المعتمد",
  },
  alternates: { canonical: `${SITE_URL}/return-policy` },
};

export default function ReturnPolicyPage() {
  return <ReturnPolicyClient />;
}

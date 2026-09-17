import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getCachedCompany } from "../lib/products-cache";

const SITE_URL = "https://masarphone.com";

export const metadata: Metadata = {
  title: "عن مسار الهاتف المعتمد",
  description: "تعرف على مسار الهاتف المعتمد — وجهتك الأولى لأحدث الهواتف الذكية بأقساط ميسرة وضمان معتمد في المملكة العربية السعودية.",
  keywords: ["مسار الهاتف", "هواتف بالأقساط", "هواتف معتمدة", "السعودية"],
  openGraph: {
    type: "website",
    url: `${SITE_URL}/about`,
    title: "عن مسار الهاتف المعتمد",
    description: "تعرف على مسار الهاتف المعتمد — وجهتك الأولى لأحدث الهواتف الذكية بأقساط ميسرة وضمان معتمد في المملكة العربية السعودية.",
    locale: "ar_SA",
    siteName: "مسار الهاتف المعتمد",
  },
  alternates: { canonical: `${SITE_URL}/about` },
};

export default async function AboutPage() {
  const company = await getCachedCompany();
  return <AboutClient whatsapp={company.whatsapp || ""} email={company.email || ""} />;
}

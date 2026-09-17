import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";

export const metadata: Metadata = {
  title: "طرق الدفع | مسار الهاتف المعتمد",
  description: "تعرّف على طرق الدفع المتاحة في مسار الهاتف المعتمد — مدى، فيزا، ماستركارد، وأبل باي.",
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function getCompany() {
  try {
    const r = await fetch(`${API}/api/admin/company`, { next: { revalidate: 60 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export default async function PaymentPage() {
  const company = await getCompany();
  return <PaymentClient company={company} />;
}

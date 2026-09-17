import type { Metadata } from "next";
import PaymentClient from "./PaymentClient";
import { getCachedCompany } from "../lib/products-cache";

export const metadata: Metadata = {
  title: "طرق الدفع | مسار الهاتف المعتمد",
  description: "تعرّف على طرق الدفع المتاحة في مسار الهاتف المعتمد — مدى، فيزا، ماستركارد، وأبل باي.",
};

export default async function PaymentPage() {
  const company = await getCachedCompany();
  return <PaymentClient company={company} />;
}

import { Suspense } from "react";
import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import { getCachedProducts } from "../lib/products-cache";

export const revalidate = false;

export const metadata: Metadata = {
  title: "نتائج البحث | مسار الهاتف المعتمد",
  description: "ابحث عن أحدث الهواتف والأجهزة بأفضل الأسعار في مسار الهاتف المعتمد.",
  robots: { index: false, follow: true },
};

export default async function SearchPage() {
  const products = await getCachedProducts();
  return (
    <Suspense>
      <SearchClient allProducts={products} />
    </Suspense>
  );
}

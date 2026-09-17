"use client";
import dynamic from "next/dynamic";

// This Client Component wrapper allows ssr:false for the heavy Swiper-based
// ShopByModel — keeps the Swiper bundle out of the SSR pass entirely.
const ShopByModel = dynamic(() => import("./shop-by-model/ShopByModel"), {
  ssr: false,
  loading: () => <div className="w-full py-14 sm:py-20" />,
});

export default function DynamicShopByModel() {
  return <ShopByModel />;
}

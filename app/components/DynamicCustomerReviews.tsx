"use client";
import dynamic from "next/dynamic";

// Client Component wrapper so ssr:false is allowed (Server Components don't
// support ssr:false in next/dynamic in Next.js 16).
const CustomerReviews = dynamic(() => import("./CustomerReviews"), {
  ssr: false,
  loading: () => <div className="w-full py-6" />,
});

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: string;
  createdAt: string;
}

export default function DynamicCustomerReviews({ initialReviews }: { initialReviews?: Review[] }) {
  return <CustomerReviews initialReviews={initialReviews} />;
}

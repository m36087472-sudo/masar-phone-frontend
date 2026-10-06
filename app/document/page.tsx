import type { Metadata } from "next";
import DocumentViewerClient from "./DocumentViewerClient";

export const metadata: Metadata = {
  title: "عرض المستند | مسار الهاتف المعتمد",
  description: "عرض المستندات والشهادات الرسمية لمسار الهاتف المعتمد.",
  robots: {
    index: false,
    follow: true,
  },
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DocumentPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;

  const fileUrl = typeof resolvedParams.file === "string" 
    ? resolvedParams.file 
    : (typeof resolvedParams.url === "string" ? resolvedParams.url : "");

  const title = typeof resolvedParams.title === "string"
    ? resolvedParams.title
    : "عرض المستند";

  return <DocumentViewerClient initialFileUrl={fileUrl} initialTitle={title} />;
}

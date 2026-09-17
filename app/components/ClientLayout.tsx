"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";

export default function ClientLayout({
  children,
  footer,
  whatsapp,
  logo,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
  whatsapp?: string;
  logo?: string;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/invoice");
  const isVerify = pathname === "/checkout/verify";

  return (
    <>
      {!isAdmin && !isVerify && <Navbar initialLogo={logo} />}
      {children}
      {!isAdmin && !isVerify && footer}
      {!isAdmin && !isVerify && <WhatsappButton whatsapp={whatsapp} />}
    </>
  );
}

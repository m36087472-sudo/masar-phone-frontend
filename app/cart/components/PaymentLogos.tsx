import Image from "next/image";

const PAYMENT_METHODS = [
  { src: "/Visa-01.svg",       alt: "Visa",      w: 55 },
  { src: "/mastercard.png",    alt: "Mastercard", w: 55 },
  { src: "/Mada-01.svg",       alt: "Mada",       w: 55 },
  { src: "/stcpay.svg",        alt: "STC Pay",    w: 55 },
  { src: "/Apple-Pay-01.svg",  alt: "Apple Pay",  w: 70 },
];

export default function PaymentLogos() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] text-[#8A96A8] font-medium text-center">وسائل الدفع المقبولة</p>
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        {PAYMENT_METHODS.map(({ src, alt, w }) => (
          <div key={src} className="h-9 px-2.5 bg-white border border-[#E8EDF5] rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
            <Image src={src} alt={alt} width={w} height={32} className="object-contain h-6 w-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

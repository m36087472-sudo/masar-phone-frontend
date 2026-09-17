import Image from "next/image";

export default function PaymentLogos() {
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-[10px] text-[#8A96A8] font-medium text-center">وسائل الدفع المقبولة</p>
      <div className="flex items-center justify-center gap-2.5 flex-wrap">
        <div className="h-9 px-3 bg-white border border-[#E8EDF5] rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
          <Image src="/فيزا ماستر مدى.webp" alt="Visa Mastercard Mada" width={100} height={32} className="object-contain h-7 w-auto" />
        </div>
        <div className="h- px-3  border border-black rounded-xl flex items-center justify-center shadow-sm overflow-hidden">
          <Image src="/Apple-Pay-01.png" alt="Apple Pay" width={80} height={40} className="object-contain h-8 w-auto" />
        </div>
      </div>
    </div>
  );
}

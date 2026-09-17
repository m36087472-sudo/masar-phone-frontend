import type { Product } from "../../../components/products/types";
import RiyalIcon from "../../../components/RiyalIcon";

const fmt = (n: number) => n.toLocaleString("ar-SA");

interface Props {
  installment?: Product["installment"];
}

export default function ProductDetails({ installment }: Props) {
  if (!installment?.available) return null;

  return (
    <div className="mt-8" dir="rtl">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          {/* card icon — inline SVG avoids pulling @iconify/react into this Server Component */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="2" y="5" width="20" height="14" rx="3" fill="#5a9030" fillOpacity=".15" />
            <rect x="2" y="9" width="20" height="3" fill="#5a9030" fillOpacity=".4" />
            <rect x="5" y="15" width="5" height="2" rx="1" fill="#5a9030" />
          </svg>
          <p className="text-sm font-black text-gray-800">التقسيط الميسر</p>
        </div>

        <div className="p-5 space-y-3">

          {/* Main offer row */}
          <div className="flex items-center gap-4 bg-[#f0fbe4] rounded-2xl p-4">
            {/* wallet icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0" aria-hidden="true">
              <rect x="2" y="6" width="20" height="14" rx="3" fill="#4fa800" fillOpacity=".15" />
              <path d="M16 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0Z" fill="#4fa800" />
              <path d="M2 10h20" stroke="#4fa800" strokeWidth="1.5" />
            </svg>
            <div>
              <p className="text-sm font-black text-[#3d6b1a]">احصل عليه الآن بالتقسيط</p>
              {installment.downPayment && (
                <p className="text-xs text-[#6DBE00] font-bold mt-0.5">
                  مقدم {fmt(installment.downPayment)}{" "}
                  <RiyalIcon className="inline w-[11px] h-[11px] align-middle" color="#6DBE00" /> فقط
                </p>
              )}
              {installment.note && (
                <p className="text-[11px] text-gray-500 mt-0.5">{installment.note}</p>
              )}
            </div>
          </div>

          {/* Conditions */}
          {installment.conditions?.map((c, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3">
              {/* check-circle icon */}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#0B43FD" fillOpacity=".12" />
                <path d="M7.5 12.5l3 3 6-6" stroke="#0B43FD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs text-gray-600 leading-relaxed">{c}</span>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}

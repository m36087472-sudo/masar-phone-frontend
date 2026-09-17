import { RiArrowLeftLine, RiPriceTag3Line, RiShieldCheckLine, RiTruckLine } from "react-icons/ri";

const fmt = (n: number) => n.toLocaleString("en-US");

interface Props {
  total: number;
  originalTotal: number;
  discountTotal: number;
  onNext: () => void;
}

export default function CartSummary({ total, originalTotal, discountTotal, onNext }: Props) {
  return (
    <div className="w-full lg:w-72 shrink-0 lg:sticky lg:top-6">
      <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-4 py-3 bg-[#F7F9FC] border-b border-[#E8EDF5] flex items-center gap-2">
          <RiPriceTag3Line size={14} className="text-[#0874ED]" />
          <h2 className="text-sm font-bold text-[#040D2A]">ملخص الطلب</h2>
        </div>

        {/* Rows */}
        <div className="px-4 py-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A96A8]">المجموع الأصلي</span>
            <span className="text-xs font-semibold text-[#040D2A]">{fmt(originalTotal)} <span className="text-[10px] text-[#B0BCCE]">ريال</span></span>
          </div>

          {discountTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-emerald-600">الخصم</span>
              <span className="text-xs font-semibold text-emerald-600">- {fmt(discountTotal)} <span className="text-[10px]">ريال</span></span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8A96A8] flex items-center gap-1">
              <RiTruckLine size={12} className="text-emerald-500" />
              الشحن
            </span>
            <span className="text-xs font-semibold text-emerald-600">مجاني 🎉</span>
          </div>

          <div className="h-px bg-[#E8EDF5]" />

          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-[#040D2A]">الإجمالي</span>
            <div className="text-left">
              <span className="text-base sm:text-lg font-extrabold text-[#0874ED]">{fmt(total)}</span>
              <span className="text-[10px] sm:text-xs text-[#B0BCCE] mr-1">ريال</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 pb-4">
          <button
            onClick={onNext}
            className="group w-full py-2.5 sm:py-3 bg-[#0874ED] hover:bg-[#0665D0] active:scale-[0.98] text-white rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between px-3 sm:px-4 shadow-md shadow-[#0874ED]/25"
          >
            <span className="w-4 sm:w-5" />
            <span>إتمام الطلب</span>
            <span className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <RiArrowLeftLine size={11} />
            </span>
          </button>
        </div>

        {/* Trust */}
        <div className="px-4 pb-3 flex items-center justify-center gap-1.5 text-[10px] text-[#8A96A8]">
          <RiShieldCheckLine size={12} className="text-emerald-500" />
          دفع آمن ومشفر بالكامل
        </div>

      </div>
    </div>
  );
}

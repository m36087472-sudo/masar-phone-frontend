import { RiShieldCheckLine, RiTruckLine, RiMedalLine } from "react-icons/ri";

export default function TrustBadges() {
  return (
    <div className="bg-white rounded-2xl border border-[#E8EDF5] shadow-sm px-4 py-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: RiShieldCheckLine, color: "text-emerald-500", bg: "bg-emerald-50", label: "دفع آمن ومشفر" },
          { icon: RiTruckLine,       color: "text-[#0874ED]",   bg: "bg-blue-50",    label: "شحن مجاني سريع" },
          { icon: RiMedalLine,       color: "text-amber-500",   bg: "bg-amber-50",   label: "ضمان الجودة" },
        ].map(({ icon: Icon, color, bg, label }) => (
          <div key={label} className="flex flex-col items-center gap-1.5 text-center">
            <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center`}>
              <Icon size={15} className={color} />
            </div>
            <span className="text-[10px] text-[#6B7A8D] font-medium leading-tight">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

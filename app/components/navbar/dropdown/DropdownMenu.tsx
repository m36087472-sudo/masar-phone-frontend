"use client";

import Link from "next/link";
import { NavChild, NavGroup } from "../data";

interface DropdownMenuProps {
  items?: NavChild[];
  groups?: NavGroup[];
}

function NavLink({ item }: { item: NavChild }) {
  return (
    <Link
      href={item.href}
      className={item.comingSoon ? "flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#0B43FD]/8 hover:text-[#0B43FD] transition-colors text-right" : "block px-4 py-2 text-sm text-gray-700 hover:bg-[#0B43FD]/8 hover:text-[#0B43FD] transition-colors text-right"}
      suppressHydrationWarning
    >
      {item.label}
      {item.comingSoon && (
        <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full shrink-0 mr-1" suppressHydrationWarning>
          قريباً
        </span>
      )}
    </Link>
  );
}

export default function DropdownMenu({ items, groups }: DropdownMenuProps) {
  return (
    <div className="absolute top-full right-0 mt-1 w-64 bg-white rounded-lg shadow-xl border border-[#0B43FD]/10 py-2 z-50 max-h-96 overflow-y-auto opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
      {groups?.map((group, gi) => (
        <div key={gi}>
          <div className="px-4 py-1.5 text-xs font-bold text-[#0B43FD] uppercase tracking-wide border-b border-[#0B43FD]/10">
            {group.groupLabel}
          </div>
          {group.items.map((item, ci) => (
            <NavLink key={`${item.href}-${ci}`} item={item} />
          ))}
        </div>
      ))}
      {items?.map((item, index) => (
        <NavLink key={`${item.href}-${index}`} item={item} />
      ))}
    </div>
  );
}

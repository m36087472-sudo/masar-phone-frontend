"use client";

import { useState } from "react";
import Link from "next/link";
import { NavItem } from "./data";
import { ChevronDownIcon } from "./icons";

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ items, isOpen, onClose }: MobileMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (label: string) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const hasChildren = (item: NavItem) => item.children || item.groups;

  return (
    <>
      {/* Overlay */}
      <div
        className={`lg:hidden fixed inset-0 top-16 sm:top-16 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={`lg:hidden fixed top-16 sm:top-16 right-0 w-[75vw] max-w-[320px] h-[calc(100dvh-4rem)] sm:h-[calc(100dvh-4rem)] bg-white z-50 overflow-y-auto shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-[110%]"
        }`}
        dir="rtl"
      >
        <div className="py-2">
          <div className="px-4 py-4 text-base font-bold text-white border-b border-[#0B43FD]/20" style={{ background: '#0B43FD' }}>
            أقسام المتجر
          </div>
          {items.map((item) => (
            <div key={item.label} className="border-b border-gray-50">
              {hasChildren(item) ? (
                <button
                  onClick={() => toggleDropdown(item.label)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#0B43FD]/8 hover:text-[#0B43FD] transition-colors"
                >
                  {item.label}
                  <span className={`transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}>
                    <ChevronDownIcon />
                  </span>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#0B43FD]/8 hover:text-[#0B43FD] transition-colors"
                  onClick={onClose}
                >
                  {item.label}
                </Link>
              )}

              <div
                className={`transition-all duration-300 ease-in-out ${
                  hasChildren(item) && openDropdown === item.label ? "max-h-[600px] opacity-100 overflow-y-auto" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div className="bg-gray-50 py-1">
                  {/* groups mode */}
                  {item.groups?.map((group, gi) => (
                    <div key={gi}>
                      <div className="px-4 py-1.5 text-xs font-bold text-[#0B43FD] uppercase tracking-wide border-b border-[#0B43FD]/10">
                        {group.groupLabel}
                      </div>
                      {group.items.map((child, ci) => (
                        <Link
                          key={`${child.href}-${ci}`}
                          href={child.href}
                          className="flex items-center justify-between px-8 py-2.5 text-sm text-gray-600 hover:text-[#0B43FD] hover:bg-[#0B43FD]/8 transition-colors"
                          onClick={onClose}
                        >
                          {child.label}
                          {child.comingSoon && (
                            <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                              قريباً
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                  {/* children mode */}
                  {item.children?.map((child, index) => (
                    <Link
                      key={`${child.href}-${index}`}
                      href={child.href}
                      className="flex items-center justify-between px-8 py-2.5 text-sm text-gray-600 hover:text-[#0B43FD] hover:bg-[#0B43FD]/8 transition-colors"
                      onClick={onClose}
                    >
                      {child.label}
                      {child.comingSoon && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                          قريباً
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

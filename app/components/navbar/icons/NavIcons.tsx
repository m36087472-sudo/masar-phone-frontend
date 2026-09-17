import { Search, ShoppingBasket, AlignJustify, X, ChevronDown } from "lucide-react";

export function SearchIcon() {
  return <Search className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-[#0B43FD]" strokeWidth={1.5} />;
}

export function CartIcon() {
  return <ShoppingBasket className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-[#0B43FD]" strokeWidth={1.5} />;
}

export function MenuIcon() {
  return <AlignJustify className="w-6 h-6 text-[#0B43FD]" strokeWidth={1.5} />;
}

export function CloseIcon() {
  return <X className="w-6 h-6 text-[#0B43FD]" strokeWidth={1.5} />;
}

export function ChevronDownIcon() {
  return <ChevronDown className="w-3 h-3" strokeWidth={2} />;
}

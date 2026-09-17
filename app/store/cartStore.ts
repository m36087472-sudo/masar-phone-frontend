import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../components/products/types";

export interface CartItem {
  product: Product;
  qty: number;
  cartKey: string;
}

export interface CustomerInfo {
  name: string;
  nationalId: string;
  whatsapp: string;
  address: string;
  installmentType: "full" | "installment";
  installmentProvider?: "tabby" | "tamara" | "store";
  months: number;
  downPayment: number;
  discountCode?: string;
  discountAmount?: number;
  storeInstallment?: boolean;
}

// In-memory only — sensitive customer data is never persisted to localStorage
interface CustomerState {
  customer: CustomerInfo | null;
  setCustomer: (info: CustomerInfo) => void;
  clearCustomer: () => void;
}

export const useCustomerStore = create<CustomerState>()((set) => ({
  customer: null,
  setCustomer: (info) => set({ customer: info }),
  clearCustomer: () => set({ customer: null }),
}));

interface CartState {
  items: CartItem[];
  pendingDiscountCode: string | null;
  addItem: (product: Product) => void;
  removeItem: (cartKey: string) => void;
  updateQty: (cartKey: string, qty: number) => void;
  setPendingDiscountCode: (code: string) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pendingDiscountCode: null,
      addItem: (product) =>
        set((s) => {
          const cartKey = `${product._id}-${product.color ?? ""}-${product.storage ?? ""}`;
          const existing = s.items.find((i) => i.cartKey === cartKey);
          if (existing)
            return {
              items: s.items.map((i) =>
                i.cartKey === cartKey ? { ...i, qty: i.qty + 1 } : i
              ),
            };
          return { items: [...s.items, { product, qty: 1, cartKey }] };
        }),
      removeItem: (cartKey) =>
        set((s) => ({ items: s.items.filter((i) => i.cartKey !== cartKey) })),
      updateQty: (cartKey, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.cartKey !== cartKey)
              : s.items.map((i) =>
                  i.cartKey === cartKey ? { ...i, qty } : i
                ),
        })),
      setPendingDiscountCode: (code) => set({ pendingDiscountCode: code }),
      clear: () => {
        set({ items: [], pendingDiscountCode: null });
        useCustomerStore.getState().clearCustomer();
      },
      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: () =>
        get().items.reduce(
          (sum, i) =>
            sum + (i.product.salePrice ?? i.product.originalPrice ?? i.product.price) * i.qty,
          0
        ),
    }),
    { name: "cart-storage" }
  )
);

export interface StorageOption {
  storage: string;
  ram?: string;
  gpu?: string;
  chip?: string;
  size?: string;
  originalPrice: number;
  salePrice?: number;
  /** Per-country prices for this storage SKU */
  countryPrices?: Record<string, { currency: string; originalPrice: number; salePrice?: number | null }>;
}

export interface ProductVariant {
  color: string;
  colorCode: string;
  defaultStorage?: string;
  images: string[];
  storageOptions: StorageOption[];
}

export interface SectionMedia {
  _id?: string;
  type: "image" | "video" | "poster";
  url: string;
  urlMobile?: string;
  poster?: string;
  alt?: string;
  title?: string;
  sortOrder?: number;
}

export type SectionType =
  | "design" | "colors" | "camera" | "zoom" | "low_light" | "front_camera"
  | "video" | "performance" | "cooling" | "battery" | "software" | "ai"
  | "safety" | "accessories" | "comparison" | "custom";

export interface ProductSection {
  _id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  description?: string;
  content?: Record<string, unknown>;
  media?: SectionMedia[];
  sortOrder: number;
  isActive: boolean;
}

export interface SpecGroup {
  group: string;
  items: { key: string; value: string }[];
}

export interface Product {
  _id: string;
  name: string;
  brief?: string;
  originalPrice: number;
  salePrice?: number;
  price: number;
  discountPercent: number;
  description?: string;
  image?: string;
  images?: string[];
  variants?: ProductVariant[];
  color?: string;
  storage?: string;
  network?: string;
  screenSize?: string;
  specs?: {
    screen?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    rearCamera?: string;
    frontCamera?: string;
    battery?: string;
    batteryLife?: string;
    charging?: string;
    os?: string;
    extras?: string;
  };
  specGroups?: SpecGroup[];
  sections?: ProductSection[];
  freeDelivery: boolean;
  deliveryTime: string;
  warrantyYears: number;
  installment?: {
    available: boolean;
    downPayment?: number;
    months?: number;
    note?: string;
    conditions?: string[];
    policy?: string;
  };
  taxIncluded: boolean;
  category?: string;
  subCategory?: string;
  brand?: string;
  inStock: boolean;
  status?: "PRE_LAUNCH" | "AVAILABLE" | "OUT_OF_STOCK";
  purchasable?: boolean;
  /** Per-country prices map — key is currency code (SAR, AED, QAR, KWD, OMR) */
  countryPrices?: Record<string, { currency: string; originalPrice: number; salePrice?: number | null }>;
}

export interface ColorVariant {
  name: string;
  value: string;
  image: string;
}

export interface ShopProduct {
  id: string;
  name: string;
  subtitle: string;
  colors: ColorVariant[];
  storage: string[];
  imagePadding?: string;
  imageScale?: string;
  comingSoon?: boolean;
}

export const SHOP_PRODUCTS: ShopProduct[] = [
  {
    id: "18-pro-max",
    name: "آيفون 18 برو ماكس",
    subtitle: "iPhone 18 Pro Max",
    colors: [
      { name: "Burgundy", value: "#800020", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095298/34ab662e-de1b-4359-9d99-43e2ba54678f_1.webp" },
      { name: "Glacier", value: "#DCE6F0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095297/96bef8db-6a7f-4361-b75b-330d54685d37_1.webp" },
      { name: "Silver", value: "#F5F5F5", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095399/11984507-b78d-47a8-b943-640b6cfe5bdf_1.webp" },
      { name: "Black", value: "#1C1C1E", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095298/9be64aca-f6ba-41a9-9cd9-ae7fc833ee72_1.webp" },
    ],
    storage: ["256GB", "512GB", "1TB", "2TB"],
    imagePadding: "p-1",
    imageScale: "scale-[1.6]",
  },
  {
    id: "18-pro",
    name: "آيفون 18 برو",
    subtitle: "iPhone 18 Pro",
    colors: [
            { name: "Glacier", value: "#DCE6F0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095297/96bef8db-6a7f-4361-b75b-330d54685d37_1.webp" },

      { name: "Silver", value: "#F5F5F5", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095399/11984507-b78d-47a8-b943-640b6cfe5bdf_1.webp" },
      { name: "Burgundy", value: "#800020", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095298/34ab662e-de1b-4359-9d99-43e2ba54678f_1.webp" },
      { name: "Black", value: "#1C1C1E", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095298/9be64aca-f6ba-41a9-9cd9-ae7fc833ee72_1.webp" },
    ],
    storage: ["256GB", "512GB", "1TB", "2TB"],
    imagePadding: "p-1",
    imageScale: "scale-[1.6]",
  },
  {
    id: "18-duo",
    name: "آيفون 18 دو",
    subtitle: "iPhone 18 Duo",
    colors: [
      { name: "أبيض نجمي", value: "#F8F8F5", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/c5a8d90b-ec81-4680-823f-1b460f0dc8ea.webp" },
      { name: "سماء ليلية", value: "#1C2430", image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/background-removed.webp" },
    ],
    storage: ["256GB", "512GB", "1TB", "2TB"],
    imagePadding: "p-1",
  },
  {
    id: "17-pro-max",
    name: "آيفون 17 برو ماكس",
    subtitle: "iPhone 17 Pro Max",
    colors: [
      { name: "برتقالي", value: "#F07B2C", image: "/iphone-17-promax/iphone17promax-org.webp" },
      { name: "سيلفر", value: "#F5F5F5", image: "/iphone-17-promax/iphone-17promax-silver.webp" },
      { name: "أزرق", value: "#32374A", image: "/iphone-17-promax/iphone1-promax-blu.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "17-pro",
    name: "آيفون 17 برو",
    subtitle: "iPhone 17 Pro",
    colors: [
      { name: "سيلفر", value: "#F5F5F5", image: "/iphone-17-promax/iphone-17promax-silver.webp" },
      { name: "برتقالي", value: "#F07B2C", image: "/iphone-17-promax/iphone17promax-org.webp" },
      { name: "أزرق", value: "#32374A", image: "/iphone-17-promax/iphone1-promax-blu.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "17-air",
    name: "آيفون 17 إير",
    subtitle: "iPhone 17 Air",
    colors: [
      { name: "أبيض", value: "#FFFFFF", image: "/iphone-17-air/i-white.webp" },
      { name: "أسود", value: "#000000", image: "/iphone-17-air/i-black.webp" },
      { name: "ذهبي", value: "#e4a017", image: "/iphone-17-air/i-gold.webp" },
      { name: "سماوي", value: "#96AED1F", image: "/iphone-17-air/i-blue.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "17",
    name: "آيفون 17",
    subtitle: "iPhone 17",
    colors: [
      { name: "وردي", value: "#C9ADDC", image: "/iphone-17/i-pink.webp" },
      { name: "أخضر", value: "#A6B286", image: "/iphone-17/i-green.webp" },
      { name: "أبيض", value: "#FFFFFF", image: "/iphone-17/i-white.webp" },
      { name: "أسود", value: "#000000", image: "/iphone-17/i-black.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "16-pro-max",
    name: "آيفون 16 برو ماكس",
    subtitle: "iPhone 16 Pro Max",
    colors: [
      { name: "تيتانيوم صحراوي", value: "#C8A77A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788637968/1ad27298-5aa7-4ebf-8335-4b2a106c8442.webp" },
      { name: "تيتانيوم طبيعي", value: "#9A9A9A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788637034/4b33df43-b486-4c3a-9b2e-8f7970925505.webp" },
      { name: "تيتانيوم أبيض", value: "#E5E5E0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788636870/16aee900-ceb3-48e3-b3e9-119a44739507.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "16-pro",
    name: "آيفون 16 برو",
    subtitle: "iPhone 16 Pro",
    colors: [
      { name: "تيتانيوم صحراوي", value: "#C8A77A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788637968/1ad27298-5aa7-4ebf-8335-4b2a106c8442.webp" },
      { name: "تيتانيوم طبيعي", value: "#9A9A9A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788637034/4b33df43-b486-4c3a-9b2e-8f7970925505.webp" },
      { name: "تيتانيوم أبيض", value: "#E5E5E0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788636870/16aee900-ceb3-48e3-b3e9-119a44739507.webp" },
    ],
    storage: ["128GB", "256GB", "512GB"],
  },
  {
    id: "16-plus",
    name: "آيفون 16 بلس",
    subtitle: "iPhone 16 Plus",
    colors: [
      { name: "أسود", value: "#1D1D1F", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643537/c3022b9b-9702-4421-85d1-0861710a3fee.webp" },
      { name: "أبيض", value: "#F5F5F0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643538/d55b764c-e695-428a-99c9-a0768cd173e7.webp" },
      { name: "وردي", value: "#F2C6D2", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643539/7bba49c7-f75e-4a42-a2cf-bff4ce3f6f9e.webp" },
      { name: "أخضر مزرق", value: "#4D8B87", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643537/e5241fbd-5d6a-4011-a5d7-8dda50c6e722.webp" },
      { name: "أزرق فوق بحري", value: "#243C7A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643540/251e0223-4981-4028-b0b6-6b966832abce.webp" },
    ],
    storage: ["128GB", "256GB", "512GB"],
  },
  {
    id: "16",
    name: "آيفون 16",
    subtitle: "iPhone 16",
    colors: [
      { name: "أسود", value: "#1D1D1F", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643537/c3022b9b-9702-4421-85d1-0861710a3fee.webp" },
      { name: "أبيض", value: "#F5F5F0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643538/d55b764c-e695-428a-99c9-a0768cd173e7.webp" },
      { name: "وردي", value: "#F2C6D2", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643539/7bba49c7-f75e-4a42-a2cf-bff4ce3f6f9e.webp" },
      { name: "أخضر مزرق", value: "#4D8B87", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643537/e5241fbd-5d6a-4011-a5d7-8dda50c6e722.webp" },
      { name: "أزرق فوق بحري", value: "#243C7A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788643540/251e0223-4981-4028-b0b6-6b966832abce.webp" },
    ],
    storage: ["128GB", "256GB", "512GB"],
  },
  {
    id: "15-pro-max",
    name: "آيفون 15 برو ماكس",
    subtitle: "iPhone 15 Pro Max",
    colors: [
      { name: "تيتانيوم أبيض", value: "#E5E5E0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/d7b5e81a-a3de-42fd-b73e-0df0c2b4cb11.jpg" },
      { name: "تيتانيوم أزرق", value: "#394C63", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/768732fa-f71e-47f6-a9cb-a8578dd4bff0.jpg" },
      { name: "تيتانيوم طبيعي", value: "#9A9A9A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/c15ecd7e-91da-43e0-8514-28ad02053504.jpg" },
    ],
    storage: ["128GB", "256GB", "512GB"],
  },
  {
    id: "15-pro",
    name: "آيفون 15 برو",
    subtitle: "iPhone 15 Pro",
    colors: [
      { name: "تيتانيوم أبيض", value: "#E5E5E0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/d7b5e81a-a3de-42fd-b73e-0df0c2b4cb11.jpg" },
      { name: "تيتانيوم أزرق", value: "#394C63", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/768732fa-f71e-47f6-a9cb-a8578dd4bff0.jpg" },
      { name: "تيتانيوم طبيعي", value: "#9A9A9A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788649290/c15ecd7e-91da-43e0-8514-28ad02053504.jpg" },
    ],
    storage: ["128GB", "256GB", "512GB"],
  },
  {
    id: "macbook-air",
    name: "ماك بوك إير M4",
    subtitle: "MacBook Air M4",
    colors: [
      { name: "أزرق سماوي", value: "#A7C7E7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789069680/a17b5a9e-c448-4bde-a717-21da9ce09228.webp" },
      { name: "فضي", value: "#C4C7CC", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789069680/ec488438-90c7-43d6-9545-0e33b3228a88.webp" },
      { name: "ضوء النجوم", value: "#E8E4D8", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789069678/66bba709-4332-4f8e-9f45-a83e8b309f91.webp" },
      { name: "سماء الليل", value: "#2F3033", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789069689/af426051-e5e9-439a-8ad8-c05a1d646bdd.webp" },
    ],
    storage: ["512GB", "1TB"],
  },
  {
    id: "macbook-pro",
    name: "ماك بوك برو",
    subtitle: "MacBook Pro",
    colors: [
      { name: "فضي", value: "#C0C0C0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789078447/e7c26e45-c688-416a-a668-89f9983fcc8b.jpg" },
      { name: "أسود فلكي", value: "#6E6E73", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1789078454/b7dd9c38-37c0-4296-ab44-890a3579e24c.jpg" },
    ],
    storage: ["1TB", "2TB"],
  },
  {
    id: "galaxy-s26-ultra",
    name: "سامسونج جالاكسي اس 26 الترا",
    subtitle: "Samsung Galaxy S26 Ultra",
    colors: [
      { name: "بنفسجي غامق", value: "#6B6D83", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911908/3b7297c9-185d-4ca0-9f97-d85508a3e583.webp" },
      { name: "أسود", value: "#4A4D53", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911908/ab056765-541c-4e76-90e5-6d7713242337.webp" },
      { name: "أزرق سماوي", value: "#B0C9D9", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911908/10f7850b-be18-47c3-b5f6-819e4ea40d6a.webp" },
      { name: "أبيض", value: "#F4F6F7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911907/4a7d79ac-e15b-4867-9935-42b875857452.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "galaxy-s26-plus",
    name: "سامسونج جالاكسي اس 26 بلس",
    subtitle: "Samsung Galaxy S26+",
    colors: [
      { name: "بنفسجي غامق", value: "#6B6D83", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/ecbbc1a9-042c-4237-b19c-4d5ee549e4ea.jpg" },
      { name: "أسود", value: "#4A4D53", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/c26f2256-2559-4cad-ba65-8bd6f14f654e.jpg" },
      { name: "أزرق سماوي", value: "#B0C9D9", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/002fd360-d09f-4bb8-b4ec-609790ab6800.jpg" },
      { name: "أبيض", value: "#F4F6F7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914598/052030c1-d4f5-4865-928f-7667dfddf640.jpg" },
    ],
    storage: ["256GB", "512GB"],
  },
  {
    id: "galaxy-s26",
    name: "سامسونج جالاكسي اس 26",
    subtitle: "Samsung Galaxy S26",
    colors: [
      { name: "بنفسجي غامق", value: "#6B6D83", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/ecbbc1a9-042c-4237-b19c-4d5ee549e4ea.jpg" },
      { name: "أسود", value: "#4A4D53", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/c26f2256-2559-4cad-ba65-8bd6f14f654e.jpg" },
      { name: "أزرق سماوي", value: "#B0C9D9", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/002fd360-d09f-4bb8-b4ec-609790ab6800.jpg" },
      { name: "أبيض", value: "#F4F6F7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914598/052030c1-d4f5-4865-928f-7667dfddf640.jpg" },
    ],
    storage: ["256GB", "512GB"],
  },
  {
    id: "galaxy-s25-ultra",
    name: "سامسونج جالاكسي اس 25 الترا",
    subtitle: "Samsung Galaxy S25 Ultra",
    colors: [
      { name: "تيتانيوم أسود", value: "#3A3A3A", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911908/ab056765-541c-4e76-90e5-6d7713242337.webp" },
      { name: "تيتانيوم فضي", value: "#C0C0C0", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911907/4a7d79ac-e15b-4867-9935-42b875857452.webp" },
      { name: "تيتانيوم أزرق", value: "#6B8CAE", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788911908/10f7850b-be18-47c3-b5f6-819e4ea40d6a.webp" },
    ],
    storage: ["256GB", "512GB", "1TB"],
  },
  {
    id: "galaxy-s25-plus",
    name: "سامسونج جالاكسي اس 25 بلس",
    subtitle: "Samsung Galaxy S25+",
    colors: [
      { name: "أسود", value: "#4A4D53", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/c26f2256-2559-4cad-ba65-8bd6f14f654e.jpg" },
      { name: "أبيض", value: "#F4F6F7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914598/052030c1-d4f5-4865-928f-7667dfddf640.jpg" },
      { name: "أزرق سماوي", value: "#B0C9D9", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/002fd360-d09f-4bb8-b4ec-609790ab6800.jpg" },
    ],
    storage: ["256GB", "512GB"],
  },
  {
    id: "galaxy-s25",
    name: "سامسونج جالاكسي اس 25",
    subtitle: "Samsung Galaxy S25",
    colors: [
      { name: "أسود", value: "#4A4D53", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/c26f2256-2559-4cad-ba65-8bd6f14f654e.jpg" },
      { name: "أبيض", value: "#F4F6F7", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914598/052030c1-d4f5-4865-928f-7667dfddf640.jpg" },
      { name: "أزرق سماوي", value: "#B0C9D9", image: "https://res.cloudinary.com/bzwltpqf/image/upload/f_auto,q_auto,w_400/v1788914599/002fd360-d09f-4bb8-b4ec-609790ab6800.jpg" },
    ],
    storage: ["256GB", "512GB"],
  },
];

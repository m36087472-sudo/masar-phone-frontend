import { SHOP_PRODUCTS } from "../../shop-by-model/shopByModelData";

export interface NavChild {
  label: string;
  href: string;
  comingSoon?: boolean;
}

export interface NavGroup {
  groupLabel: string;
  items: NavChild[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
  groups?: NavGroup[];
}

const toNavChild = (p: (typeof SHOP_PRODUCTS)[0]): NavChild => ({
  label: p.name,
  href: `/shop/${p.id}`,
  comingSoon: p.comingSoon,
});

const iphoneProducts = SHOP_PRODUCTS.filter((p) => p.id.match(/^\d|^17|^16|^15|^18/));
const samsungProducts = SHOP_PRODUCTS.filter((p) => p.id.startsWith("galaxy"));
const laptopProducts = SHOP_PRODUCTS.filter((p) => p.id.startsWith("macbook"));

export const navItems: NavItem[] = [
  {
    label: "الهواتف الذكية",
    href: "/shop",
    groups: [
      { groupLabel: "آيفون", items: iphoneProducts.map(toNavChild) },
      { groupLabel: "سامسونج", items: samsungProducts.map(toNavChild) },
    ],
  },
  {
    label: "لابتوبات",
    href: "/laptops",
    children: laptopProducts.map(toNavChild),
  },
];

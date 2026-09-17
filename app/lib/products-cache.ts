import { unstable_cache } from "next/cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";

export const getCachedProducts = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/products`, { next: { tags: ["products"] } });
      if (!res.ok) return [];
      return res.json();
    } catch {
      return [];
    }
  },
  ["all-products"],
  { revalidate: 300, tags: ["products"] }
);

export const getCachedProduct = unstable_cache(
  async (id: string) => {
    try {
      const res = await fetch(`${BACKEND}/api/products/${id}`, {
        next: { tags: [`product-${id}`, "products"] },
      });
      return res.ok ? res.json() : null;
    } catch {
      return null;
    }
  },
  ["product"],
  { revalidate: 300, tags: ["products"] }
);

// Shared company cache — one source for layout, metadata, product page
export const getCachedCompany = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/company`, {
        next: { tags: ["company"] },
      });
      return res.ok ? res.json() : {};
    } catch {
      return {};
    }
  },
  ["company"],
  { revalidate: 3600, tags: ["company"] }
);

export const getCachedBanners = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/banners`, {
        next: { tags: ["banners"] },
      });
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  },
  ["banners"],
  { revalidate: 600, tags: ["banners"] }
);

export const getCachedReviews = unstable_cache(
  async () => {
    try {
      const res = await fetch(`${BACKEND}/api/admin/reviews`, {
        next: { tags: ["reviews"] },
      });
      return res.ok ? res.json() : [];
    } catch {
      return [];
    }
  },
  ["reviews"],
  { revalidate: 600, tags: ["reviews"] }
);

export const getCachedHomeConfig = unstable_cache(
  async () => {
    try {
      const [settingsRes, maxRes] = await Promise.all([
        fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, {
          next: { tags: ["home-settings"] },
        }),
        fetch(`${BACKEND}/api/admin/sub-categories/max`, {
          next: { tags: ["home-settings"] },
        }),
      ]);
      const settings = settingsRes.ok ? await settingsRes.json() : [];
      const { max = 4 } = maxRes.ok ? await maxRes.json() : {};
      return { settings, max };
    } catch {
      return { settings: [], max: 4 };
    }
  },
  ["home-config"],
  { revalidate: 3600, tags: ["home-settings"] }
);

export const getCachedCategoryBanners = unstable_cache(
  async (categories: string) => {
    try {
      const res = await fetch(
        `${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories)}`,
        { next: { tags: ["category-banners"] } }
      );
      return res.ok ? res.json() : {};
    } catch {
      return {};
    }
  },
  ["category-banners"],
  { revalidate: 600, tags: ["category-banners"] }
);

export async function searchCachedProducts(q: string, brand?: string) {
  const products: Record<string, string>[] = await getCachedProducts();
  const query = q.toLowerCase();
  return products.filter((p) => {
    const matchQ =
      !q ||
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query);
    const matchBrand = !brand || p.brand?.toLowerCase() === brand.toLowerCase();
    return matchQ && matchBrand;
  });
}

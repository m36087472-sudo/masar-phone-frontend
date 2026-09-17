import { ProductGrid } from "./components/products";
import HeroSection from "./components/HeroSection";
import AnimatedSection from "./components/AnimatedSection";
import HomeBackground from "./components/HomeBackground";
import DynamicShopByModel from "./components/DynamicShopByModel";
import DynamicCustomerReviews from "./components/DynamicCustomerReviews";
import {
  getCachedProducts,
  getCachedBanners,
  getCachedReviews,
  getCachedHomeConfig,
  getCachedCategoryBanners,
} from "./lib/products-cache";

const BACKEND = process.env.BACKEND_URL || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://masarphone.com";

export default async function Home() {
  const [products, homeConfig, rawBanners, reviews] = await Promise.all([
    getCachedProducts(),
    getCachedHomeConfig(),
    getCachedBanners(),
    getCachedReviews(),
  ]);

  const heroBanners = (rawBanners as { url: string; active: boolean }[])
    .filter((b) => b.url && b.active)
    .map((b) => ({
      ...b,
      url: b.url.startsWith("http") ? b.url : `${BACKEND}${b.url}`,
    }));

  // Single-pass unique-category extraction — avoids a second .map() + spread
  const seenCats = new Set<string>();
  for (const p of products as { category?: string }[]) {
    if (p.category) seenCats.add(p.category);
  }
  const categories = Array.from(seenCats);

  const bannerMap: Record<string, string[]> = categories.length
    ? await getCachedCategoryBanners(
        // Sort to guarantee a stable cache key regardless of DB return order
        [...categories].sort().join(",")
      )
    : {};

  const siteName = "مسار الهاتف المعتمد";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: SITE_URL,
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <main className="min-h-screen">
        <HomeBackground />
        <HeroSection banners={heroBanners} />
        <AnimatedSection delay={0.1}>
          <DynamicShopByModel />
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <ProductGrid products={products} homeConfig={homeConfig} bannerMap={bannerMap} />
        </AnimatedSection>
        <AnimatedSection delay={0.1}>
          <DynamicCustomerReviews initialReviews={reviews} />
        </AnimatedSection>
      </main>
    </>
  );
}

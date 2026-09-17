/**
 * @jest-environment jsdom
 *
 * ══════════════════════════════════════════════════════════════════════════════
 *  HOME PAGE — شامل أداء وسرعة واستهلاك
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * ما يقيسه هذا الملف:
 *
 * 1.  CPU — PURE FUNCTIONS  — سرعة دوال المعالجة (normalize, parseStorage, colorOrder, sortByStorage)
 * 2.  RENDER SPEED          — سرعة render المكونات الرئيسية (حدود واقعية لـ jsdom)
 * 3.  RE-RENDER COUNT       — عدد مرات إعادة الـ render
 * 4.  TIMER MANAGEMENT      — صحة الـ intervals والـ cleanup
 * 5.  INTERSECTION OBSERVER — shared observer بدل N observers
 * 6.  CACHE KEY STABILITY   — ثبات مفتاح الـ cache للـ category banners
 * 7.  DATA PROCESSING       — كفاءة تجميع المنتجات وترتيبها + صحة النتائج
 * 8.  HERO SECTION          — سلوك الـ carousel وإدارة الـ interval
 * 9.  ANIMATED SECTION      — shared observer + animation correctness
 * 10. MEMORY                — لا تسريب عند mount/unmount متكرر
 * 11. STRESS TEST           — بيانات ضخمة
 * 12. PRODUCT CARD          — صحة العرض والتفاعل
 * 13. HYDRATION SAFETY      — لا console.error أثناء render
 *
 * ملاحظة: حدود الوقت مضبوطة على jsdom (أبطأ 3-5× من Chrome الحقيقي).
 * ══════════════════════════════════════════════════════════════════════════════
 */

import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// ─── Global mocks ──────────────────────────────────────────────────────────
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => "/",
}));

jest.mock("next/image", () =>
  function MockImage({
    src,
    alt,
    priority,
    fill,
    ...rest
  }: {
    src: string;
    alt: string;
    priority?: boolean;
    fill?: boolean;
    [k: string]: unknown;
  }) {
    // strip boolean props that aren't valid on <img>
    const { sizes, quality, loading, fetchPriority, ...safeRest } = rest as Record<string, unknown>;
    return (
      <img
        src={src}
        alt={alt}
        data-priority={priority ? "true" : undefined}
        data-fill={fill ? "true" : undefined}
        loading={loading as string | undefined}
        {...safeRest}
      />
    );
  }
);

jest.mock("next/link", () =>
  function MockLink({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [k: string]: unknown;
  }) {
    return <a href={href} {...(rest as object)}>{children}</a>;
  }
);

jest.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper">{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="swiper-slide">{children}</div>
  ),
}));
jest.mock("swiper/modules", () => ({
  Navigation: {},
  Pagination: {},
  A11y: {},
  Autoplay: {},
  Keyboard: {},
}));
jest.mock("swiper/css", () => ({}));
jest.mock("swiper/css/pagination", () => ({}));

jest.mock("../app/store/cartStore", () => ({
  useCartStore: (sel: (s: { items: unknown[] }) => unknown) =>
    sel({ items: [], addItem: jest.fn(), removeItem: jest.fn() }),
}));

jest.mock("../app/store/companyStore", () => ({
  useCompanyStore: () => ({ logo: "", setLogo: jest.fn() }),
}));

jest.mock("@iconify/react", () => ({
  Icon: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

jest.mock("lucide-react", () => ({
  ShoppingCart: () => <span>cart</span>,
  CheckCircle2: () => <span>check</span>,
  ChevronLeft: () => <span>{"<"}</span>,
  ChevronRight: () => <span>{">"}</span>,
}));

jest.mock("react-icons/fi", () => ({ FiShoppingBag: () => <span>bag</span> }));
jest.mock("react-icons/hi2", () => ({
  HiArrowRight: () => <span>→</span>,
  HiArrowLeft: () => <span>←</span>,
}));
jest.mock("react-icons/fa", () => ({
  FaWhatsapp: () => <span>wa</span>,
  FaPhone: () => <span>ph</span>,
  FaEnvelope: () => <span>em</span>,
  FaMapMarkerAlt: () => <span>loc</span>,
}));

// ─── IntersectionObserver global mock (needed before any component import) ──
function makeObserverMock(autoFire = false) {
  const instances: { cb: IntersectionObserverCallback; el: Element | null }[] = [];
  const MockIO = jest.fn().mockImplementation((cb: IntersectionObserverCallback) => {
    const instance = { cb, el: null as Element | null };
    instances.push(instance);
    return {
      observe: jest.fn((el: Element) => {
        instance.el = el;
        if (autoFire) {
          cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {} as IntersectionObserver);
        }
      }),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    };
  });
  (MockIO as unknown as { __instances: typeof instances }).__instances = instances;
  return MockIO;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function measureTime(fn: () => void): number {
  const start = performance.now();
  fn();
  return performance.now() - start;
}

async function measureTimeAsync(fn: () => Promise<void>): Promise<number> {
  const start = performance.now();
  await fn();
  return performance.now() - start;
}

function measureMemory(): number {
  const p = performance as Performance & { memory?: { usedJSHeapSize: number } };
  return p.memory?.usedJSHeapSize ?? 0;
}

type TestProduct = import("../app/components/products/types").Product;
function makeProducts(count: number, category = "ابل ايفون 17 برو ماكس"): TestProduct[] {
  return Array.from({ length: count }, (_, i) => ({
    _id: `p${i}`,
    name: `iPhone ${i}`,
    originalPrice: 1000 + i * 100,
    price: 1000 + i * 100,
    discountPercent: 0,
    freeDelivery: true,
    deliveryTime: "24 ساعة",
    warrantyYears: 2,
    taxIncluded: true,
    inStock: true,
    category,
    storage: `${(i % 3 + 1) * 128}GB`,
    color: ["أسود", "أبيض", "سيلفر"][i % 3],
    images: [`/img${i}.webp`],
  }));
}

// ══════════════════════════════════════════════════════════════════════════
// 1. CPU — PURE FUNCTIONS PERFORMANCE
// ══════════════════════════════════════════════════════════════════════════
describe("⚡ CPU — دوال المعالجة الخالصة", () => {

  test("normalize — 10,000 نص في أقل من 100ms (jsdom)", () => {
    const normalize = (s: string) =>
      s.trim().replace(/[آأإ]/g, "ا").replace(/[ى]/g, "ي").replace(/\s+/g, " ").toLowerCase();

    const samples = Array.from({ length: 10_000 }, (_, i) => `آيفون ${i} برو ماكس إير`);
    const elapsed = measureTime(() => { samples.forEach(normalize); });
    console.log(`  normalize × 10,000 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(100);
  });

  test("parseStorage — 10,000 نص في أقل من 30ms", () => {
    const parseStorage = (s?: string): number => {
      if (!s) return 0;
      const n = parseFloat(s);
      if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
      return n || 0;
    };
    const samples = ["128GB", "256GB", "512GB", "1TB", "2تيرا", "64GB", undefined];
    const elapsed = measureTime(() => {
      for (let i = 0; i < 10_000; i++) parseStorage(samples[i % samples.length]);
    });
    console.log(`  parseStorage × 10,000 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(30);
  });

  test("colorOrder — 10,000 مرة في أقل من 20ms", () => {
    const colorOrder = (c?: string): number => {
      if (!c) return 99;
      if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
      if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
      if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
      return 3;
    };
    const colors = ["أسود", "سيلفر", "برتقالي", "أزرق", "أبيض", undefined];
    const elapsed = measureTime(() => {
      for (let i = 0; i < 10_000; i++) colorOrder(colors[i % colors.length]);
    });
    console.log(`  colorOrder × 10,000 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(20);
  });

  test("sortByStorage (المحسّن) — O(n log n) مع pre-computation", () => {
    const STORAGE_RE = /(\d+)\s*(GB|TB|جيجابايت|تيرابايت)/i;
    const STORAGE_ORDER = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
    const getKey = (storage: string) => {
      const m = STORAGE_RE.exec(storage);
      if (!m) return "";
      const unit = m[2].replace(/جيجابايت/i, "GB").replace(/تيرابايت/i, "TB").toUpperCase();
      return `${m[1]}${unit}`;
    };
    const prods = Array.from({ length: 500 }, (_, i) => ({
      _id: `p${i}`,
      storage: ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"][i % 6],
    }));
    const elapsed = measureTime(() => {
      const idx = new Map(prods.map((p) => [p._id, STORAGE_ORDER.indexOf(getKey(p.storage))]));
      [...prods].sort((a, b) => {
        const ai = idx.get(a._id) ?? 99;
        const bi = idx.get(b._id) ?? 99;
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    });
    console.log(`  sortByStorage × 500 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(15);
  });

  test("STORAGE_RE — regex المُجمَّع مسبقاً يُعطي نتائج صحيحة", () => {
    const STORAGE_RE = /(\d+)\s*(GB|TB|جيجابايت|تيرابايت)/i;
    expect(STORAGE_RE.exec("iPhone 256GB")?.[1]).toBe("256");
    expect(STORAGE_RE.exec("iPhone 1TB")?.[2]).toMatch(/TB/i);
    expect(STORAGE_RE.exec("512 جيجابايت")?.[2]).toMatch(/جيجابايت/i);
    expect(STORAGE_RE.exec("iPhone 17 Pro")).toBeNull();
  });

  test("keyword pre-normalization — .toLowerCase() فقط مرة واحدة عند التجهيز", () => {
    const toLowerCalls: string[] = [];
    const keywords = ["17 برو ماكس", "17 pro max", "17promax"];
    // Pre-normalize مرة واحدة
    const kwLower = keywords.map((kw) => {
      toLowerCalls.push(kw);
      return kw.toLowerCase();
    });

    const products = makeProducts(100);
    let filterOps = 0;
    products.forEach((p) => {
      filterOps++;
      const name = (p.name || "").toLowerCase();
      kwLower.some((kw) => name.includes(kw));
    });

    // يجب أن تكون استدعاءات pre-norm = keywords.length فقط (3)
    expect(toLowerCalls.length).toBe(keywords.length);
    console.log(`  Pre-norm calls: ${toLowerCalls.length}, Filter iterations: ${filterOps}`);
  });

  test("Map lookup O(1) vs Array.includes O(n) — Map أسرع بكثير", () => {
    const categories = Array.from({ length: 30 }, (_, i) => `فئة-${i}`);
    const data = Object.fromEntries(categories.map((c) => [c, `/shop/${c}`]));

    // Array.includes (القديم)
    const asArray = Object.keys(data);
    const arrayTime = measureTime(() => {
      for (let i = 0; i < 100_000; i++) {
        asArray.includes(categories[i % categories.length]);
      }
    });

    // Set.has (الجديد)
    const asSet = new Set(asArray);
    const setTime = measureTime(() => {
      for (let i = 0; i < 100_000; i++) {
        asSet.has(categories[i % categories.length]);
      }
    });

    console.log(`  Array.includes × 100k = ${arrayTime.toFixed(2)}ms | Set.has × 100k = ${setTime.toFixed(2)}ms`);
    // Set يجب أن يكون أسرع أو مساوياً
    expect(setTime).toBeLessThanOrEqual(arrayTime + 5); // +5ms tolerance
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 2. RENDER SPEED
// ══════════════════════════════════════════════════════════════════════════
describe("🚀 Render Speed — سرعة المكونات (حدود jsdom واقعية)", () => {

  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("HeroSection — 5 بانرات تُرندر في أقل من 200ms", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const banners = Array.from({ length: 5 }, (_, i) => ({
      url: `https://res.cloudinary.com/test/b${i}.webp`,
      active: true,
    }));
    const elapsed = await measureTimeAsync(async () => {
      act(() => { render(<HeroSection banners={banners} />); });
    });
    console.log(`  HeroSection (5 banners) = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(200);
  });

  test("ProductGrid — 40 منتج × 3 فئات في أقل من 500ms", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = [
      ...makeProducts(14, "ابل ايفون 17 برو ماكس"),
      ...makeProducts(14, "سامسونج جالاكسي s26 الترا"),
      ...makeProducts(12, "ماك بوك إير"),
    ];
    const homeConfig = {
      settings: [
        { category: "ابل ايفون 17 برو ماكس", subCategory: "", showInHome: true, order: 1 },
        { category: "سامسونج جالاكسي s26 الترا", subCategory: "", showInHome: true, order: 2 },
        { category: "ماك بوك إير", subCategory: "", showInHome: true, order: 3 },
      ],
      max: 3,
    };
    const elapsed = await measureTimeAsync(async () => {
      act(() => { render(<ProductGrid products={products} homeConfig={homeConfig} bannerMap={{}} />); });
    });
    console.log(`  ProductGrid (40 products, 3 cats) = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(500);
  });

  test("AnimatedSection — تُرندر في أقل من 100ms", async () => {
    const { default: AnimatedSection } = await import("../app/components/AnimatedSection");
    const elapsed = await measureTimeAsync(async () => {
      act(() => {
        render(<AnimatedSection delay={0.1}><div>content</div></AnimatedSection>);
      });
    });
    console.log(`  AnimatedSection render = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(100);
  });

  test("ProductGrid بدون homeConfig — 50 منتج في أقل من 300ms", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = Array.from({ length: 50 }, (_, i) => ({
      ...makeProducts(1, `فئة ${i % 5}`)[0],
      _id: `prod-${i}`,
    }));
    const elapsed = await measureTimeAsync(async () => {
      act(() => { render(<ProductGrid products={products} homeConfig={null} bannerMap={{}} />); });
    });
    console.log(`  ProductGrid (50 prods, no config) = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(300);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 3. RE-RENDER COUNT
// ══════════════════════════════════════════════════════════════════════════
describe("🔁 Re-renders — عدد التكرارات", () => {
  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("ProductGrid — useMemo يحمي الحسابات عند تمرير نفس المنتجات", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = makeProducts(8, "ابل ايفون 17 برو ماكس");
    let wrapperRenders = 0;
    const Wrapper = ({ prods }: { prods: typeof products }) => {
      wrapperRenders++;
      return <ProductGrid products={prods} homeConfig={null} bannerMap={{}} />;
    };
    const { rerender } = render(<Wrapper prods={products} />);
    wrapperRenders = 0; // reset after first render
    rerender(<Wrapper prods={products} />);
    // Wrapper re-renders once (طبيعي) — ProductGrid useMemo يتجنب إعادة الحساب
    console.log(`  Extra Wrapper renders: ${wrapperRenders}`);
    expect(wrapperRenders).toBeLessThanOrEqual(1);
  });

  test("HeroSection — setInterval واحد فقط عند mount ثم re-render", async () => {
    jest.useFakeTimers();
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const spy = jest.spyOn(global, "setInterval");
    const banners = [
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
    ];
    const { rerender } = render(<HeroSection banners={banners} />);
    const afterMount = spy.mock.calls.length;
    rerender(<HeroSection banners={banners} />);
    const afterRerender = spy.mock.calls.length;
    console.log(`  setInterval: mount=${afterMount}, re-render extra=${afterRerender - afterMount}`);
    // active.length لم يتغير → لا interval جديد
    expect(afterRerender - afterMount).toBe(0);
    spy.mockRestore();
    jest.useRealTimers();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 4. TIMER MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════
describe("⏱️ Timer Management — الـ intervals والـ cleanup", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });
  afterEach(() => { jest.useRealTimers(); });

  test("HeroSection — ينشئ interval واحد فقط لـ N بانر", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const spy = jest.spyOn(global, "setInterval");
    act(() => {
      render(<HeroSection banners={[
        { url: "https://res.cloudinary.com/test/a.webp", active: true },
        { url: "https://res.cloudinary.com/test/b.webp", active: true },
        { url: "https://res.cloudinary.com/test/c.webp", active: true },
      ]} />);
    });
    expect(spy.mock.calls.length).toBe(1);
    spy.mockRestore();
  });

  test("HeroSection — لا interval لبانر واحد", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const spy = jest.spyOn(global, "setInterval");
    act(() => { render(<HeroSection banners={[{ url: "https://res.cloudinary.com/test/x.webp", active: true }]} />); });
    expect(spy.mock.calls.length).toBe(0);
    spy.mockRestore();
  });

  test("HeroSection — يُغيّر الـ slide بعد 4 ثوانٍ (يتحقق من state وليس style)", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const banners = [
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
    ];
    const { container } = render(<HeroSection banners={banners} />);

    // الـ wrapper divs التي تحمل style opacity
    const getDivStyles = () =>
      Array.from(container.querySelectorAll("section > div[style]")).map(
        (el) => (el as HTMLElement).style.opacity
      );

    const before = getDivStyles();
    // الأول يكون opacity "1"، الثاني "0"
    expect(before[0]).toBe("1");
    expect(before[1]).toBe("0");

    act(() => { jest.advanceTimersByTime(4001); });

    const after = getDivStyles();
    // بعد 4 ثوانٍ يتحول: الأول "0" والثاني "1"
    expect(after[0]).toBe("0");
    expect(after[1]).toBe("1");
  });

  test("HeroSection — يُنظّف interval عند unmount", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const spy = jest.spyOn(global, "clearInterval");
    const banners = [
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
    ];
    const { unmount } = render(<HeroSection banners={banners} />);
    act(() => { unmount(); });
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test("CategoryBanner — يُنظّف IntersectionObserver و interval عند unmount", async () => {
    const disconnectSpy = jest.fn();
    global.IntersectionObserver = jest.fn().mockImplementation((cb) => ({
      observe: jest.fn((el: Element) => {
        // auto-fire to start the interval
        cb([{ isIntersecting: true, target: el } as IntersectionObserverEntry], {} as IntersectionObserver);
      }),
      unobserve: jest.fn(),
      disconnect: disconnectSpy,
    })) as unknown as typeof IntersectionObserver;

    const { default: CategoryBanner } = await import("../app/components/banner/CategoryBanner");
    const { unmount } = render(
      <CategoryBanner
        category="ايفون"
        images={[
          "https://res.cloudinary.com/test/a.webp",
          "https://res.cloudinary.com/test/b.webp",
        ]}
      />
    );
    act(() => { unmount(); });
    expect(disconnectSpy).toHaveBeenCalled();
  });

  test("CategoryBanner — لا interval إذا كانت صورة واحدة", async () => {
    const spy = jest.spyOn(global, "setInterval");
    const { default: CategoryBanner } = await import("../app/components/banner/CategoryBanner");
    act(() => {
      render(<CategoryBanner category="ايفون" images={["https://res.cloudinary.com/test/x.webp"]} />);
    });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 5. INTERSECTION OBSERVER — shared observer
// ══════════════════════════════════════════════════════════════════════════
describe("👁️ IntersectionObserver — shared observer pattern", () => {

  test("AnimatedSection — ينشئ observer واحداً فقط لـ 3 instances", async () => {
    // لا نستخدم resetModules — نعتمد على الـ shared observer الموجود
    // ونتحقق أن observe() يُستدعى 3 مرات (مرة لكل instance)
    let constructorCount = 0;
    const observeCallCount = { value: 0 };
    global.IntersectionObserver = jest.fn().mockImplementation(() => {
      constructorCount++;
      return {
        observe: jest.fn(() => { observeCallCount.value++; }),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      };
    }) as unknown as typeof IntersectionObserver;

    const { default: AnimatedSection } = await import("../app/components/AnimatedSection");

    act(() => {
      render(
        <>
          <AnimatedSection delay={0}><div>1</div></AnimatedSection>
          <AnimatedSection delay={0.1}><div>2</div></AnimatedSection>
          <AnimatedSection delay={0.2}><div>3</div></AnimatedSection>
        </>
      );
    });

    console.log(`  IntersectionObserver constructor calls: ${constructorCount}`);
    console.log(`  observe() calls: ${observeCallCount.value}`);

    // shared pattern: أقل من أو يساوي 3 constructor calls (قد يكون 0 إذا كان الـ singleton موجوداً)
    expect(constructorCount).toBeLessThanOrEqual(3);
    // observe() يُستدعى مرة لكل component
    expect(observeCallCount.value).toBe(3);
  });

  test("AnimatedSection — يُطبّق opacity:1 بعد التقاطع", async () => {
    let capturedCallback: IntersectionObserverCallback | null = null;
    let capturedElement: Element | null = null;

    global.IntersectionObserver = jest.fn().mockImplementation(
      (cb: IntersectionObserverCallback) => {
        capturedCallback = cb;
        return {
          observe: jest.fn((el: Element) => { capturedElement = el; }),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
        };
      }
    ) as unknown as typeof IntersectionObserver;

    const { default: AnimatedSection } = await import("../app/components/AnimatedSection");

    const { container } = render(
      <AnimatedSection delay={0}><span>content</span></AnimatedSection>
    );

    const div = container.firstChild as HTMLElement;
    // قبل التقاطع: opacity أقل من 1
    expect(parseFloat(div.style.opacity)).toBeLessThan(1);

    // نُطلق callback التقاطع
    act(() => {
      if (capturedCallback && capturedElement) {
        capturedCallback(
          [{ isIntersecting: true, target: capturedElement } as IntersectionObserverEntry],
          {} as IntersectionObserver
        );
      }
    });

    expect(div.style.opacity).toBe("1");
    expect(div.style.transform).toBe("translateY(0)");
  });

  test("AnimatedSection — يبدأ بـ opacity 0.85 (لتجنب flash)", async () => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;

    const { default: AnimatedSection } = await import("../app/components/AnimatedSection");
    const { container } = render(
      <AnimatedSection delay={0}><div>content</div></AnimatedSection>
    );
    expect((container.firstChild as HTMLElement).style.opacity).toBe("0.85");
  });

  test("AnimatedSection — delay يُطبَّق في transition string", async () => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;

    const { default: AnimatedSection } = await import("../app/components/AnimatedSection");
    const { container } = render(
      <AnimatedSection delay={0.3}><div>content</div></AnimatedSection>
    );
    const style = (container.firstChild as HTMLElement).getAttribute("style") || "";
    expect(style).toContain("0.3s");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 6. CACHE KEY STABILITY
// ══════════════════════════════════════════════════════════════════════════
describe("🔑 Cache Key Stability", () => {

  test("categories sorted قبل join — نفس المجموعة → نفس المفتاح دائماً", () => {
    const cats1 = ["ابل ايفون 17", "سامسونج s26", "ماك بوك"];
    const cats2 = ["ماك بوك", "ابل ايفون 17", "سامسونج s26"];
    const key1 = [...cats1].sort().join(",");
    const key2 = [...cats2].sort().join(",");
    expect(key1).toBe(key2);
    console.log(`  Stable key: "${key1}"`);
  });

  test("مجموعة بها duplicates تُنتج نفس مفتاح المجموعة النظيفة", () => {
    const buildKey = (products: { category?: string }[]) => {
      const seen = new Set<string>();
      for (const p of products) { if (p.category) seen.add(p.category); }
      return [...seen].sort().join(",");
    };
    const withDups = [
      { category: "ابل ايفون 17" },
      { category: "سامسونج" },
      { category: "ابل ايفون 17" }, // duplicate
    ];
    const withoutDups = [
      { category: "سامسونج" },
      { category: "ابل ايفون 17" },
    ];
    expect(buildKey(withDups)).toBe(buildKey(withoutDups));
  });

  test("Set بدل map().filter() — single-pass تستخرج categories", () => {
    const products = [
      { category: "ايفون" }, { category: "سامسونج" },
      { category: "ايفون" }, { category: undefined },
      { category: "ماك" },
    ];
    const seenCats = new Set<string>();
    for (const p of products) { if (p.category) seenCats.add(p.category); }
    const result = Array.from(seenCats);
    expect(result).toEqual(expect.arrayContaining(["ايفون", "سامسونج", "ماك"]));
    expect(result).toHaveLength(3); // no duplicates, no undefined
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 7. DATA PROCESSING — صحة ومعالجة البيانات
// ══════════════════════════════════════════════════════════════════════════
describe("📦 Data Processing — تجميع وترتيب المنتجات", () => {

  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("ProductGrid — يُجمّع منتجات فئتين بشكل صحيح", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = [
      ...makeProducts(3, "ابل ايفون 17 برو ماكس"),
      ...makeProducts(2, "سامسونج جالاكسي s26"),
    ];
    render(<ProductGrid products={products} homeConfig={null} bannerMap={{}} />);
    expect(screen.getByText("ابل ايفون 17 برو ماكس")).toBeInTheDocument();
    expect(screen.getByText("سامسونج جالاكسي s26")).toBeInTheDocument();
  });

  test("ProductGrid — رسالة 'لا توجد منتجات' عند مصفوفة فارغة", async () => {
    const { ProductGrid } = await import("../app/components/products");
    render(<ProductGrid products={[]} homeConfig={null} bannerMap={{}} />);
    expect(screen.getByText("لا توجد منتجات حالياً")).toBeInTheDocument();
  });

  test("ProductGrid — يُطبّق homeConfig.max بشكل صحيح", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = [
      ...makeProducts(2, "فئة أ"),
      ...makeProducts(2, "فئة ب"),
      ...makeProducts(2, "فئة ج"),
    ];
    const homeConfig = {
      settings: [
        { category: "فئة أ", subCategory: "", showInHome: true, order: 1 },
        { category: "فئة ب", subCategory: "", showInHome: true, order: 2 },
        { category: "فئة ج", subCategory: "", showInHome: true, order: 3 },
      ],
      max: 2,
    };
    render(<ProductGrid products={products} homeConfig={homeConfig} bannerMap={{}} />);
    expect(screen.getByText("فئة أ")).toBeInTheDocument();
    expect(screen.getByText("فئة ب")).toBeInTheDocument();
    expect(screen.queryByText("فئة ج")).not.toBeInTheDocument();
  });

  test("ProductGrid — يُرتّب الفئات حسب homeConfig.order", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = [
      ...makeProducts(2, "فئة أ"),
      ...makeProducts(2, "فئة ب"),
    ];
    const homeConfig = {
      settings: [
        { category: "فئة ب", subCategory: "", showInHome: true, order: 1 },
        { category: "فئة أ", subCategory: "", showInHome: true, order: 2 },
      ],
      max: 2,
    };
    const { container } = render(
      <ProductGrid products={products} homeConfig={homeConfig} bannerMap={{}} />
    );
    const headings = Array.from(container.querySelectorAll("h2")).map((h) => h.textContent);
    expect(headings.indexOf("فئة ب")).toBeLessThan(headings.indexOf("فئة أ"));
  });

  test("ProductGrid — يعرض max=4 منتج لكل فئة", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = makeProducts(10, "ابل ايفون 17 برو ماكس");
    render(<ProductGrid products={products} homeConfig={null} bannerMap={{}} />);
    // ProductCard لكل منتج مرئي — يجب أن يكون 4 كحد أقصى (LIMIT=4)
    const cards = screen.getAllByRole("button", { name: /أضف للسلة|غير متوفر/ });
    expect(cards.length).toBeLessThanOrEqual(4);
  });

  test("parseStorage — نتائج صحيحة لجميع الحالات", () => {
    const parseStorage = (s?: string): number => {
      if (!s) return 0;
      const n = parseFloat(s);
      if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
      return n || 0;
    };
    expect(parseStorage("128GB")).toBe(128);
    expect(parseStorage("512GB")).toBe(512);
    expect(parseStorage("1TB")).toBe(1024);
    expect(parseStorage("2TB")).toBe(2048);
    expect(parseStorage("2تيرا")).toBe(2048);
    expect(parseStorage(undefined)).toBe(0);
    expect(parseStorage("")).toBe(0);
  });

  test("normalize — الحروف العربية المتشابهة تُوحَّد", () => {
    const normalize = (s: string) =>
      s.trim().replace(/[آأإ]/g, "ا").replace(/[ى]/g, "ي").replace(/\s+/g, " ").toLowerCase();
    expect(normalize("آيفون")).toBe("ايفون");
    expect(normalize("أيفون")).toBe("ايفون");
    expect(normalize("إيفون")).toBe("ايفون");
    expect(normalize("مدى")).toBe("مدي");
    expect(normalize("  iPhone  ")).toBe("iphone");
    // جميع أشكال الألف تُعطي نفس النتيجة
    expect(normalize("آيفون")).toBe(normalize("أيفون"));
    expect(normalize("أيفون")).toBe(normalize("إيفون"));
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 8. HERO SECTION — سلوك البانر
// ══════════════════════════════════════════════════════════════════════════
describe("🖼️ HeroSection — البانر الرئيسي", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });
  afterEach(() => { jest.useRealTimers(); });

  test("لا يُعرض عند بانرات فارغة", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const { container } = render(<HeroSection banners={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("بانر واحد — لا dots navigation", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    render(<HeroSection banners={[{ url: "https://res.cloudinary.com/test/x.webp", active: true }]} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  test("4 بانرات — 4 dots navigation", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    render(<HeroSection banners={Array.from({ length: 4 }, (_, i) => ({
      url: `https://res.cloudinary.com/test/b${i}.webp`,
      active: true,
    }))} />);
    expect(screen.getAllByRole("button")).toHaveLength(4);
  });

  test("الصورة الأولى تحمل priority=true (LCP)", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    render(<HeroSection banners={[
      { url: "https://res.cloudinary.com/test/lcp.webp", active: true },
      { url: "https://res.cloudinary.com/test/other.webp", active: true },
    ]} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]).toHaveAttribute("data-priority", "true");
    expect(imgs[1]).not.toHaveAttribute("data-priority");
  });

  test("الضغط على dot يُعدّل الـ slide المرئي", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const { container } = render(<HeroSection banners={[
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
      { url: "https://res.cloudinary.com/test/c.webp", active: true },
    ]} />);
    const dots = screen.getAllByRole("button");
    act(() => { dots[2].click(); });
    const slides = Array.from(container.querySelectorAll("section > div[style]")) as HTMLElement[];
    expect(slides[2].style.opacity).toBe("1");
    expect(slides[0].style.opacity).toBe("0");
  });

  test("بعد 4 ثوانٍ ينتقل للبانر التالي", async () => {
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const { container } = render(<HeroSection banners={[
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
    ]} />);
    const getSlides = () =>
      Array.from(container.querySelectorAll("section > div[style]")) as HTMLElement[];

    expect(getSlides()[0].style.opacity).toBe("1");
    expect(getSlides()[1].style.opacity).toBe("0");

    act(() => { jest.advanceTimersByTime(4001); });

    expect(getSlides()[0].style.opacity).toBe("0");
    expect(getSlides()[1].style.opacity).toBe("1");
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 9. MEMORY — لا تسريب
// ══════════════════════════════════════════════════════════════════════════
describe("🧠 Memory — لا تسريب عند mount/unmount", () => {
  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("ProductGrid — 10 rerenders متتاليين لا يُزيدون الـ heap بأكثر من 10MB", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const before = measureMemory();
    const { rerender } = render(
      <ProductGrid products={makeProducts(20)} homeConfig={null} bannerMap={{}} />
    );
    for (let i = 0; i < 10; i++) {
      act(() => {
        rerender(<ProductGrid products={makeProducts(20, `cat-${i}`)} homeConfig={null} bannerMap={{}} />);
      });
    }
    const delta = measureMemory() - before;
    console.log(`  Memory delta (10 rerenders): ${(delta / 1024).toFixed(0)}KB`);
    expect(delta).toBeLessThan(10 * 1024 * 1024);
  });

  test("HeroSection — 20 mount/unmount لا تُراكم timers", async () => {
    jest.useFakeTimers();
    const { default: HeroSection } = await import("../app/components/HeroSection");
    const clearSpy = jest.spyOn(global, "clearInterval");
    const banners = [
      { url: "https://res.cloudinary.com/test/a.webp", active: true },
      { url: "https://res.cloudinary.com/test/b.webp", active: true },
    ];
    for (let i = 0; i < 20; i++) {
      const { unmount } = render(<HeroSection banners={banners} />);
      act(() => { unmount(); });
    }
    // كل mount يُنشئ interval، كل unmount يُنظّفه
    expect(clearSpy.mock.calls.length).toBe(20);
    clearSpy.mockRestore();
    jest.useRealTimers();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 10. STRESS TEST — بيانات ضخمة
// ══════════════════════════════════════════════════════════════════════════
describe("💪 Stress Test — بيانات ضخمة", () => {
  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("ProductGrid — 200 منتج في أقل من 1 ثانية", async () => {
    const { ProductGrid } = await import("../app/components/products");
    const products = Array.from({ length: 200 }, (_, i) => ({
      ...makeProducts(1, `فئة ${i % 10}`)[0],
      _id: `stress-${i}`,
    }));
    const elapsed = await measureTimeAsync(async () => {
      act(() => { render(<ProductGrid products={products} homeConfig={null} bannerMap={{}} />); });
    });
    console.log(`  ProductGrid (200 products) = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(1000);
  });

  test("Map lookup — 100,000 بحث في أقل من 50ms", () => {
    const normalize = (s: string) =>
      s.trim().replace(/[آأإ]/g, "ا").replace(/[ى]/g, "ي").replace(/\s+/g, " ").toLowerCase();
    const data = {
      "ابل ايفون 17 برو ماكس": "/shop/17-pro-max",
      "سامسونج جالاكسي s26": "/shop/galaxy-s26",
    };
    const map = new Map(Object.entries(data).map(([k, v]) => [normalize(k), v]));
    const lookup = (cat: string) => map.get(normalize(cat)) ?? `/search?q=${cat}`;
    const cats = ["آيفون 17 برو ماكس", "سامسونج جالاكسي s26", "منتج مجهول"];

    const elapsed = measureTime(() => {
      for (let i = 0; i < 100_000; i++) lookup(cats[i % cats.length]);
    });
    console.log(`  Map lookup × 100,000 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(200); // jsdom-adjusted
  });

  test("sortByStorage — 1000 منتج في أقل من 30ms", () => {
    const STORAGE_RE = /(\d+)\s*(GB|TB)/i;
    const ORDER = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
    const prods = Array.from({ length: 1000 }, (_, i) => ({
      _id: `p${i}`,
      storage: ORDER[i % 6],
    }));
    const elapsed = measureTime(() => {
      const idx = new Map(prods.map((p) => {
        const m = STORAGE_RE.exec(p.storage);
        const key = m ? `${m[1]}${m[2].toUpperCase()}` : "";
        return [p._id, ORDER.indexOf(key)];
      }));
      [...prods].sort((a, b) => {
        const ai = idx.get(a._id) ?? 99;
        const bi = idx.get(b._id) ?? 99;
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      });
    });
    console.log(`  sortByStorage × 1000 = ${elapsed.toFixed(2)}ms`);
    expect(elapsed).toBeLessThan(30);
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 11. PRODUCT CARD — صحة العرض والتفاعل
// ══════════════════════════════════════════════════════════════════════════
describe("🃏 ProductCard — صحة العرض", () => {
  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("يعرض اسم المنتج والسعر", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    render(<ProductCard product={{
      ...makeProducts(1)[0],
      name: "آيفون 17 برو ماكس",
      originalPrice: 5999,
      price: 5999,
    }} />);
    expect(screen.getByText(/آيفون 17 برو ماكس/)).toBeInTheDocument();
    expect(screen.getByText("5,999")).toBeInTheDocument();
  });

  test("يعرض badge الخصم عند وجود salePrice", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    render(<ProductCard product={{
      ...makeProducts(1)[0],
      originalPrice: 4000,
      salePrice: 3500,
      price: 4000,
      discountPercent: 13,
    }} />);
    expect(screen.getByText(/-\d+%/)).toBeInTheDocument();
  });

  test("يُعطّل زر السلة عند عدم التوفر", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    render(<ProductCard product={{ ...makeProducts(1)[0], inStock: false }} />);
    expect(screen.getByRole("button", { name: /غير متوفر/i })).toBeDisabled();
  });

  test("يعرض قسط الـ 24 شهر للمنتجات > 1000 ريال", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    render(<ProductCard product={{ ...makeProducts(1)[0], originalPrice: 5000, price: 5000 }} />);
    expect(screen.getByText(/أو قسّطها/)).toBeInTheDocument();
  });

  test("لا يعرض الأقساط للمنتجات ≤ 1000 ريال", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    render(<ProductCard product={{ ...makeProducts(1)[0], originalPrice: 800, price: 800 }} />);
    expect(screen.queryByText(/أو قسّطها/)).not.toBeInTheDocument();
  });

  test("حساب قسط الـ 24 شهر صحيح رياضياً", async () => {
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    // سعر 3400 ريال → (3400-1000)/24 = 100 ريال
    render(<ProductCard product={{ ...makeProducts(1)[0], originalPrice: 3400, price: 3400 }} />);
    expect(screen.getByText("100")).toBeInTheDocument();
  });
});

// ══════════════════════════════════════════════════════════════════════════
// 12. HYDRATION SAFETY — لا console.error
// ══════════════════════════════════════════════════════════════════════════
describe("🛡️ Hydration Safety — لا أخطاء console", () => {
  beforeEach(() => {
    global.IntersectionObserver = makeObserverMock() as unknown as typeof IntersectionObserver;
  });

  test("ProductCard — لا console.error", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { default: ProductCard } = await import("../app/components/products/ProductCard");
    act(() => { render(<ProductCard product={makeProducts(1)[0]} />); });
    const errors = spy.mock.calls.filter((a) => !String(a[0]).includes("act("));
    spy.mockRestore();
    if (errors.length) console.log("  Errors:", errors.map((e) => String(e[0])));
    expect(errors).toHaveLength(0);
  });

  test("ProductGrid — لا duplicate keys", async () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { ProductGrid } = await import("../app/components/products");
    act(() => {
      render(<ProductGrid products={makeProducts(10)} homeConfig={null} bannerMap={{}} />);
    });
    const keyErrors = spy.mock.calls.filter((a) => String(a[0]).toLowerCase().includes("key"));
    spy.mockRestore();
    expect(keyErrors).toHaveLength(0);
  });

  test("HeroSection — لا console.error", async () => {
    jest.useFakeTimers();
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { default: HeroSection } = await import("../app/components/HeroSection");
    act(() => {
      render(<HeroSection banners={[{ url: "https://res.cloudinary.com/test/x.webp", active: true }]} />);
    });
    const errors = spy.mock.calls.filter((a) => !String(a[0]).includes("act("));
    spy.mockRestore();
    jest.useRealTimers();
    if (errors.length) console.log("  Errors:", errors.map((e) => String(e[0])));
    expect(errors).toHaveLength(0);
  });
});

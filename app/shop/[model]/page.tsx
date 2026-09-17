import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCachedProducts } from "../../lib/products-cache";
import ShopModelClient from "./ShopModelClient";
import IPhone18ComingSoon from "./IPhone18ComingSoon";
import type { Product } from "../../components/products/types";

export const revalidate = 3600;

// ─── Module-level constants (created once, not per-request) ───────────────────

// Pre-compiled regex — avoids re-compiling inside the sort comparator N² times
const STORAGE_RE = /(\d+)\s*(GB|TB|جيجابايت|تيرابايت)/i;
const STORAGE_ORDER = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];

/** Extract a canonical storage string from a product — result is cached by caller */
function getStorageKey(p: Product): string {
  const src = p.storage ?? p.name ?? "";
  const m = STORAGE_RE.exec(src);
  if (!m) return "";
  const unit = m[2].replace(/جيجابايت/i, "GB").replace(/تيرابايت/i, "TB").toUpperCase();
  return `${m[1]}${unit}`;
}

/**
 * Sort products by storage capacity in O(n log n) with O(n) pre-computation.
 * The original code called getStorage() twice per comparison = O(n² × regex).
 */
function sortByStorage(arr: Product[]): Product[] {
  // Pre-compute storage index for each product — O(n)
  const indices = new Map<string, number>(
    arr.map((p) => [p._id, STORAGE_ORDER.indexOf(getStorageKey(p))])
  );
  return [...arr].sort((a, b) => {
    const ai = indices.get(a._id) ?? 99;
    const bi = indices.get(b._id) ?? 99;
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

const IPHONE18_RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-12T23:00:00+03:00"
);

const IPHONE18_MODELS: Record<string, { name: string; keywords: string[]; slides?: string[]; hero: HeroSlide[] }> = {
  "18-pro-max": {
    name: "آيفون 18 برو ماكس",
    keywords: ["18 برو ماكس", "18 pro max", "18promax"],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/deec23e7-4e69-4b8f-8b56-8900ec23bba0.webp",
        title: "iPhone 18 Pro Max",
        subtitle: "محترف بمستوى مختلف. أربعة ألوان خلابة، مقاسان مذهلان، وتصميم واحد من الألومنيوم المتين.",
        highlight: "محترف بمستوى مختلف"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/84ca1c8c-c904-468c-a590-6f2baa31877d.webp",
        title: "كاميرا رئيسية 48MP Fusion",
        subtitle: "فتحة عدسة متغيرة تمنحك عمق مجال مذهل وصوراً وفيديوهات محسّنة في الإضاءة الخافتة.",
        highlight: "فتحة عدسة متغيرة"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126713/62c2df83-0f67-463c-bef1-745faa4550b6.webp",
        title: "ما يطلبه المحترفون",
        subtitle: "شريحة A20 Pro المبرّدة بالبخار، أداء استثنائي، وشحن سلكي أسرع لتجربة احترافية بلا حدود.",
        highlight: "A20 Pro"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/ea9233d4-4fb9-419f-a9c8-7e76a13d16a5.webp",
        title: "كاميرا رئيسية جديدة",
        subtitle: "فتحة العدسة المتغيرة تتكيف تلقائياً لتعزيز الأداء في الإضاءة الخافتة وتحسين عمق المجال.",
        highlight: "لقطات تخطف الأنظار"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126695/6e161ae0-867a-424a-b7ed-ffca26b5a76f.webp",
        title: "Dynamic Island بتصميم جديد",
        subtitle: "تتبّع لغاية ثلاثة أنشطة مباشرة في الوقت نفسه واطّلع على المزيد من المعلومات بلمحة.",
        highlight: "ثلاثة أنشطة مباشرة"
      },

    ],
  },
  "18-pro": {
    name: "آيفون 18 برو",
    keywords: ["18 برو", "18 pro"],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/deec23e7-4e69-4b8f-8b56-8900ec23bba0.webp",
        title: "iPhone 18 Pro",
        subtitle: "محترف بمستوى مختلف. أربعة ألوان خلابة، مقاسان مذهلان، وتصميم واحد من الألومنيوم المتين.",
        highlight: "محترف بمستوى مختلف"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/84ca1c8c-c904-468c-a590-6f2baa31877d.webp",
        title: "كاميرا رئيسية 48MP Fusion",
        subtitle: "فتحة عدسة متغيرة تمنحك عمق مجال مذهل وصوراً وفيديوهات محسّنة في الإضاءة الخافتة.",
        highlight: "فتحة عدسة متغيرة"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126713/62c2df83-0f67-463c-bef1-745faa4550b6.webp",
        title: "ما يطلبه المحترفون",
        subtitle: "شريحة A20 Pro المبرّدة بالبخار، أداء استثنائي، وشحن سلكي أسرع لتجربة احترافية بلا حدود.",
        highlight: "A20 Pro"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126696/ea9233d4-4fb9-419f-a9c8-7e76a13d16a5.webp",
        title: "كاميرا رئيسية جديدة",
        subtitle: "فتحة العدسة المتغيرة تتكيف تلقائياً لتعزيز الأداء في الإضاءة الخافتة وتحسين عمق المجال.",
        highlight: "لقطات تخطف الأنظار"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789126695/6e161ae0-867a-424a-b7ed-ffca26b5a76f.webp",
        title: "Dynamic Island بتصميم جديد",
        subtitle: "تتبّع لغاية ثلاثة أنشطة مباشرة في الوقت نفسه واطّلع على المزيد من المعلومات بلمحة.",
        highlight: "ثلاثة أنشطة مباشرة"
      },

    ],
  },
  "18-duo": {
    name: "آيفون 18 دو",
    keywords: ["18 دو", "18 duo"],
    slides: [
      "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/background-removed.webp",
      "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/c5a8d90b-ec81-4680-823f-1b460f0dc8ea.webp",
    ],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/background-removed.webp",
        title: "iPhone Duo",
        subtitle: "أول iPhone قابل للطيّ، بتصميم نحيف يمنحك أكبر شاشة iPhone على الإطلاق.",
        highlight: "أول iPhone قابل للطيّ"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789095830/c5a8d90b-ec81-4680-823f-1b460f0dc8ea.webp",
        title: "شاشة واسعة.. تجربة أكبر",
        subtitle: "شاشة ريتنا سوبر XDR مقاس 7.6 إنش، ومساحة عرض أكبر بنسبة 50% من iPhone 18 Pro Max.",
        highlight: "شاشة 7.6 إنش"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789129091/59a7b5e3-c814-4f66-8069-1887a39aa071.webp",
        title: "تجربة iPhone بطرق جديدة",
        subtitle: "تصميم مرن متعدد الوضعيات مع iOS 27 أعيد تصوّره للتنقل بسلاسة بين الشاشات والزوايا.",
        highlight: "تصميم قابل للطيّ"
      },{
  image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789129092/472da8f7-71d6-4978-ad76-27cbfa1b0103.webp",
  title: "شكل جديد ليومك",
  subtitle: "افتحه للشاشة الكبيرة، اطوه للمشاهدة، وثبّته بالزاوية التي تناسبك.",
  highlight: "مرونة بلا حدود"
},
    ],
  },
};

interface HeroSlide {
  image: string;
  title: string;
  subtitle: string;
  highlight?: string;
}

const MODEL_MAP: Record<
  string,
  { label: string; keywords: string[]; hero: HeroSlide[] }
> = {
  "17-pro-max": {
    label: "آيفون 17 برو ماكس",
    keywords: ["17 برو ماكس", "17 pro max", "17promax"],
    hero: [
      { image: "/iphone-17-promax/i-hero1.webp", title: "تصميم بريميوم من ألومنيوم", subtitle: "تصميم بقطعة واحدة من الألومنيوم المشكّل بالحرارة لقدرات احترافية استثنائية.", highlight: "احترافية استثنائية" },
      { image: "/iphone-17-promax/i-hero2.webp", title: "أداء نار مع شريحة A19 Pro", subtitle: "تبريد بالبخار، سرعة فائقة، وبطارية تدوم أكثر", highlight: "سرعة فائقة" },
      { image: "/iphone-17-promax/i-hero3.webp", title: "كاميرا احترافية.. تفاصيل مذهلة", subtitle: "ثلاث كاميرات 48MP Fusion مع أطول زووم في تاريخ iPhone", highlight: "أطول زووم" },
      { image: "/iphone-17-promax/i-hero4.webp", title: "كاميرا Center Stage.. سيلفي أذكى", subtitle: "تأطير مرن، صور جماعية أفضل، وتجربة سيلفي أكثر ذكاءً", highlight: "أكثر ذكاءً" },
      { image: "/iphone-17-promax/i-hero5.webp", title: "iOS 26.. ستايل جديد وتجربة أجمل", subtitle: "تصميم جديد، مزايا أكثر، وتجربة استخدام أكثر سلاسة", highlight: "أكثر سلاسة" },
      { image: "/iphone-17-promax/i-hero6.webp", title: "Apple Intelligence.. ذكاء يساعدك أكثر", subtitle: "إنشاء الصور، الترجمة المباشرة، ومزايا ذكية تجعل يومك أسهل", highlight: "يومك أسهل" },
    ],
  },
  "17-pro": {
    label: "آيفون 17 برو",
    keywords: ["17 برو", "17 pro"],
    hero: [
      { image: "/iphone-17-promax/i-hero1.webp", title: "تصميم بريميوم من ألومنيوم", subtitle: "تصميم بقطعة واحدة من الألومنيوم المشكّل بالحرارة لقدرات احترافية استثنائية.", highlight: "احترافية استثنائية" },
      { image: "/iphone-17-promax/i-hero2.webp", title: "أداء نار مع شريحة A19 Pro", subtitle: "تبريد بالبخار، سرعة فائقة، وبطارية تدوم أكثر", highlight: "سرعة فائقة" },
      { image: "/iphone-17-promax/i-hero3.webp", title: "كاميرا احترافية.. تفاصيل مذهلة", subtitle: "ثلاث كاميرات 48MP Fusion مع أطول زووم في تاريخ iPhone", highlight: "أطول زووم" },
      { image: "/iphone-17-promax/i-hero4.webp", title: "كاميرا Center Stage.. سيلفي أذكى", subtitle: "تأطير مرن، صور جماعية أفضل، وتجربة سيلفي أكثر ذكاءً", highlight: "أكثر ذكاءً" },
      { image: "/iphone-17-promax/i-hero5.webp", title: "iOS 26.. ستايل جديد وتجربة أجمل", subtitle: "تصميم جديد، مزايا أكثر، وتجربة استخدام أكثر سلاسة", highlight: "أكثر سلاسة" },
      { image: "/iphone-17-promax/i-hero6.webp", title: "Apple Intelligence.. ذكاء يساعدك أكثر", subtitle: "إنشاء الصور، الترجمة المباشرة، ومزايا ذكية تجعل يومك أسهل", highlight: "يومك أسهل" },
    ],
  },
  "17-air": {
    label: "آيفون 17 إير",
    keywords: ["17 اير", "17 إير", "17 air"],
    hero: [
      {
        image: "/iphone-17-air/i-hero1.webp",
        title: "أنحف iPhone على الإطلاق",
        subtitle: "في قلبه قوة عملاق.",
        highlight: "أنحف"
      },
      {
        image: "/iphone-17-air/i-hero2.webp",
        title: "كاميرا Center Stage",
        subtitle: "تأطير مرن. سيلفي جماعية أذكى.",
        highlight: "Center Stage"
      },
      {
        image: "/iphone-17-air/i-hero3.webp",
        title: "كاميرا Fusion 48MP",
        subtitle: "كاميرتان متطورتان في كاميرا واحدة.",
        highlight: "48MP"
      },
      {
        image: "/iphone-17-air/i-hero4.webp",
        title: "iOS 26",
        subtitle: "ستايل جديد. يبهرك بالمزيد.",
        highlight: "ستايل جديد"
      },
      {
        image: "/iphone-17-air/i-hero5.webp",
        title: "شريحة A19 Pro",
        subtitle: "قوة هائلة وبطارية تدوم طوال اليوم.",
        highlight: "A19 Pro"
      },

    ],
  },
  "17": {
    label: "آيفون 17",
    keywords: ["ايفون 17", "آيفون 17", "iphone 17"],
    hero: [
      {
        image: "/iphone-17/i-hero1.webp",
        title: "ملك جمال اللون.",
        subtitle: "ألوان تخطف الأنظار",
        highlight: "تخطف الأنظار"
      },
      {
        image: "/iphone-17/i-hero4.webp",
        title: "الجديد، بالمختصر المفيد.",
        subtitle: "ستايل جديد. يبهرك بالمزيد.",
        highlight: "يبهرك بالمزيد"
      },
      {
        image: "/iphone-17/i-hero2.webp",
        title: "أصلب. وإلى القلب أقرب.",
        subtitle: "تصميم ينفرد بخطوط انسيابية",
        highlight: "أصلب"
      },
      {
        image: "/iphone-17/i-hero5.webp",
        title: "شاشة أكبر. تجربة أمتع.",
        subtitle: "سوبر ريتنا XDR مع ProMotion حتى 120Hz",
        highlight: "تجربة أمتع"
      },
      {
        image: "/iphone-17/i-hero3.webp",
        title: "من بعيد أو قريب، يبهرك.",
        subtitle: "نظام كاميرا Fusion مزدوجة 48MP",
        highlight: "يبهرك عندما تصوّر"
      },
    ],
  },
  "16-pro-max": {
    label: "آيفون 16 برو ماكس",
    keywords: ["16 برو ماكس", "16 pro max", "16promax"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788649290/d7b5e81a-a3de-42fd-b73e-0df0c2b4cb11.jpg", title: "آيفون 16 برو ماكس", subtitle: "قوة استثنائية في تصميم احترافي.", highlight: "احترافي" },
    ],
  },
  "16-pro": {
    label: "آيفون 16 برو",
    keywords: ["16 برو", "16 pro"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788649290/768732fa-f71e-47f6-a9cb-a8578dd4bff0.jpg", title: "آيفون 16 برو", subtitle: "أداء احترافي في حجم مثالي.", highlight: "احترافي" },
    ],
  },
  "16-plus": {
    label: "آيفون 16 بلس",
    keywords: ["16 بلس", "16 plus"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788643539/7bba49c7-f75e-4a42-a2cf-bff4ce3f6f9e.webp", title: "آيفون 16 بلس", subtitle: "شاشة كبيرة وبطارية تدوم أطول.", highlight: "بطارية تدوم" },
    ],
  },
  "16": {
    label: "آيفون 16",
    keywords: ["ايفون 16", "آيفون 16", "iphone 16"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788643537/e5241fbd-5d6a-4011-a5d7-8dda50c6e722.webp", title: "آيفون 16", subtitle: "تجربة iPhone الجديدة بالكامل.", highlight: "الجديدة" },
    ],
  },
  "15-pro-max": {
    label: "آيفون 15 برو ماكس",
    keywords: ["15 برو ماكس", "15 pro max", "15promax"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788649290/d7b5e81a-a3de-42fd-b73e-0df0c2b4cb11.jpg", title: "آيفون 15 برو ماكس", subtitle: "تيتانيوم. قوة. احتراف.", highlight: "تيتانيوم" },
    ],
  },
  "15-pro": {
    label: "آيفون 15 برو",
    keywords: ["15 برو", "15 pro"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788649290/d7b5e81a-a3de-42fd-b73e-0df0c2b4cb11.jpg", title: "آيفون 15 برو", subtitle: "تيتانيوم خفيف وأداء لا يُضاهى.", highlight: "تيتانيوم" },
    ],
  },
  "15-plus": {
    label: "آيفون 15 بلس",
    keywords: ["15 بلس", "15 plus"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788643538/d55b764c-e695-428a-99c9-a0768cd173e7.webp", title: "آيفون 15 بلس", subtitle: "شاشة ضخمة وبطارية استثنائية.", highlight: "بطارية استثنائية" },
    ],
  },
  "15": {
    label: "آيفون 15",
    keywords: ["ايفون 15", "آيفون 15", "iphone 15"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788643538/d55b764c-e695-428a-99c9-a0768cd173e7.webp", title: "آيفون 15", subtitle: "Dynamic Island وكاميرا 48MP.", highlight: "Dynamic Island" },
    ],
  },


  // samsong
  "galaxy-s26-ultra": {
    label: "سامسونج جالاكسي اس 26 الترا",
    keywords: ["s26 ultra", "galaxy s26 ultra", "اس 26 الترا", "جالاكسي s26 ultra", "s26 ألترا"],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788911909/0615c3d5-1eb8-4a51-bcf4-ff687019d7fd.webp",
        title: "Galaxy S26 Ultra",
        subtitle: "هاتف الذكاء الاصطناعي الذي يرتقي بتجربتك اليومية.",
        highlight: "ذكاء استثنائي"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788916374/dd2adde7-15a9-4cbc-9ebd-ad4bd6ed31a6.webp",
        title: "خصوصيتك بين يديك",
        subtitle: "شاشة الخصوصية تخفي محتواك عن أعين المتطفلين بلمسة واحدة.",
        highlight: "خصوصية ذكية"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788916388/19c4ef91-bf01-4b56-bfba-45c75bd9db2a.webp",
        title: "التصوير الليلي بمستوى جديد",
        subtitle: "كاميرا 200MP بفتحة F1.4 لصور وفيديوهات أكثر وضوحاً في الإضاءة المنخفضة.",
        highlight: "200MP"
      },
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788911909/b2ef9e0b-f0c0-4a8b-9862-5ea47bde417f.webp",
        title: "أداء يتخطى الحدود",
        subtitle: "معالج Snapdragon 8 Elite Gen 5 المخصص لـ Galaxy مع أداء أسرع للذكاء الاصطناعي والألعاب.",
        highlight: "أداء أقوى"
      }
    ],
  },
  "galaxy-s26-plus": {
    label: "سامسونج جالاكسي اس 26 بلس",
    keywords: ["s26+", "s26 plus", "galaxy s26+", "اس 26 بلس"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788914599/ecbbc1a9-042c-4237-b19c-4d5ee549e4ea.jpg", title: "سامسونج جالاكسي اس 26 بلس", subtitle: "شاشة أكبر وبطارية أقوى.", highlight: "بطارية أقوى" },
    ],
  },
  "galaxy-s26": {
    label: "سامسونج جالاكسي اس 26",
    keywords: ["سامسونج جالاكسي s26"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1788914599/c26f2256-2559-4cad-ba65-8bd6f14f654e.jpg", title: "سامسونج جالاكسي اس 26", subtitle: "تجربة سامسونج الجديدة بالكامل.", highlight: "الجديدة" },
    ],
  },
  "galaxy-s25-ultra": {
    label: "سامسونج جالاكسي اس 25 الترا",
    keywords: ["s25 ultra", "galaxy s25 ultra", "اس 25 الترا", "جالاكسي s25 ultra"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789004108/774ae890-ae7b-40b8-ade9-78f654fffe58.webp", title: "سامسونج جالاكسي اس 25 الترا", subtitle: "قوة استثنائية وقلم S Pen مدمج.", highlight: "S Pen" },
    ],
  },
  "galaxy-s25-plus": {
    label: "سامسونج جالاكسي اس 25 بلس",
    keywords: ["s25+", "s25 plus", "galaxy s25+", "اس 25 بلس"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789004307/04d2f2c8-9771-49f1-80db-48d78879e449.webp", title: "سامسونج جالاكسي اس 25 بلس", subtitle: "شاشة أكبر وأداء أقوى.", highlight: "أداء أقوى" },
    ],
  },
  "galaxy-s25": {
    label: "سامسونج جالاكسي اس 25",
    keywords: ["galaxy s25", "جالاكسي s25", "اس 25"],
    hero: [
      { image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789004307/04d2f2c8-9771-49f1-80db-48d78879e449.webp", title: "سامسونج جالاكسي اس 25", subtitle: "تجربة سامسونج المتكاملة.", highlight: "المتكاملة" },
    ],
  },


  // laptops
  "macbook-air": {
    label: "ماك بوك إير",
    keywords: ["macbook air", "ماك بوك اير", "ماك بوك إير", "macbook إير", "macbook اير"],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789069001/f4719e94-c9df-4ebf-b964-fe4bf4e59194.webp",
        title: "ماك بوك إير",
        subtitle: "رفيع، خفيف، وقوي بشريحة Apple Silicon.",
        highlight: "Apple Silicon",
      }, {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789069001/32299b11-bd3e-46af-b108-218094400e12.webp",
        title: "ماك بوك إير M4",
        subtitle: "أداء استثنائي، تصميم نحيف، وعمر بطارية يدوم طوال اليوم.",
        highlight: "شريحة Apple M4",
      },

    ],
  },
  "macbook-pro": {
    label: "ماك بوك برو",
    keywords: ["macbook pro", "ماك بوك برو", "macbook برو"],
    hero: [
      {
        image: "https://res.cloudinary.com/bzwltpqf/image/upload/v1789078427/78121b46-0537-4b0a-8783-afb799421d91.webp",
        title: "ماك بوك برو",
        subtitle: "أداء احترافي لا يُضاهى مع شريحة M-series.",
        highlight: "M-series",
      },
    ],
  },

};

export async function generateStaticParams() {
  return [
    ...Object.keys(MODEL_MAP).map((model) => ({ model })),
    ...Object.keys(IPHONE18_MODELS).map((model) => ({ model })),
  ];
}

// Pre-computed Sets for O(1) lookup instead of Array.includes() O(n)
const PRO_ONLY_MODELS = new Set(["17-pro", "16-pro", "15-pro", "14-pro"]);
const BASE_ONLY_MODELS = new Set(["17", "16", "15"]);
const ULTRA_ONLY_MODELS = new Set(["galaxy-s26-ultra", "galaxy-s25-ultra"]);
const GALAXY_PLUS_MODELS = new Set(["galaxy-s26-plus", "galaxy-s25-plus"]);
const GALAXY_BASE_MODELS = new Set(["galaxy-s26", "galaxy-s25"]);

export default async function ShopModelPage({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model } = await params;

  // ── iPhone 18 branch ──────────────────────────────────────────────────────
  if (IPHONE18_MODELS[model]) {
    const cfg = IPHONE18_MODELS[model];
    const isOver = Date.now() >= IPHONE18_RESERVATION_DATE.getTime();

    if (!isOver) {
      return <IPhone18ComingSoon modelName={cfg.name} slides={cfg.slides} />;
    }

    const allProducts: Product[] = await getCachedProducts();
    const isProOnly = model === "18-pro";

    // Pre-normalize keywords once — avoids kw.toLowerCase() in the hot loop
    const kwLower = cfg.keywords.map((kw) => kw.toLowerCase());

    const products = allProducts.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const cat  = (p.category || "").toLowerCase();
      const matches = kwLower.some((kw) => name.includes(kw) || cat.includes(kw));
      if (!matches) return false;
      if (isProOnly) {
        return !name.includes("ماكس") && !name.includes("max") &&
               !cat.includes("ماكس")  && !cat.includes("max");
      }
      return true;
    });
    return <ShopModelClient products={products} modelName={cfg.name} hero={cfg.hero ?? []} />;
  }

  // ── Standard model branch ─────────────────────────────────────────────────
  const config = MODEL_MAP[model];
  if (!config) notFound();

  const allProducts: Product[] = await getCachedProducts();

  // Pre-normalize keywords once — avoids repeated .toLowerCase() per product per keyword
  const kwLower = config.keywords.map((kw) => kw.toLowerCase());

  const products = allProducts.filter((p) => {
    const name = (p.name || "").toLowerCase();
    const cat  = (p.category || "").toLowerCase();
    return kwLower.some((kw) => name.includes(kw) || cat.includes(kw));
  });

  // ── Sub-model filtering (single pass, pre-lowercased) ────────────────────
  let filtered: Product[];

  if (PRO_ONLY_MODELS.has(model)) {
    filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return !name.includes("ماكس") && !name.includes("max");
    });
  } else if (BASE_ONLY_MODELS.has(model)) {
    filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return (
        !name.includes("برو") && !name.includes("pro") &&
        !name.includes("بلس") && !name.includes("plus") &&
        !name.includes("اير") && !name.includes("إير") && !name.includes("air")
      );
    });
  } else if (ULTRA_ONLY_MODELS.has(model)) {
    filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return name.includes("ultra") || name.includes("الترا") || name.includes("ألترا");
    });
  } else if (GALAXY_PLUS_MODELS.has(model)) {
    filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      return (name.includes("plus") || name.includes("بلس")) &&
             !name.includes("ultra") && !name.includes("الترا") && !name.includes("ألترا");
    });
  } else if (GALAXY_BASE_MODELS.has(model)) {
    filtered = products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const cat  = (p.category || "").toLowerCase();
      return (
        !name.includes("ultra") && !name.includes("الترا") && !name.includes("ألترا") &&
        !name.includes("plus")  && !name.includes("بلس") &&
        !cat.includes("ultra")  && !cat.includes("الترا") && !cat.includes("ألترا") &&
        !cat.includes("plus")   && !cat.includes("بلس")
      );
    });
  } else {
    filtered = products;
  }

  return (
    <ShopModelClient
      products={sortByStorage(filtered)}
      modelName={config.label}
      hero={config.hero}
    />
  );
}

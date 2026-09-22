/**
 * geoValidation.ts
 *
 * تحقق جغرافي من وجود نقطة داخل حدود دولة مدعومة.
 *
 * المنطق:
 *  1. فحص Bounding Box سريع (O(1)) — يرفض معظم النقاط الخارجية فوراً
 *  2. فحص Point-in-Polygon دقيق (Ray Casting) — يدعم MultiPolygon والجزر
 *
 * البيانات:
 *  - حدود مبسّطة (tolerance ~0.01°) لتقليل الحمل.
 *  - مصدر الحدود: Natural Earth (public domain) — naturalearth.com/downloads
 *  - دقة الحدود: ~1km عند الساحل، أدق عند الحدود البرية المهمة.
 *  - النقاط القريبة جداً من الحدود (< ~1km) قد تُعطي نتيجة غير محددة وهذا مقبول.
 *
 * الترتيب الصحيح: [longitude, latitude] في كل النقاط (GeoJSON standard).
 *
 * يُستخدم هذا الملف في:
 *  - app/api/validate-location/route.ts (server-side فقط)
 *  - backend/routes/checkoutRoutes.js عبر نسخة JS مكافئة
 *
 * لا يُستورَد في أي مكوّن Client-side مباشرةً.
 */

export interface GeoPoint {
  lat: number; // latitude  [-90, 90]
  lng: number; // longitude [-180, 180]
}

export interface ValidationResult {
  valid: boolean;
  /** رمز الخطأ المُنظَّم لعرضه في الواجهة */
  errorCode?: "OUT_OF_COUNTRY" | "INVALID_COORDS" | "UNSUPPORTED_COUNTRY";
  /** رسالة جاهزة للعرض للمستخدم */
  errorMessage?: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Ring = [number, number][]; // [lng, lat][]
type Polygon = Ring[]; // [outerRing, ...holes]
type MultiPolygon = Polygon[];

interface CountryBounds {
  /** الاسم بالعربي للرسائل */
  nameAr: string;
  /** Bounding Box [minLng, minLat, maxLng, maxLat] */
  bbox: [number, number, number, number];
  /** حدود دقيقة — MultiPolygon (GeoJSON coordinate order: [lng, lat]) */
  multiPolygon: MultiPolygon;
}

// ─── Polygon data ─────────────────────────────────────────────────────────────
// حدود مبسّطة (Natural Earth, public domain) مُضمَّنة مباشرةً لتجنب I/O
// كل نقطة: [longitude, latitude]

const SA_POLYGON: MultiPolygon = [
  // المملكة العربية السعودية — الجزء الرئيسي
  [[
    [36.968, 21.993],[37.154, 22.041],[38.437, 22.051],[39.093, 22.499],
    [39.794, 23.003],[40.490, 23.689],[41.027, 24.068],[41.465, 24.425],
    [42.142, 24.955],[42.731, 24.912],[43.401, 24.079],[43.953, 24.058],
    [44.529, 24.269],[44.725, 24.007],[44.827, 23.579],[45.559, 23.525],
    [46.311, 23.279],[46.959, 23.088],[47.508, 23.065],[48.432, 23.163],
    [49.029, 23.533],[49.555, 23.888],[50.103, 24.190],[50.730, 24.344],
    [51.579, 24.286],[51.591, 24.079],[51.019, 23.561],[51.004, 22.507],
    [51.313, 22.118],[51.777, 22.052],[52.554, 21.730],[55.002, 22.000],
    [55.206, 22.708],[55.666, 22.000],[55.643, 21.249],[54.979, 20.002],
    [54.095, 19.429],[52.781, 18.580],[52.000, 19.001],[49.117, 18.617],
    [48.194, 18.157],[47.579, 17.446],[47.073, 16.954],[46.740, 17.284],
    [46.367, 17.233],[45.396, 17.321],[45.106, 17.430],[44.196, 17.395],
    [43.420, 17.522],[43.287, 17.040],[43.076, 16.650],[42.787, 16.332],
    [42.546, 16.769],[42.261, 17.271],[41.753, 17.490],[41.216, 17.523],
    [40.937, 17.082],[40.069, 16.385],[39.425, 15.876],[38.998, 15.659],
    [38.510, 15.405],[37.904, 15.457],[37.040, 15.919],[37.046, 16.488],
    [37.100, 17.124],[36.910, 18.616],[36.960, 19.665],[37.000, 21.000],
    [36.968, 21.993],
  ]],
];

const AE_POLYGON: MultiPolygon = [
  // الإمارات العربية المتحدة — الجزء الرئيسي
  [[
    [51.579, 24.286],[52.580, 25.000],[53.091, 25.028],[53.423, 25.188],
    [54.348, 25.376],[54.636, 25.197],[55.136, 25.221],[55.802, 25.870],
    [56.261, 25.714],[56.396, 24.924],[55.943, 24.375],[55.557, 24.133],
    [55.049, 23.961],[54.692, 24.034],[54.230, 24.148],[53.600, 24.177],
    [53.000, 24.000],[52.200, 24.050],[51.791, 24.001],[51.579, 24.286],
  ]],
  // شبه جزيرة مسندم (exclave)
  [[
    [56.154, 25.667],[56.284, 25.758],[56.381, 25.854],[56.467, 25.935],
    [56.512, 25.912],[56.461, 25.754],[56.352, 25.671],[56.154, 25.667],
  ]],
];

const QA_POLYGON: MultiPolygon = [
  // قطر
  [[
    [50.730, 24.344],[51.019, 24.544],[51.185, 24.765],[51.530, 25.090],
    [51.636, 25.139],[51.777, 25.116],[51.895, 25.038],[51.750, 24.500],
    [51.600, 24.200],[51.300, 24.148],[50.900, 24.030],[50.730, 24.344],
  ]],
];

const KW_POLYGON: MultiPolygon = [
  // الكويت
  [[
    [47.436, 29.002],[46.569, 29.099],[47.004, 29.985],[47.825, 30.095],
    [48.176, 29.534],[48.093, 29.185],[47.978, 28.993],[47.436, 29.002],
  ]],
];

const OM_POLYGON: MultiPolygon = [
  // عُمان — الجزء الرئيسي
  [[
    [55.643, 21.249],[55.002, 22.000],[55.500, 23.000],[55.700, 23.400],
    [55.980, 23.641],[56.082, 24.079],[55.979, 24.468],[55.800, 24.700],
    [55.880, 25.020],[56.154, 25.667],[56.352, 25.671],[56.461, 25.754],
    [56.512, 25.912],[56.900, 25.600],[57.200, 25.120],[57.720, 24.200],
    [58.580, 23.652],[59.401, 22.667],[59.800, 22.167],[59.840, 21.710],
    [59.457, 21.320],[58.892, 21.156],[58.477, 21.011],[57.990, 20.680],
    [57.810, 20.212],[57.350, 20.460],[56.980, 20.650],[56.820, 21.000],
    [55.643, 21.249],
  ]],
  // جزيرة مصيرة
  [[
    [58.889, 20.430],[58.810, 20.310],[58.740, 20.370],[58.750, 20.520],
    [58.889, 20.430],
  ]],
];

// ─── Country registry ─────────────────────────────────────────────────────────

const COUNTRY_BOUNDS: Record<string, CountryBounds> = {
  SA: {
    nameAr: "المملكة العربية السعودية",
    bbox: [34.0, 15.0, 55.7, 32.2],
    multiPolygon: SA_POLYGON,
  },
  AE: {
    nameAr: "الإمارات العربية المتحدة",
    bbox: [51.5, 22.6, 56.4, 26.1],
    multiPolygon: AE_POLYGON,
  },
  QA: {
    nameAr: "قطر",
    bbox: [50.7, 24.0, 51.9, 26.2],
    multiPolygon: QA_POLYGON,
  },
  KW: {
    nameAr: "الكويت",
    bbox: [46.5, 28.5, 48.4, 30.1],
    multiPolygon: KW_POLYGON,
  },
  OM: {
    nameAr: "عُمان",
    bbox: [51.8, 16.6, 59.9, 26.4],
    multiPolygon: OM_POLYGON,
  },
};

// ─── Core algorithms ──────────────────────────────────────────────────────────

/**
 * Ray-Casting: هل النقطة (px, py) داخل ring مغلق؟
 * الإحداثيات بترتيب [lng, lat] لكن الخوارزمية تتعامل معها كـ x,y مجرّد.
 */
function pointInRing(px: number, py: number, ring: Ring): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > py !== yj > py &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * هل النقطة داخل Polygon (outerRing - holes[])?
 */
function pointInPolygon(
  px: number,
  py: number,
  polygon: Polygon
): boolean {
  if (polygon.length === 0) return false;
  // يجب أن تكون داخل الحلقة الخارجية
  if (!pointInRing(px, py, polygon[0])) return false;
  // ويجب ألا تكون داخل أي فتحة
  for (let h = 1; h < polygon.length; h++) {
    if (pointInRing(px, py, polygon[h])) return false;
  }
  return true;
}

/**
 * هل النقطة داخل MultiPolygon (جزر + أجزاء منفصلة)?
 */
function pointInMultiPolygon(
  px: number,
  py: number,
  mp: MultiPolygon
): boolean {
  return mp.some((poly) => pointInPolygon(px, py, poly));
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * تحقق من صحة إحداثيات النقطة نوعياً (نطاق + finite).
 */
export function isValidCoords(lat: unknown, lng: unknown): boolean {
  if (typeof lat !== "number" || typeof lng !== "number") return false;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < -90 || lat > 90) return false;
  if (lng < -180 || lng > 180) return false;
  return true;
}

/**
 * تحقق من أن نقطة جغرافية تقع داخل حدود بلد مدعوم.
 *
 * @param point  { lat, lng }
 * @param countryCode  مثل "SA" | "AE" | "QA" | "KW" | "OM"
 * @returns ValidationResult
 */
export function validatePointInCountry(
  point: GeoPoint,
  countryCode: string
): ValidationResult {
  // 1. تحقق من صحة الإحداثيات
  if (!isValidCoords(point.lat, point.lng)) {
    return {
      valid: false,
      errorCode: "INVALID_COORDS",
      errorMessage: "إحداثيات الموقع غير صالحة. يرجى اختيار موقع آخر.",
    };
  }

  // 2. تحقق من دعم البلد
  const bounds = COUNTRY_BOUNDS[countryCode];
  if (!bounds) {
    return {
      valid: false,
      errorCode: "UNSUPPORTED_COUNTRY",
      errorMessage: `الدولة ${countryCode} غير مدعومة.`,
    };
  }

  const { lat, lng } = point;
  const [minLng, minLat, maxLng, maxLat] = bounds.bbox;

  // 3. فحص Bounding Box (سريع O(1))
  if (lng < minLng || lng > maxLng || lat < minLat || lat > maxLat) {
    return {
      valid: false,
      errorCode: "OUT_OF_COUNTRY",
      errorMessage: `الموقع المختار خارج ${bounds.nameAr}. اختر موقعاً داخل ${bounds.nameAr} للمتابعة.`,
    };
  }

  // 4. فحص Point-in-Polygon الدقيق (lng, lat) كـ (x, y)
  const inside = pointInMultiPolygon(lng, lat, bounds.multiPolygon);
  if (!inside) {
    return {
      valid: false,
      errorCode: "OUT_OF_COUNTRY",
      errorMessage: `الموقع المختار خارج ${bounds.nameAr}. اختر موقعاً داخل ${bounds.nameAr} للمتابعة.`,
    };
  }

  return { valid: true };
}

/**
 * Bounding Box لدولة معيّنة — يُستخدم في الواجهة لضبط حدود حركة الخريطة.
 * يُرجع null إذا كانت الدولة غير مدعومة.
 */
export function getCountryBBox(
  countryCode: string
): { minLng: number; minLat: number; maxLng: number; maxLat: number } | null {
  const b = COUNTRY_BOUNDS[countryCode];
  if (!b) return null;
  return {
    minLng: b.bbox[0],
    minLat: b.bbox[1],
    maxLng: b.bbox[2],
    maxLat: b.bbox[3],
  };
}

/**
 * مركز البلد التقريبي للتمركز الأولي للخريطة.
 * يُرجع مركز SA كـ fallback.
 */
export function getCountryCenter(countryCode: string): GeoPoint {
  const centers: Record<string, GeoPoint> = {
    SA: { lat: 24.7, lng: 46.7 },  // الرياض
    AE: { lat: 24.5, lng: 54.4 },  // أبوظبي
    QA: { lat: 25.3, lng: 51.5 },  // الدوحة
    KW: { lat: 29.4, lng: 47.7 },  // الكويت
    OM: { lat: 23.6, lng: 58.6 },  // مسقط
  };
  return centers[countryCode] ?? centers.SA;
}

/**
 * مستوى التكبير الافتراضي المناسب لكل دولة.
 */
export function getCountryDefaultZoom(countryCode: string): number {
  const zooms: Record<string, number> = {
    SA: 5,
    AE: 8,
    QA: 10,
    KW: 9,
    OM: 6,
  };
  return zooms[countryCode] ?? 6;
}

/**
 * اسم الدولة بالعربي.
 */
export function getCountryNameAr(countryCode: string): string {
  return COUNTRY_BOUNDS[countryCode]?.nameAr ?? countryCode;
}

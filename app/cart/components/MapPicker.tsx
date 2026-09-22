"use client";

/**
 * MapPicker — اختيار موقع التوصيل على الخريطة
 *
 * التحقق من الدولة — طبقتان:
 * 1. Bounding Box (client-side, فوري): إذا كانت الإحداثيات خارج مستطيل الدولة
 *    → خطأ فوري بدون أي API call.
 * 2. Server-side reverse geocoding (POST /api/reverse-geocode): يجلب اسم الموقع
 *    ويتحقق من country ISO code من Google Maps Geocoding API من السيرفر
 *    (GOOGLE_MAPS_KEY — مش مكشوف للمتصفح).
 *
 * لا يستخدم Geocoding library من المتصفح (مشكلة "not authorized").
 * يستخدم Maps JavaScript API فقط لعرض الخريطة والـ AdvancedMarker.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import type { MapMouseEvent } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMapPin2Line, RiCrosshairLine, RiCheckLine,
  RiCloseLine, RiErrorWarningLine, RiLoader4Line,
} from "react-icons/ri";

// ── إعدادات الدول ─────────────────────────────────────────────────────────

interface CountryConfig {
  center: google.maps.LatLngLiteral;
  zoom: number;
  /** حدود مستطيلية للتحقق السريع [latMin, latMax, lngMin, lngMax] */
  bbox: [number, number, number, number];
}

const COUNTRY_CONFIG: Record<string, CountryConfig> = {
  SA: { center: { lat: 24.69, lng: 46.72 }, zoom: 6,  bbox: [16.38, 32.16, 36.47, 55.67] },
  AE: { center: { lat: 25.20, lng: 55.27 }, zoom: 8,  bbox: [22.63, 26.08, 51.58, 56.38] },
  QA: { center: { lat: 25.29, lng: 51.53 }, zoom: 10, bbox: [24.56, 26.17, 50.74, 51.61] },
  KW: { center: { lat: 29.37, lng: 47.98 }, zoom: 10, bbox: [28.53, 30.10, 46.55, 48.43] },
  OM: { center: { lat: 23.61, lng: 58.59 }, zoom: 7,  bbox: [16.64, 26.40, 51.99, 59.84] },
};

const COUNTRY_NAME_AR: Record<string, string> = {
  SA: "المملكة العربية السعودية",
  AE: "الإمارات العربية المتحدة",
  QA: "قطر",
  KW: "الكويت",
  OM: "سلطنة عُمان",
};

/** تحقق سريع client-side بالـ bounding box */
function isInsideBbox(lat: number, lng: number, code: string): boolean {
  const cfg = COUNTRY_CONFIG[code];
  if (!cfg) return true; // دولة غير معروفة → لا نمنع
  const [latMin, latMax, lngMin, lngMax] = cfg.bbox;
  return lat >= latMin && lat <= latMax && lng >= lngMin && lng <= lngMax;
}

// ── أنواع ─────────────────────────────────────────────────────────────────

export interface MapLocation {
  lat: number;
  lon: number;
  formattedAddress: string;
}

interface MapPickerProps {
  countryCode: string;
  countryNameAr: string;
  onConfirm: (loc: MapLocation) => void;
  onClose: () => void;
  initialLat?: number;
  initialLon?: number;
}

// ── المكوّن الداخلي ──────────────────────────────────────────────────────

function MapInner({ countryCode, countryNameAr, onConfirm, onClose, initialLat, initialLon }: MapPickerProps) {
  const map = useMap("checkout-map");

  // ── كشف دولة الـ IP لتحديد مركز الخريطة عند الفتح ──────────────────
  // الـ IP يُستخدم لتحديد المركز الأولي للخريطة فقط.
  // بعد ما المستخدم يختار موقعه — يُتحقق من مطابقة countryCode (الدولة المختارة في الـ Navbar).
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(null);
  const [centerZoom, setCenterZoom] = useState<number | null>(null);

  // map instance قد لا يكون جاهزاً عند أول render — نخزّن الـ detected country
  // ونستخدمه بمجرد ما الـ map يبقى متاحاً
  const detectedCountryRef = useRef<string | null>(null);

  useEffect(() => {
    // لو فيه موقع محدد مسبقاً → الخريطة ستُركّز عليه مباشرةً
    if (initialLat && initialLon) return;

    // اكتشف الدولة من الـ IP وافتح الخريطة عليها
    fetch("/api/geo", { credentials: "omit" })
      .then(r => r.ok ? r.json() : null)
      .then((data: { countryCode?: string } | null) => {
        const detected = data?.countryCode;
        if (detected && COUNTRY_CONFIG[detected]) {
          const cfg = COUNTRY_CONFIG[detected];
          detectedCountryRef.current = detected;
          setMapCenter(cfg.center);
          setCenterZoom(cfg.zoom);
          // لو الخريطة جاهزة بالفعل → انتقل إليها فوراً
          if (map) {
            map.panTo(cfg.center);
            map.setZoom(cfg.zoom);
          }
        }
      })
      .catch(() => {/* silent */});
  }, [initialLat, initialLon]); // eslint-disable-line react-hooks/exhaustive-deps

  // لو الـ map object جهز بعد الـ fetch → انتقل للـ IP country
  useEffect(() => {
    if (!map || !detectedCountryRef.current || initialLat || initialLon) return;
    const cfg = COUNTRY_CONFIG[detectedCountryRef.current];
    if (cfg) {
      map.panTo(cfg.center);
      map.setZoom(cfg.zoom);
    }
  }, [map, initialLat, initialLon]);

  // مركز الخريطة الأولي:
  // 1. الموقع المحدد مسبقاً (initialLat/Lon) — أعلى أولوية
  // 2. دولة الـ IP (بعد الـ fetch)
  // 3. countryCode من الـ Navbar
  // 4. SA كـ fallback
  const cfgFromCountry = COUNTRY_CONFIG[countryCode] ?? COUNTRY_CONFIG.SA;
  const cfg = {
    center: (initialLat && initialLon)
      ? { lat: initialLat, lng: initialLon }
      : (mapCenter ?? cfgFromCountry.center),
    zoom: (initialLat && initialLon)
      ? 15
      : (centerZoom ?? cfgFromCountry.zoom),
  };

  const [pin, setPin] = useState<google.maps.LatLngLiteral | null>(
    initialLat && initialLon ? { lat: initialLat, lng: initialLon } : null
  );
  const [address, setAddress]         = useState("");
  const [valid, setValid]             = useState<boolean | null>(initialLat && initialLon ? true : null);
  const [outsideMsg, setOutsideMsg]   = useState("");
  const [loading, setLoading]         = useState(false);
  const [gpsLoading, setGpsLoading]   = useState(false);
  const [gpsError, setGpsError]       = useState("");

  const abortRef = useRef<AbortController | null>(null);

  // ── Reverse geocode عبر السيرفر ─────────────────────────────────────

  const geocodeFromServer = useCallback(async (lat: number, lng: number) => {
    // إلغاء الطلب السابق
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setAddress("");
    setValid(null);
    setOutsideMsg("");

    try {
      const res = await fetch("/api/reverse-geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: ctrl.signal,
        body: JSON.stringify({ lat, lng }),
      });
      if (ctrl.signal.aborted) return;

      const data = await res.json() as { address?: string; countryCode?: string; error?: string };

      const detectedCode = data.countryCode ?? "";
      const detectedName = COUNTRY_NAME_AR[detectedCode] ?? detectedCode;

      setAddress(data.address ?? "");

      if (detectedCode && detectedCode !== countryCode) {
        setValid(false);
        setOutsideMsg(
          `الموقع المختار في ${detectedName || "دولة أخرى"}، والتوصيل متاح فقط في ${countryNameAr}.\nاختر موقعًا داخل ${countryNameAr}.`
        );
      } else {
        setValid(true);
        setOutsideMsg("");
      }
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      // فشل الشبكة — نتيح التأكيد (لا نمنع بسبب مشكلة تقنية)
      setAddress("");
      setValid(true);
    } finally {
      setLoading(false);
    }
  }, [countryCode, countryNameAr]);

  // ── وضع دبوس ─────────────────────────────────────────────────────────

  const dropPin = useCallback((lat: number, lng: number) => {
    setGpsError("");

    // طبقة 1: بدون أي API — تحقق فوري بالـ bounding box
    if (!isInsideBbox(lat, lng, countryCode)) {
      setPin({ lat, lng });
      setValid(false);
      setAddress("");
      setLoading(false);
      setOutsideMsg(`الموقع خارج ${countryNameAr}. يُرجى اختيار موقع داخل ${countryNameAr}.`);
      return;
    }

    // داخل الـ bbox → طبقة 2: geocoding دقيق من السيرفر
    setPin({ lat, lng });
    geocodeFromServer(lat, lng);
  }, [countryCode, countryNameAr, geocodeFromServer]);

  // نظّف الـ abort عند unmount
  useEffect(() => () => { abortRef.current?.abort(); }, []);

  // Map onClick
  const handleMapClick = useCallback((e: MapMouseEvent) => {
    const ll = e.detail?.latLng;
    if (!ll) return;
    dropPin(ll.lat, ll.lng);
  }, [dropPin]);

  // AdvancedMarker dragEnd
  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    dropPin(e.latLng.lat(), e.latLng.lng());
  }, [dropPin]);

  // ── GPS ──────────────────────────────────────────────────────────────

  const handleGps = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("متصفحك لا يدعم تحديد الموقع التلقائي.");
      return;
    }
    setGpsLoading(true);
    setGpsError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setGpsLoading(false);
        map?.panTo({ lat, lng });
        map?.setZoom(16);
        dropPin(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? "لم يُسمح بتحديد الموقع. اضغط على الخريطة مباشرة."
            : "تعذر تحديد موقعك. اضغط على الخريطة يدويًا."
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, [map, dropPin]);

  // ── تأكيد ─────────────────────────────────────────────────────────────

  const canConfirm = !!pin && valid === true && !loading;

  const handleConfirm = useCallback(() => {
    if (!canConfirm || !pin) return;
    onConfirm({ lat: pin.lat, lon: pin.lng, formattedAddress: address });
  }, [canConfirm, pin, address, onConfirm]);

  // لون الدبوس
  const pinColor = valid === false ? "#ef4444" : loading ? "#F59E0B" : "#0874ED";

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" dir="rtl">

      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-[#E8EDF5] bg-[#F7F9FC] shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <RiMapPin2Line size={13} className="text-[#0874ED] shrink-0" />
          <span className="text-xs font-bold text-[#040D2A]">حدد موقعك في</span>
          <span className="text-xs font-bold text-[#0874ED] truncate">{countryNameAr}</span>
        </div>
        <button onClick={onClose} aria-label="إغلاق"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8A96A8] hover:bg-[#E8EDF5] transition-colors shrink-0 mr-1">
          <RiCloseLine size={16} />
        </button>
      </div>

      {/* الخريطة */}
      <div className="relative flex-1 min-h-0">
        <Map
          id="checkout-map"
          mapId="checkout-map"
          defaultCenter={pin ?? cfg.center}
          defaultZoom={pin ? 15 : cfg.zoom}
          gestureHandling="greedy"
          disableDefaultUI={false}
          clickableIcons={false}
          onClick={handleMapClick}
          style={{ width: "100%", height: "100%" }}
        >
          {pin && (
            <AdvancedMarker
              position={pin}
              draggable
              onDragEnd={handleDragEnd}
              title="اسحب لتعديل الموقع"
            >
              <div style={{ transform: "translate(-50%, -100%)" }} className="flex flex-col items-center">
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[3px] border-white flex items-center justify-center shadow-2xl transition-all duration-300"
                  style={{ backgroundColor: pinColor, boxShadow: `0 4px 20px ${pinColor}55` }}
                >
                  {loading
                    ? <RiLoader4Line size={18} className="text-white animate-spin" />
                    : valid === false
                      ? <RiErrorWarningLine size={18} className="text-white" />
                      : <RiMapPin2Line size={18} className="text-white" />
                  }
                </div>
                <div className="w-0 h-0 transition-all duration-300" style={{
                  borderLeft: "6px solid transparent",
                  borderRight: "6px solid transparent",
                  borderTop: `10px solid ${pinColor}`,
                  marginTop: "-2px",
                }} />
              </div>
            </AdvancedMarker>
          )}
        </Map>

        {/* زر GPS — أكبر على الموبايل لسهولة الضغط */}
        <button onClick={handleGps} disabled={gpsLoading} aria-label="موقعي الحالي"
          className="absolute bottom-3 sm:bottom-14 right-2 sm:right-3 z-10 flex items-center gap-1.5 bg-white border border-[#E8EDF5] shadow-lg rounded-xl px-3 py-2.5 sm:py-2 text-xs font-semibold text-[#040D2A] hover:bg-[#F7F9FC] active:scale-95 transition-all disabled:opacity-60"
        >
          {gpsLoading
            ? <RiLoader4Line size={14} className="animate-spin text-[#0874ED]" />
            : <RiCrosshairLine size={14} className="text-[#0874ED]" />
          }
          <span className="hidden xs:inline sm:inline">موقعي الحالي</span>
          <span className="xs:hidden sm:hidden">موقعي</span>
        </button>

        {/* تلميح أول مرة */}
        {!pin && (
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-16 sm:pb-20">
            <div className="bg-[#040D2A]/80 backdrop-blur-sm text-white rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-center mx-3">
              <p className="text-xs font-bold">👆 اضغط لتحديد موقع التوصيل</p>
              <p className="text-[10px] text-white/60 mt-0.5 hidden sm:block">يمكنك سحب الدبوس لضبط الموقع بدقة</p>
            </div>
          </div>
        )}

        {/* خطأ GPS */}
        <AnimatePresence>
          {gpsError && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="absolute top-2 sm:top-3 inset-x-2 sm:inset-x-3 z-20 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-orange-700 shadow"
            >
              <RiErrorWarningLine size={13} className="shrink-0 text-orange-500" />
              <span className="flex-1">{gpsError}</span>
              <button onClick={() => setGpsError("")} className="text-orange-400 hover:text-orange-600 shrink-0">
                <RiCloseLine size={13} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Panel سفلي — compact على الموبايل */}
      <div className="shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 border-t border-[#E8EDF5] bg-white space-y-2">

        {/* رسالة خارج الدولة */}
        <AnimatePresence>
          {outsideMsg && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-700"
            >
              <RiErrorWarningLine size={13} className="mt-0.5 shrink-0 text-red-500" />
              <span className="whitespace-pre-line leading-relaxed">{outsideMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* عرض العنوان */}
        <div className="min-h-[2.2rem] bg-[#F7F9FC] border border-[#E8EDF5] rounded-xl px-3 py-2 flex items-center gap-2">
          {!pin ? (
            <span className="text-xs text-[#C8D0DC]">سيظهر اسم الموقع هنا بعد التحديد</span>
          ) : loading ? (
            <>
              <RiLoader4Line size={12} className="animate-spin text-[#0874ED] shrink-0" />
              <span className="text-xs text-[#8A96A8]">جاري التحقق...</span>
            </>
          ) : valid === false ? (
            <>
              <RiErrorWarningLine size={12} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-500 font-medium">موقع خارج نطاق التوصيل</span>
            </>
          ) : address ? (
            <>
              <RiMapPin2Line size={12} className="text-[#0874ED] shrink-0" />
              <span className="text-xs text-[#040D2A] font-medium leading-relaxed line-clamp-2">{address}</span>
            </>
          ) : (
            <span className="text-xs text-[#8A96A8]">لم يُعثر على اسم — أكمل التفاصيل يدويًا</span>
          )}
        </div>

        {/* الأزرار */}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-[#E8EDF5] rounded-xl text-xs font-semibold text-[#6B7A8D] hover:bg-[#F7F9FC] active:scale-[0.98] transition-all"
          >
            إلغاء
          </button>
          <button onClick={handleConfirm} disabled={!canConfirm}
            className="flex-[2] py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
            style={{
              backgroundColor: canConfirm ? "#0874ED" : "#C8D0DC",
              boxShadow:       canConfirm ? "0 4px 14px #0874ED33" : "none",
            }}
          >
            {loading
              ? <><RiLoader4Line size={13} className="animate-spin" /> جاري التحقق...</>
              : <><RiCheckLine size={13} /> تأكيد الموقع</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Wrapper ───────────────────────────────────────────────────────────────

export default function MapPicker(props: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";

  if (!apiKey) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
        <RiMapPin2Line size={32} className="text-[#C8D0DC]" />
        <p className="text-sm font-semibold text-[#8A96A8]">الخريطة غير متاحة حاليًا</p>
        <p className="text-xs text-[#B0BCCE]">أدخل عنوانك يدويًا في الحقل أدناه</p>
        <button onClick={props.onClose} className="text-xs text-[#0874ED] font-bold hover:underline">إغلاق</button>
      </div>
    );
  }

  // Maps JavaScript API فقط — بدون geocoding library من المتصفح
  return (
    <APIProvider apiKey={apiKey} libraries={["marker"]}>
      <MapInner {...props} />
    </APIProvider>
  );
}

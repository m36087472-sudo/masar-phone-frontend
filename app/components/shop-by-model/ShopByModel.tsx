"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import { HiArrowRight, HiArrowLeft } from "react-icons/hi2";
import "swiper/css";
import "swiper/css/pagination";

import { SHOP_PRODUCTS } from "./shopByModelData";
import ShopProductCard from "./ShopProductCard";

export default function ShopByModel() {
  return (
    <section
      dir="rtl"
      className="w-full py-14 sm:py-20 overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 0%, #dde6ff 0%, #eef1ff 30%, #f5f7ff 60%, #ffffff 100%)" }}
    >
      <div className="max-w-[1380px] mx-auto px-4 sm:px-8">

        {/* Header */}
        <div className="flex flex-row items-center justify-between gap-4 mb-10 sm:mb-14">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0B43FD]/8 text-[#0B43FD] text-[0.72rem] font-bold px-3 py-1.5 rounded-full mb-3 border border-[#0B43FD]/12 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0B43FD]" />
              أحدث الموديلات
            </div>
            <h2 className="text-[clamp(1.4rem,5vw,3rem)] font-black text-[#0a0a0a] leading-[1.1] tracking-tight">
              تسوّق حسب{" "}
              <span className="bg-gradient-to-l from-[#0B43FD] to-[#4f8bff] bg-clip-text text-transparent">
                الجهاز
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              className="swiper-models-prev w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center text-[#374151] transition-all duration-200 hover:bg-[#0B43FD] hover:text-white hover:border-[#0B43FD] hover:shadow-[0_4px_14px_rgba(11,67,253,0.3)] disabled:opacity-30"
              aria-label="السابق"
            >
              <HiArrowRight size={15} />
            </button>
            <button
              className="swiper-models-next w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-[#e5e7eb] shadow-sm flex items-center justify-center text-[#374151] transition-all duration-200 hover:bg-[#0B43FD] hover:text-white hover:border-[#0B43FD] hover:shadow-[0_4px_14px_rgba(11,67,253,0.3)] disabled:opacity-30"
              aria-label="التالي"
            >
              <HiArrowLeft size={15} />
            </button>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          dir="rtl"
          navigation={{
            prevEl: ".swiper-models-prev",
            nextEl: ".swiper-models-next",
          }}
          pagination={{
            clickable: true,
            el: ".swiper-models-dots",
            bulletClass: "swiper-models-bullet",
            bulletActiveClass: "swiper-models-bullet-active",
          }}
          grabCursor
          breakpoints={{
            0:    { slidesPerView: 1.5,  spaceBetween: 10 },
            350:  { slidesPerView: 1.65, spaceBetween: 10 },
            400:  { slidesPerView: 1.85, spaceBetween: 12 },
            480:  { slidesPerView: 2.2,  spaceBetween: 14 },
            640:  { slidesPerView: 2.7,  spaceBetween: 18 },
            900:  { slidesPerView: 3.2,  spaceBetween: 20 },
            1200: { slidesPerView: 4,    spaceBetween: 22 },
          }}
          className="!overflow-visible"
        >
          {SHOP_PRODUCTS.map((p, idx) => (
            <SwiperSlide key={p.id} className="!h-auto">
              {/* priority only for first 2 visible cards */}
              <ShopProductCard product={p} priority={idx < 2} />
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="swiper-models-dots flex justify-center gap-2 mt-8" />
      </div>
    </section>
  );
}

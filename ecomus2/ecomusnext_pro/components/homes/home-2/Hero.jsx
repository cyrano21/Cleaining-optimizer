"use client";
import Image from "next/image";
import { slidesData } from "@/data/heroslides";
import React from "react";
import Link from "next/link";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Hero({ store }) {
  // La prop store est acceptée pour compatibilité, même si non utilisée
  // Debug: Log slides data
  console.log('Hero Component - slidesData:', slidesData);
  
  return (
    <div className="tf-slideshow slider-home-2 slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        speed={1000}
        centeredSlides={false}
        modules={[Pagination]}
        pagination={{ clickable: true, el: ".spb1" }}
        breakpoints={{
          1024: {
            slidesPerView: 1,
          },
          640: {
            slidesPerView: 1,
          },
        }}
        className="tf-sw-slideshow"
      >
        {slidesData.map((slide, index) => {
          // Debug: Log each slide data
          console.log(`Hero - Slide ${index}:`, slide);
          console.log(`Hero - Image src: ${slide.src}`);
          return (
          <SwiperSlide key={index}>
            <div className="wrap-slider">              <Image
                className=""
                data-src={slide.src}
                src={slide.src}
                alt={slide.alt}
                priority
                width={2000}
                height={1034}
 style={{ width: "100%", height: "auto" }}                 onLoad={() => console.log(`Hero - Image loaded successfully: ${slide.src}`)}
                onError={(e) => console.error(`Hero - Image failed to load: ${slide.src}`, e)}
              />
              <div className="box-content">
                <div className="container">
                  <h1 className="fade-item fade-item-1">
                    {slide.title.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </h1>
                  <p className="fade-item fade-item-2">{slide.description}</p>
                  <Link
                    href={`/shop-default`}
                    className="fade-item fade-item-3 tf-btn btn-fill animate-hover-btn btn-xl radius-3"
                  >
                    <span>Shop collection</span>
                    <i className="icon icon-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>          </SwiperSlide>
        );
        })}
      </Swiper>
      <div className="wrap-pagination sw-absolute-2">
        <div className="container">
          <div className="sw-dots spb1 sw-pagination-slider" />
        </div>
      </div>
    </div>
  );
}

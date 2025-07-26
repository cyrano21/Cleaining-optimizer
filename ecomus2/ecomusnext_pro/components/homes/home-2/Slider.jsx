"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import Link from "next/link";
import React from "react";
import Image from "next/image";

const sliderData = [
  {
    id: 1,
    imgSrc: "/images/slider/fashion-slideshow-01.jpg",
    title: "Summer\nCollection",
    text: "Discover our latest summer trends",
    btnText: "Shop Now",
  },
  {
    id: 2,
    imgSrc: "/images/slider/fashion-slideshow-02.jpg",
    title: "New\nStyle",
    text: "Explore modern fashion",
    btnText: "Explore",
  },
];

export default function Slider({ autoPlay, showDots }) {
  // Props autoPlay et showDots acceptées pour compatibilité FactorizedComponents
  return (
    <div className="tf-slideshow slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        className="swiper tf-sw-slideshow"
        modules={[Pagination, Navigation]}
        pagination={{ clickable: true, el: ".sp2" }}
        navigation={{
          prevEl: ".snbp2",
          nextEl: ".snbn2",
        }}
        speed={1000}
        loop={true}
      >
        {sliderData.map((slide, index) => (
          <SwiperSlide className="swiper-slide" key={index}>
            <div className="wrap-slider">
              <Image
                priority
                alt="fashion-slideshow"
                src={slide.imgSrc}
                width="2000"
                height="1125"
                style={{ width: "100%", height: "auto" }}
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
                  <p className="fade-item fade-item-2">{slide.text}</p>
                  <Link
                    href={`/shop-default`}
                    className="fade-item fade-item-3 tf-btn btn-fill animate-hover-btn btn-xl radius-3"
                  >
                    <span>{slide.btnText}</span>
                    <i className="icon icon-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination">
        <div className="container">
          <div className="sw-dots sp2 sw-pagination-slider justify-content-center" />
        </div>
      </div>
      <div className="nav-sw nav-next-slider snbp2 nav-next-collection">
        <span className="icon icon-arrow-left" />
      </div>
      <div className="nav-sw nav-prev-slider snbn2 nav-prev-collection">
        <span className="icon icon-arrow-right" />
      </div>
    </div>
  );
}
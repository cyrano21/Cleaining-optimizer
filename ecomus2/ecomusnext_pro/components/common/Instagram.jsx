"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
import Link from "next/link";
import { galleryData } from "../../data/products";

export default function Instagram({ title = "Follow us on Instagram", hashtag = "#ecomus" }) {
  const limit = 6;
  const displayItems = galleryData.slice(0, limit);

  return (
    <section className="flat-spacing-7">
      <div className="container">
        <div className="flat-title wow fadeInUp" data-wow-delay="0s">
          <span className="title">{title}</span>
          <p className="sub-title">
            Inspire and let yourself be inspired, from one unique fashion to another. {hashtag}
          </p>
        </div>
        <div className="wrap-carousel wrap-shop-gram">
          <Swiper
            dir="ltr"
            spaceBetween={7}
            slidesPerView={5}
            breakpoints={{
              1024: {
                slidesPerView: 5,
                spaceBetween: 7,
              },
              640: {
                slidesPerView: 3,
                spaceBetween: 7,
              },
              0: {
                slidesPerView: 2,
                spaceBetween: 7,
              },
            }}
            modules={[Pagination]}
            pagination={{ clickable: true, el: ".spd-instagram" }}
          >
            {displayItems.map((item, index) => (
              <SwiperSlide key={index}>
                <div
                  className="gallery-item hover-img wow fadeInUp"
                  data-wow-delay={item.wowDelay}
                >
                  <div className="img-style">
                    <Image
                      className="lazyload img-hover"
                      data-src={item.imgSrc}
                      src={item.imgSrc}
                      alt={item.alt}
                      width={400}
                      height={400}
                      style={{ width: "100%", height: "auto" }}
                    />
                  </div>
                  <Link
                    href={`/product-detail/${item.id}`}
                    className="box-icon"
                  >
                    <span className="icon icon-instagram" />
                    <span className="tooltip">View on Instagram</span>
                  </Link>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="sw-dots sw-pagination-gallery justify-content-center spd-instagram" />
        </div>
      </div>
    </section>
  );
}
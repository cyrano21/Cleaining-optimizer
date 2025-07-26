"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

const categoriesData = [
  {
    id: 1,
    imgSrc: "/images/collections/collection-1.jpg",
    title: "New Arrivals",
    altText: "collection-img",
  },
  {
    id: 2,
    imgSrc: "/images/collections/collection-2.jpg",
    title: "Best Sellers",
    altText: "collection-img",
  },
  {
    id: 3,
    imgSrc: "/images/collections/collection-3.jpg",
    title: "Sale Items",
    altText: "collection-img",
  },
  {
    id: 4,
    imgSrc: "/images/collections/collection-4.jpg",
    title: "Featured",
    altText: "collection-img",
  },
];

export default function Categories({ limit, layout, showTitle = true }) {
  // Props limit, layout et showTitle acceptées pour compatibilité FactorizedComponents
  // showTitle par défaut à true pour éviter les erreurs de build
  return (
    <section className="flat-spacing-4 flat-categorie">
      <div className="container-full">
        <div className="flat-title-v2">
          <div className="box-sw-navigation">
            <div className="nav-sw nav-next-slider snbp8 nav-next-collection snbp108">
              <span className="icon icon-arrow-left" />
            </div>
            <div className="nav-sw nav-prev-slider snbn8 nav-prev-collection snbn108">
              <span className="icon icon-arrow-right" />
            </div>
          </div>
          <span
            className="text-3 fw-7 text-uppercase title wow fadeInUp"
            data-wow-delay="0s"
          >
            SHOP BY CATEGORIES
          </span>
        </div>
        <div className="row">
          <div className="col-xl-9 col-lg-8 col-md-8">
            <Swiper
              dir="ltr"
              className="swiper tf-sw-collection"
              spaceBetween={15}
              modules={[Navigation]}
              navigation={{
                prevEl: ".snbp108",
                nextEl: ".snbn108",
              }}
              breakpoints={{
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                768: {
                  slidesPerView: 2,
                  spaceBetween: 30,
                },
                640: {
                  slidesPerView: 2,
                },
              }}
            >
              {categoriesData.map((item, index) => (
                <SwiperSlide className="swiper-slide" key={index}>
                  <div className="collection-item style-left hover-img">
                    <div className="collection-inner">
                      <Link
                        href={`/shop-default`}
                        className="collection-image img-style"
                      >
                        <Image
                          className=""
                          data-src={item.imgSrc}
                          alt={item.altText}
                          src={item.imgSrc}
                          width="600"
                          height="721"
                          style={{ width: "100%", height: "auto" }}
                        />
                      </Link>
                      <div className="collection-content">
                        <Link
                          href={`/shop-default`}
                          className="tf-btn collection-title hover-icon fs-15"
                        >
                          <span>{item.title}</span>
                          <i className="icon icon-arrow1-top-left" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
          <div className="col-xl-3 col-lg-4 col-md-4">
            <div className="discovery-new-item">
              <h5>Discovery all new items</h5>
              <Link href={`/shop-collection-list`}>
                <i className="icon-arrow1-top-left" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";
import Image from "next/image";
import { slides9 } from "@/data/heroslides";
import React from "react";
import Link from "next/link";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

export default function Hero({ store }) {
  // Debug: vérifier les données store
  console.log('🎯 Hero Component - Store data:', store);
  console.log('🎯 Hero Component - homeTheme:', store?.store?.homeTheme || store?.homeTheme);
  
  // Extraire les données réelles de la boutique (gérer la structure imbriquée)
  const storeData = store?.store || store;
  
  // Slides spécifiques pour l'électronique avec les vraies images existantes
  const electronicSlides = [
    {
      imgSrc: "/images/slider/Slideshow_Electronics1.jpg",
      imgAlt: "electronic-slideshow-01",
      imgWidth: 2000,
      imgHeight: 837,
      text: "JUSQU'À 40% DE RÉDUCTION SUR LES CHARGEURS ET PLUS.",
      heading: `Découvrez\n${storeData?.name || 'TechVision 3D'}`,
    },
    {
      imgSrc: "/images/slider/Slideshow_Electronics2.jpg",
      imgAlt: "electronic-slideshow-02", 
      imgWidth: 1800,
      imgHeight: 753,
      text: "INNOVATION ET TECHNOLOGIE DE POINTE.",
      heading: "Design moderne\npour professionnels",
    },
    {
      imgSrc: "/images/slider/Slideshow_Electronics3.jpg",
      imgAlt: "electronic-slideshow-03",
      imgWidth: 2000,
      imgHeight: 836,
      text: "CHARGE RAPIDE ET PERFORMANCE OPTIMALE.",
      heading: "Charge rapide\nnext-gen",
    },
  ];

  // Utiliser les slides électroniques si c'est une boutique électronique
  const isElectronicsStore = storeData?.homeTheme === 'electronics';
  const slidesToUse = isElectronicsStore ? electronicSlides : slides9;
  
  // Debug: vérifier quels slides sont utilisés
  console.log('🔍 Is Electronics Store:', isElectronicsStore, '(homeTheme:', storeData?.homeTheme, ')');
  console.log('🖼️ Slides utilisés:', slidesToUse.length, 'slides');
  console.log('🖼️ Premier slide:', slidesToUse[0]?.imgSrc);
  
  return (
    <div className="tf-slideshow slider-home-2 slider-effect-fade position-relative">
      <Swiper
        dir="ltr"
        slidesPerView={1}
        spaceBetween={0}
        centeredSlides={false}
        loop={true}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        speed={1000}
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true, el: ".spd160" }}
        className="tf-sw-slideshow"
      >
        {slidesToUse.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="wrap-slider">
              <Image
                className=""
                alt={slide.imgAlt}
                src={slide.imgSrc}
                width={slide.imgWidth}
                height={slide.imgHeight}
                priority
                style={{ width: "100%", height: "auto" }}
              />
              <div className="box-content">
                <div className="container">
                  <p className="fade-item fade-item-1">{slide.text}</p>
                  <h1 className="fade-item fade-item-2">
                    {slide.heading.split("\n").map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        <br />
                      </React.Fragment>
                    ))}
                  </h1>
                  <Link
                    href={`/shop-default`}
                    className="fade-item fade-item-3 rounded-full tf-btn btn-fill animate-hover-btn btn-xl radius-3"
                  >
                    <span>Shop collection</span>
                    <i className="icon icon-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="wrap-pagination sw-absolute-2">
        <div className="container">
          <div className="sw-dots sw-pagination-slider justify-content-center spd160" />
        </div>
      </div>
    </div>
  );
}

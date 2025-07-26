import React from "react";
import Image from "next/image";
import Link from "next/link";
export default function CollectionBanner({ bannerImage, bannerText }) {
  return (
    <section className="flat-spacing-8 pb_0">
      <div className="container">
        <div className="tf-banner-collection">
          <Image
            className=""
            alt="img-banner"
            loading="lazy"
            src={bannerImage || "/images/collections/banner-collection-3.jpg"}
            width={1400}
            height={532}
            style={{ width: "100%", height: "auto" }}
          />
          <div className="box-content">
            <div className="sub fw-7 text_white">
              {bannerText || "SALE UP TO 30% OFF TODAY"}
            </div>
            <h2 className="heading fw-6 text_white">Best Deals Discounts</h2>
            <p className="text_white">Fast wireless charging on-the-go.</p>
            <Link
              href={`/shop-default`}
              className="rounded-full tf-btn btn-primary-main style-3 fw-6 btn-light-icon animate-hover-btn"
            >
              <span>Shop Collection</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import Image from "next/image";
import Link from "next/link";
export default function CollectionBanner() {
  return (
    <section className="flat-spacing-12">
      <div className="container">
        <div className="tf-grid-layout md-col-2 tf-img-with-text">
          <div className="tf-image-wrap wow fadeInUp" data-wow-delay="0s">
            <Image
              className=""
              
              alt="collection-img"
              src="/images/collections/kitchen-wear-9.jpg"
              width={800}
              height={885}
 style={{ width: "100%", height: "auto" }}             />
          </div>
          <div
            className="tf-content-wrap w-100 wow fadeInUp"
            data-wow-delay="0s"
          >
            <span className="sub-heading text-uppercase fw-7">
              SUMMER SALE 30% OFF
            </span>
            <div className="heading">
              Designed with Storage <br className="d-none d-xl-block" />
              in Mind
            </div>
            <p className="description">
              Sets come equipped with easy to use storage solutions to keep your
              kitchen organized and <br className="d-none d-xl-block" />
              pristine.
            </p>
            <Link
              href={`/shop-collection-list`}
              className="tf-btn style-2 btn-fill radius-3 animate-hover-btn"
            >
              Shop collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

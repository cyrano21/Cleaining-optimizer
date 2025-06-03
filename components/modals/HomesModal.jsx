"use client";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { allHomepages } from "@/data/menu";
import { usePathname } from "next/navigation";
export default function HomesModal() {
  const pathname = usePathname();
  return (
    <div className="modal fade modalDemo" id="modalDemo">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="header">
            <h5 className="demo-title">Ultimate Nextjs Template</h5>
            <span
              className="icon-close icon-close-popup"
              data-bs-dismiss="modal"
            />
          </div>
          <div className="modal-body">
            <div className="tf-modal-content">
              <div className="tf-heading">
                <h4 className="title">Ecomus Demos</h4>
                <p>
                  Ecomus comes with a beautiful collection of modern home pages.
                </p>
              </div>
              <div className="demos-list">
                {allHomepages.map((item, index) => (
                  <div className="demos-item" key={index}>
                    <Link href={item.path} className="image">
                      <Image
                        data-src={item.imgSrc}
                        src={item.imgSrc}
                        alt="image"
                        width={400}
                        height={300}
                        style={{ height: "auto" }}
                        loading="lazy"
                        quality={80}
                      />
                    </Link>
                    <h5 className="name">
                      <Link href={item.path}>{item.title}</Link>
                    </h5>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mega-menu">
            <div className="row-demo">
              {allHomepages.map((item, index) => (
                <div key={index} className="demo-item">
                  <Link href={item.href}>
                    <div className="demo-image position-relative">
                      <Image
                        className="lazyload"
                        data-src={item.imgSrc}
                        alt={item.alt}
                        src={item.imgSrc}
                        width={300}
                        height={329}
                        style={{ height: "auto" }}
                        loading="lazy"
                        quality={80}
                      />
                      {item.labels && (
                        <div className={`demo-label`}>
                          {item.labels.map((label, labelIndex) => (
                            <span
                              key={labelIndex}
                              className={`demo-${label.toLowerCase()}`}
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className={`demo-name  ${
                        pathname == item.href ? "activeMenu" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

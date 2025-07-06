"use client";

import Link from "next/link";
import React from "react";
import Image from "next/image";
import { allHomepages } from "../../data/menu";
import { usePathname } from "next/navigation";

export default function HomeModalNew() {
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
          <div className="mega-menu">
            <div className="container g-0">
              <div className="row demo-product g-0">
                {allHomepages?.map((item) => (
                  <div className="col-6 col-md-4 col-xl-4" key={item.name}>
                    <div className="inner">
                      <Link
                        className={pathname === item.href ? "active" : undefined}
                        href={item.href}
                        target={item?.target}
                      >
                        <div className="thumbnail">
                          <Image
                            width={570}
                            height={600}
                            loading="lazy"
                            src={item.imgSrc}
                            alt={item.alt || "Demo Image"}
                          />
                          <div className="product-hover-action">
                            <ul className="cart-action">
                              <li className="select-option">
                                <Link href={item.href}>View Demo</Link>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <div className="content">
                          <h5 className="title">{item.name}</h5>
                        </div>
                        <div className="label-block">
                          {item?.labels?.map((ll, i) => (
                            <span key={i} className="product-badget">
                              {ll}
                            </span>
                          ))}
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

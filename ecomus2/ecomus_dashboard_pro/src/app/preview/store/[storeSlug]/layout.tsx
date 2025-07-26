"use client";
import React from "react";
import Context from "@/context/Context.jsx";

export default function StoreSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Context>
      {children}
    </Context>
  );
}

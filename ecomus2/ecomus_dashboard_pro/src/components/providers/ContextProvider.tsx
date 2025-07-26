"use client";
import Context from "@/context/Context";
import React from "react";

export function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    <Context>
      {children}
    </Context>
  );
}

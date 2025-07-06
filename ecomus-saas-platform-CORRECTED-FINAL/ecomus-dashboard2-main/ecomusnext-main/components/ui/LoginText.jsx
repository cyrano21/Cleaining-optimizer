'use client';

import { useTranslation } from "react-i18next";

export default function LoginText({ fallback = "Login" }) {
  const { t } = useTranslation();
  
  // Always return the same structure to avoid hydration mismatch
  return <span>{t('login') || fallback}</span>;
}

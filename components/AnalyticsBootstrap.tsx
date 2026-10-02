"use client";

import { useEffect } from "react";
import { initAnalytics, initArticleScroll } from "@/lib/analytics";

/**
 * Точка входа для аналитики.
 *
 * Вынесена в отдельный клиентский файл, потому что корневой layout
 * отдаёт export metadata, а Next.js запрещает смешивать серверные
 * и клиентские директивы в одном модуле. Компонент пустой и
 * монтируется после контента, поэтому на первую отрисовку не влияет.
 */
export function AnalyticsBootstrap() {
  useEffect(() => {
    initAnalytics();
    initArticleScroll();
  }, []);
  return null;
}
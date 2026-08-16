import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  localePrefix: 'always', // 始终显示语言前缀，避免自动重定向
});

export type Locale = (typeof routing.locales)[number];

import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  // 解析请求语言
  let locale = await requestLocale;

  // 验证是否支持，否则回退到默认
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./public/locales/${locale}.json`)).default,
  };
});

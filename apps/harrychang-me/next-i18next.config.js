module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-TW'],
    localePath: './public/locales',
    defaultNS: 'common',
    fallbackLng: 'en',
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
}

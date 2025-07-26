/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
  },
  ns: ['common', 'translation'],
  defaultNS: 'common',
  localePath: require('path').resolve('./locales'),
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};

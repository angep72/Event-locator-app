const i18n = require('i18n');
const path = require('path');

// Configure i18n
i18n.configure({
  locales: ['en', 'fr', 'es', 'de'], // list of languages you want to support
  directory: path.join(__dirname, 'locales'), // directory where translation files will be stored
  defaultLocale: 'en', // default language
  objectNotation: true, // use dot notation for nested translations
  updateFiles: false, // don't automatically add missing translations in production
  cookie: 'lang' // the name of the cookie that stores the user's preferred language
});
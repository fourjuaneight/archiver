module.exports = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  endOfLine: 'auto',
  importOrder: [
    'react', // React itself
    '<THIRD_PARTY_MODULES>', // node_modules
    '^(cplibrary|cpicons|cputil|cpclient|@cpclient|cpshots).*$', // Workspace packages
    'components/.*$', // React Components
    '^(constants|data|hooks|util|utils)/.*$', // Various helpers
    '^(\\.|\\.\\.)/(.(?!.(css|scss)))*$', // Any local imports that AREN'T styles.
    '\\.(css|scss)$', // Styles
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderCaseInsensitive: true,
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 200,
      },
    },
  ],
  printWidth: 80,
  proseWrap: 'preserve',
  requirePragma: false,
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  useTabs: false,
  plugins: ['@trivago/prettier-plugin-sort-imports'],
};

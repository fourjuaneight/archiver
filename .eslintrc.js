const prettierConf = require('./prettier.config');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb/base', 'prettier'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    tw: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      impliedStrict: true,
      classes: true,
    },
    sourceType: 'module',
  },
  plugins: ['prettier'],
  rules: {
    'id-length': [
      2,
      {
        exceptions: ['_', 'a', 'b', 'c', 'i', 'x', 'y', 'z'],
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['error', 'info'],
      },
    ],
    'no-case-declarations': 0,
    'no-nested-ternary': 0,
    'prettier/prettier': ['error', prettierConf],
  },
};

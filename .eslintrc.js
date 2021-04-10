const prettierConf = require('./prettier.config');

module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:react/recommended',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    tw: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    ecmaFeatures: {
      classes: true,
      impliedStrict: true,
      jsx: true,
    },
    sourceType: 'module',
  },
  plugins: ['prettier', '@typescript-eslint'],
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
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-useless-constructor': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
};

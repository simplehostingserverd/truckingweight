// Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
// PROPRIETARY AND CONFIDENTIAL
// Migrated ESLint config for ESLint v9+ (eslint.config.js)

import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat();

export default [
  ...compat.extends(['eslint:recommended']),
  js(),
  ...compat.plugins(['@typescript-eslint']),
  {
    ignores: ['node_modules/', '.next/', 'out/', 'public/'],
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-extra-semi': 'error',
      semi: ['error', 'always'],
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],
      'react/jsx-no-duplicate-props': 'error',
      'jsx-quotes': ['error', 'prefer-double'],
      'comma-dangle': [
        'error',
        {
          arrays: 'always-multiline',
          objects: 'always-multiline',
          imports: 'always-multiline',
          exports: 'always-multiline',
          functions: 'never',
        },
      ],
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];

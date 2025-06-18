// Copyright (c) 2025 Cosmo Exploit Group LLC. All Rights Reserved.
// PROPRIETARY AND CONFIDENTIAL
// ESLint config for ESLint v9+ (eslint.config.js)

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  // Base recommended configs
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      'node_modules/',
      '.next/',
      'out/',
      'public/',
      'dist/',
      'build/',
      '**/*.d.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/__tests__/',
      '**/__mocks__/',
      'next.config.mjs',
      'tailwind.config.cjs',
      'postcss.config.js',
      'jest.config.cjs',
    ],
  },

  // JavaScript files
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        module: 'readonly',
        navigator: 'readonly',
        Audio: 'readonly',
        speechSynthesis: 'readonly',
        alert: 'readonly',
        require: 'readonly',
        performance: 'readonly',
        Cesium: 'readonly',
        Image: 'readonly',
        Buffer: 'readonly',
        PDFKit: 'readonly',
        NodeJS: 'readonly',
        TextField: 'readonly',
        error: 'readonly',
        key: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-extra-semi': 'error',
      semi: ['error', 'always'],
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
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: tsparser,
      globals: {
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        TextEncoder: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        navigator: 'readonly',
        Audio: 'readonly',
        speechSynthesis: 'readonly',
        alert: 'readonly',
        require: 'readonly',
        performance: 'readonly',
        Cesium: 'readonly',
        Image: 'readonly',
        Buffer: 'readonly',
        PDFKit: 'readonly',
        NodeJS: 'readonly',
        TextField: 'readonly',
        error: 'readonly',
        key: 'readonly',
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-extra-semi': 'error',
      semi: ['error', 'always'],
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
  },
];

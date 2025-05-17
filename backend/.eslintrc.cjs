module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    'no-undef': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'generated/',
    'prisma/generated/',
    '*.d.ts',
    '*.min.js',
  ],
};

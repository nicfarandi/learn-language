const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  globalIgnores(['dist/**', '.expo/**', 'coverage/**', 'android/**', 'references/**']),
  { rules: { 'react-hooks/exhaustive-deps': 'error', 'no-duplicate-imports': 'error' } },
]);

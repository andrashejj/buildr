/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist', 'node_modules', '.expo', 'android', 'ios', '*.lock'],
  },
  {
    rules: {
      'react/display-name': 'off',
    },
  },
]);

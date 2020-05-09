module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: [
		'plugin:react/recommended',
		'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
		'plugin:prettier/recommended', // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
		'plugin:react-hooks/recommended',
		'plugin:react-native/all'
],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react-native',
		'@typescript-eslint',
		'react-hooks',
		'prettier',
	],
	rules: {
		'react-native/no-raw-text': 0,
	}
};

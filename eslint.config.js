// https://docs.expo.dev/guides/using-eslint/
const expoConfig = require('eslint-config-expo/flat');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
	...(Array.isArray(expoConfig) ? expoConfig : [expoConfig]),
	prettierRecommended,
	{
		// `functions/` has its own ESLint setup. `src/` is un-ported Expo SDK 37
		// code that is linted again as each module is ported in later Phase 4 issues.
		ignores: ['dist/*', 'functions/**', 'src/**', 'node_modules/**'],
	},
];

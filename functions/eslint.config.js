const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');

// ESLint (flat config) + @typescript-eslint, ported from the old tslint.json.
// Formatting rules (e.g. tslint's `trailing-comma`) are intentionally left to
// Prettier; this config covers correctness/style rules only. Scope matches the
// old `tslint --project tsconfig.json`: the compiled source, not the tests.
module.exports = tseslint.config(
	{
		ignores: [
			'lib/**',
			'node_modules/**',
			'**/*.spec.ts',
			'**/*.integration.ts',
			'**/*.js',
		],
	},
	{
		files: ['src/**/*.ts'],
		plugins: {
			'@typescript-eslint': tseslint.plugin,
			import: importPlugin,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: __dirname,
			},
		},
		rules: {
			// -- Strict errors --
			'@typescript-eslint/adjacent-overload-signatures': 'error',
			'no-sequences': 'error', // ban-comma-operator
			'@typescript-eslint/no-namespace': 'error',
			'no-param-reassign': 'error', // no-parameter-reassignment
			'@typescript-eslint/triple-slash-reference': 'error', // no-reference
			'@typescript-eslint/no-unnecessary-type-assertion': 'error',
			'no-labels': ['error', { allowLoop: true, allowSwitch: true }], // label-position
			'no-cond-assign': 'error', // no-conditional-assignment
			'no-new-wrappers': 'error', // no-construct
			'no-duplicate-case': 'error', // no-duplicate-switch-case
			'@typescript-eslint/no-redeclare': 'error', // no-duplicate-variable
			'@typescript-eslint/no-shadow': 'error', // no-shadowed-variable
			'no-empty': ['error', { allowEmptyCatch: true }],
			'@typescript-eslint/no-floating-promises': 'error',
			'import/no-extraneous-dependencies': 'error', // no-implicit-dependencies
			'@typescript-eslint/no-invalid-this': 'error',
			'no-throw-literal': 'error', // no-string-throw
			'no-unsafe-finally': 'error',
			'@typescript-eslint/no-confusing-void-expression': [
				'error',
				{ ignoreArrowShorthand: true },
			], // no-void-expression
			'no-duplicate-imports': 'error',

			// -- Strong warnings --
			'@typescript-eslint/no-empty-object-type': 'warn', // no-empty-interface
			'import/no-unassigned-import': 'warn', // no-import-side-effect
			'no-var': 'warn', // no-var-keyword
			eqeqeq: 'warn', // triple-equals
			'@typescript-eslint/no-deprecated': 'warn', // deprecation

			// -- Light warnings --
			'@typescript-eslint/prefer-for-of': 'warn',
			'@typescript-eslint/unified-signatures': 'warn',
			'prefer-const': 'warn',
		},
	}
);

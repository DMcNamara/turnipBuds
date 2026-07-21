module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	// Emulator integration tests (*.integration.spec.ts) run via a separate
	// config (jest.integration.config.js) so `npm test` stays emulator-free.
	testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.tsx?$'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
	// jest@29 changed the default snapshot serializer (dropping the `Object {`
	// / `Array [` prefixes). The golden-master snapshots were committed under
	// jest@26, so keep the old format to prove the predictions are byte-identical
	// across the upgrade without rewriting the committed snapshots.
	snapshotFormat: {
		printBasicPrototype: true,
	},
};

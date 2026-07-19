module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
	// Emulator integration tests (*.integration.spec.ts) run via a separate
	// config (jest.integration.config.js) so `npm test` stays emulator-free.
	testPathIgnorePatterns: ['/node_modules/', '\\.integration\\.spec\\.tsx?$'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

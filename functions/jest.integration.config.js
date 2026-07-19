// Jest config for the Firestore-emulator INTEGRATION tests.
// These require a running emulator, so they are kept out of the plain
// `npm test` unit run (see jest.config.js). Run them with:
//   firebase emulators:exec --only firestore 'npm run test:integration'
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	// Only the *.integration.spec.ts files.
	testRegex: '\\.integration\\.spec\\.tsx?$',
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

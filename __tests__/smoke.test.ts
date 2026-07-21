/**
 * Phase 4 scaffold smoke test.
 *
 * Proves the jest-expo + babel TypeScript runner is wired and green on the
 * new stack. The real `src/**` specs are re-enabled module-by-module as they
 * are ported (see the `<rootDir>/src/` entry in the jest `testPathIgnorePatterns`).
 */
describe('scaffold smoke test', () => {
	it('runs TypeScript specs through the jest-expo runner', () => {
		const sum = (a: number, b: number): number => a + b;
		expect(sum(2, 2)).toBe(4);
	});
});

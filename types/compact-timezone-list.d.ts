/**
 * `compact-timezone-list` ships no TypeScript declarations. Declare the minimal
 * shape the app relies on (the default export is the list of timezones).
 */
declare module 'compact-timezone-list' {
	export interface CompactTimezone {
		label: string;
		tzCode: string;
		offset: string;
	}
	const timezones: CompactTimezone[];
	export default timezones;
}

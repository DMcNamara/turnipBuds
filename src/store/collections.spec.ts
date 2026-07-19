import { Pattern } from '../constants';
import { PriceAnalysis, WeekPrice } from './collections';

// A realistic set of possibilities for one predicted pattern. Each possibility
// is a 14-slot [min, max] array (buy, buy, monAM..satPM) in the plausible
// turnip range (buy ~90-110, sells ~40-600).
const matchesFixture: number[][][] = [
	[
		[100, 100],
		[100, 100],
		[90, 95],
		[85, 92],
		[140, 200],
		[300, 600],
		[200, 400],
		[70, 80],
		[60, 70],
		[55, 65],
		[50, 60],
		[45, 55],
		[42, 50],
		[40, 48],
	],
];

function makePrediction(
	patternIdx: number,
	matches: PriceAnalysis[0]['matches'] | string
): PriceAnalysis[0] {
	return {
		patternIdx,
		patternName: 'fixture',
		// The stored (Firestore) shape allows matches to be a JSON string; cast
		// so we can exercise that round-trip.
		matches: matches as PriceAnalysis[0]['matches'],
		probability: 1,
		probabilityPerMatch: 1,
	};
}

describe('WeekPrice', () => {
	describe('constructor', () => {
		it('defaults to empty predictions and null prices when constructed with no args', () => {
			const week = new WeekPrice();

			expect(week.predictions).toEqual([]);
			expect(week.id).toBe('');
			expect(week.start).toBeNull();
			expect(week.islandBuyPrice).toBeNull();
			expect(week.previousPattern).toBeNull();
			expect(week.monAM).toBeNull();
			expect(week.satPM).toBeNull();
			expect(week.pattern).toBeNull();
		});

		it('keeps default predictions when props omit predictions', () => {
			const week = new WeekPrice({ islandBuyPrice: 105, monAM: 90 });

			expect(week.islandBuyPrice).toBe(105);
			expect(week.monAM).toBe(90);
			expect(week.predictions).toEqual([]);
		});

		it('parses a JSON-string matches field back into a nested array (Firestore workaround)', () => {
			const week = new WeekPrice({
				predictions: [
					makePrediction(
						Pattern.LargeSpike,
						JSON.stringify(matchesFixture)
					),
				],
			});

			expect(Array.isArray(week.predictions[0].matches)).toBe(true);
			expect(week.predictions[0].matches).toEqual(matchesFixture);
		});

		it('passes an already-array matches field through untouched', () => {
			const week = new WeekPrice({
				predictions: [makePrediction(Pattern.LargeSpike, matchesFixture)],
			});

			expect(week.predictions[0].matches).toEqual(matchesFixture);
			// Not re-serialized: still deep-equal to the original array structure.
			expect(Array.isArray(week.predictions[0].matches)).toBe(true);
		});
	});

	describe('getMinMax', () => {
		it('filters out predictions with patternIdx < 0 before mapping', () => {
			const week = new WeekPrice({
				predictions: [
					makePrediction(Pattern.Unknown, matchesFixture), // -1, filtered
					makePrediction(Pattern.LargeSpike, matchesFixture), // kept
				],
			});

			const result = week.getMinMax();

			// Only the non-negative pattern survives the filter.
			expect(result).toHaveLength(1);
			expect(result[0]).toEqual({ min: 40, max: 600 });
		});

		it('returns an empty array when every prediction has patternIdx < 0', () => {
			const week = new WeekPrice({
				predictions: [makePrediction(Pattern.Unknown, matchesFixture)],
			});

			expect(week.getMinMax()).toEqual([]);
		});

		it('maps every kept prediction to its own min/max entry', () => {
			const week = new WeekPrice({
				predictions: [
					makePrediction(Pattern.Fluctuating, matchesFixture),
					makePrediction(Pattern.LargeSpike, matchesFixture),
				],
			});

			expect(week.getMinMax()).toEqual([
				{ min: 40, max: 600 },
				{ min: 40, max: 600 },
			]);
		});
	});
});

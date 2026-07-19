import { Pattern } from '../../constants';
import { PriceAnalysis, WeekPrice } from '../collections';
import {
	getMinMax,
	getPredictionArray,
	getProphetLink,
} from './week-price.repository';

// Helper to wrap a set of `matches` (possibilities) into the shape getMinMax
// expects (a single PriceAnalysis entry).
function makePrediction(matches: number[][][]): PriceAnalysis[0] {
	return {
		patternIdx: Pattern.LargeSpike,
		patternName: 'Large Spike',
		matches,
		probability: 1,
		probabilityPerMatch: 1,
	};
}

// A realistic 14-slot possibility: [buy, buy, monAM..satPM] as [min, max] pairs.
// Prices in the plausible turnip range (buy ~90-110, sells ~40-600).
const spikePossibility: number[][] = [
	[90, 90], // idx 0 - buy price slot (excluded by .slice(2))
	[90, 90], // idx 1 - buy price slot (excluded by .slice(2))
	[85, 90], // monAM
	[80, 88], // monPM
	[75, 82], // tueAM
	[140, 200], // tuePM
	[300, 600], // wedAM (large spike)
	[200, 400], // wedPM
	[60, 70], // thuAM
	[55, 65], // thuPM
	[50, 60], // friAM
	[45, 55], // friPM
	[42, 50], // satAM
	[40, 48], // satPM
];

describe('week-price.repository', () => {
	describe('getMinMax', () => {
		it('returns { min: -1, max: -1 } when there are no matches', () => {
			expect(getMinMax(makePrediction([]))).toEqual({ min: -1, max: -1 });
		});

		it('computes min/max across a single varied possibility, excluding the first two (buy) slots', () => {
			expect(getMinMax(makePrediction([spikePossibility]))).toEqual({
				min: 40,
				max: 600,
			});
		});

		it('excludes the first two entries of each possibility (buy-price slots)', () => {
			// The two buy slots hold extreme values that would dominate min/max
			// if they were not sliced off.
			const possibility: number[][] = [
				[1, 1], // buy slot - would push min to 1 if included
				[999, 999], // buy slot - would push max to 999 if included
				[80, 90], // monAM
				[70, 100], // monPM
			];
			expect(getMinMax(makePrediction([possibility]))).toEqual({
				min: 70,
				max: 100,
			});
		});

		it('ignores per-slot pairs where min === max (flat prices)', () => {
			// Only the non-flat slot [80, 120] should contribute; the flat
			// [90, 90] pairs are skipped entirely.
			const possibility: number[][] = [
				[90, 90],
				[90, 90],
				[90, 90], // flat - skipped
				[80, 120], // contributes
				[100, 100], // flat - skipped
			];
			expect(getMinMax(makePrediction([possibility]))).toEqual({
				min: 80,
				max: 120,
			});
		});

		it('returns the untouched seed { min: 999, max: 0 } for a wholly-flat possibility (quirk)', () => {
			// Every non-buy slot is flat, so nothing updates the seeded values
			// and the raw seed leaks out unchanged.
			const flat: number[][] = [
				[90, 90],
				[90, 90],
				[100, 100],
				[100, 100],
				[100, 100],
			];
			expect(getMinMax(makePrediction([flat]))).toEqual({
				min: 999,
				max: 0,
			});
		});

		it('computes a global min/max across multiple possibilities', () => {
			const secondPossibility: number[][] = [
				[100, 100], // buy slot
				[100, 100], // buy slot
				[90, 95], // monAM
				[25, 30], // monPM (lower than the first possibility's min)
				[400, 500], // tueAM
				[80, 90],
				[70, 80],
				[60, 70],
				[55, 65],
				[50, 60],
				[45, 55],
				[40, 50],
				[35, 45],
				[30, 40],
			];
			// First possibility spans 40..600, second spans 25..500 -> global 25..600.
			expect(
				getMinMax(makePrediction([spikePossibility, secondPossibility]))
			).toEqual({ min: 25, max: 600 });
		});

		it('lets a possibility with only two entries drag the outer min to -1 while leaving max at the 0 seed (quirk)', () => {
			// After .slice(2) this possibility is empty, so getPossibilityMinMax
			// returns { min: -1, max: -1 }. In the outer reducer, -1 < 999 sets
			// min to -1, but -1 > 0 is false so max keeps its 0 seed.
			const twoEntryOnly: number[][] = [
				[90, 90],
				[90, 90],
			];
			expect(getMinMax(makePrediction([twoEntryOnly]))).toEqual({
				min: -1,
				max: 0,
			});
		});
	});

	describe('getPredictionArray', () => {
		it('returns 14 elements with islandBuyPrice duplicated at indexes 0 and 1, then monAM..satPM', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				monAM: 90,
				monPM: 88,
				tueAM: 85,
				tuePM: 82,
				wedAM: 120,
				wedPM: 150,
				thuAM: 300,
				thuPM: 250,
				friAM: 60,
				friPM: 55,
				satAM: 50,
				satPM: 45,
			});

			const result = getPredictionArray(week);

			expect(result).toHaveLength(14);
			expect(result[0]).toBe(100);
			expect(result[1]).toBe(100);
			expect(result).toEqual([
				100, 100, 90, 88, 85, 82, 120, 150, 300, 250, 60, 55, 50, 45,
			]);
		});

		it('turns null price slots into NaN via parseInt (quirk)', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				monAM: 90,
			});

			const result = getPredictionArray(week);

			expect(result).toHaveLength(14);
			expect(result[0]).toBe(100);
			expect(result[1]).toBe(100);
			expect(result[2]).toBe(90);
			// monPM..satPM are null on the fresh WeekPrice -> parseInt(null) === NaN.
			result.slice(3).forEach((value) => {
				expect(Number.isNaN(value)).toBe(true);
			});
		});
	});

	describe('getProphetLink', () => {
		it('builds the turnipprophet.io link with the buy price followed by 12 dot-joined slots', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				monAM: 90,
				monPM: 88,
				tueAM: 85,
				tuePM: 82,
				wedAM: 120,
				wedPM: 150,
				thuAM: 300,
				thuPM: 250,
				friAM: 60,
				friPM: 55,
				satAM: 50,
				satPM: 45,
			});

			expect(getProphetLink(week)).toBe(
				'https://turnipprophet.io/?prices=100.90.88.85.82.120.150.300.250.60.55.50.45'
			);
		});

		it('appends &pattern=<n> when previousPattern is set', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				previousPattern: Pattern.LargeSpike,
				monAM: 90,
				monPM: 88,
				tueAM: 85,
				tuePM: 82,
				wedAM: 120,
				wedPM: 150,
				thuAM: 300,
				thuPM: 250,
				friAM: 60,
				friPM: 55,
				satAM: 50,
				satPM: 45,
			});

			expect(getProphetLink(week)).toBe(
				`https://turnipprophet.io/?prices=100.90.88.85.82.120.150.300.250.60.55.50.45&pattern=${Pattern.LargeSpike}`
			);
		});

		it('omits the pattern param when previousPattern is null', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				previousPattern: null,
				monAM: 90,
				monPM: 88,
				tueAM: 85,
				tuePM: 82,
				wedAM: 120,
				wedPM: 150,
				thuAM: 300,
				thuPM: 250,
				friAM: 60,
				friPM: 55,
				satAM: 50,
				satPM: 45,
			});

			expect(getProphetLink(week)).not.toContain('&pattern=');
		});

		it('renders null price slots as empty segments in the joined string (quirk)', () => {
			const week = new WeekPrice({
				islandBuyPrice: 100,
				monAM: 90,
			});

			// monPM..satPM are null -> join('.') collapses them to empty segments,
			// producing the trailing run of dots after monAM.
			expect(getProphetLink(week)).toBe(
				'https://turnipprophet.io/?prices=100.90...........'
			);
		});
	});
});

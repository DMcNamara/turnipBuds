import * as StalkMarket from './stalk-market';
import {
	getLikeliestPattern,
	getMostRecentValue,
	getPredictionArray,
	getRecentValueObj,
	getSaveablePrediction,
	pricesUpdated,
} from './predictions';

/**
 * These are characterization tests: they assert the CURRENT behavior of the
 * prediction helpers, including quirks (e.g. `parseInt(null)` -> NaN), so the
 * behavior can be compared byte-for-byte after the Node / dependency upgrades.
 */

const fullWeek = {
	islandBuyPrice: 100,
	monAM: 90,
	monPM: 85,
	tueAM: 80,
	tuePM: 75,
	wedAM: 70,
	wedPM: 65,
	thuAM: 60,
	thuPM: 55,
	friAM: 50,
	friPM: 45,
	satAM: 40,
	satPM: 35,
	previousPattern: -1,
	start: '2020-04-05',
};

describe('getPredictionArray', () => {
	it('returns 14 elements with the buy price doubled at the front', () => {
		const array = getPredictionArray(fullWeek);
		expect(array).toHaveLength(14);
		// buy price appears twice
		expect(array[0]).toBe(100);
		expect(array[1]).toBe(100);
		// then the 12 AM/PM slots in order
		expect(array).toEqual([
			100,
			100,
			90,
			85,
			80,
			75,
			70,
			65,
			60,
			55,
			50,
			45,
			40,
			35,
		]);
	});

	it('parses string prices with parseInt', () => {
		const array = getPredictionArray({ ...fullWeek, monAM: '123' });
		expect(array[2]).toBe(123);
	});

	it('quirk: parseInt(null) -> NaN for empty slots', () => {
		const array = getPredictionArray({ ...fullWeek, satPM: null });
		expect(array[13]).toBeNaN();
	});
});

describe('getRecentValueObj', () => {
	it('returns { value, time } for a truthy value', () => {
		expect(getRecentValueObj(42, 'monAM')).toEqual({
			value: 42,
			time: 'monAM',
		});
	});

	it('returns null for null', () => {
		expect(getRecentValueObj(null, 'monAM')).toBeNull();
	});

	it('quirk: treats a value of 0 as missing (falsy)', () => {
		expect(getRecentValueObj(0, 'monAM')).toBeNull();
	});
});

describe('getMostRecentValue', () => {
	it('picks the latest non-null slot, scanning from satPM backwards', () => {
		const week = {
			islandBuyPrice: 100,
			monAM: 90,
			monPM: null,
			tueAM: 80,
			tuePM: null,
			wedAM: null,
			wedPM: null,
			thuAM: null,
			thuPM: null,
			friAM: null,
			friPM: null,
			satAM: null,
			satPM: null,
		};
		expect(getMostRecentValue(week)).toEqual({ value: 80, time: 'tueAM' });
	});

	it('prefers satPM when it is filled', () => {
		expect(getMostRecentValue(fullWeek)).toEqual({
			value: 35,
			time: 'satPM',
		});
	});

	it('falls back to the island buy price when only it is set', () => {
		const week = {
			islandBuyPrice: 110,
			monAM: null,
			monPM: null,
			tueAM: null,
			tuePM: null,
			wedAM: null,
			wedPM: null,
			thuAM: null,
			thuPM: null,
			friAM: null,
			friPM: null,
			satAM: null,
			satPM: null,
		};
		expect(getMostRecentValue(week)).toEqual({
			value: 110,
			time: 'islandBuyPrice',
		});
	});

	it('returns null when every slot is empty', () => {
		const week = {
			islandBuyPrice: null,
			monAM: null,
			monPM: null,
			tueAM: null,
			tuePM: null,
			wedAM: null,
			wedPM: null,
			thuAM: null,
			thuPM: null,
			friAM: null,
			friPM: null,
			satAM: null,
			satPM: null,
		};
		expect(getMostRecentValue(week)).toBeNull();
	});

	it('quirk: treats a value of 0 as missing and keeps scanning', () => {
		const week = {
			islandBuyPrice: 105,
			monAM: 0,
			monPM: null,
			tueAM: null,
			tuePM: null,
			wedAM: null,
			wedPM: null,
			thuAM: null,
			thuPM: null,
			friAM: null,
			friPM: null,
			satAM: null,
			satPM: null,
		};
		expect(getMostRecentValue(week)).toEqual({
			value: 105,
			time: 'islandBuyPrice',
		});
	});
});

describe('pricesUpdated', () => {
	it('is false when the before doc is missing', () => {
		expect(pricesUpdated(undefined, fullWeek)).toBe(false);
	});

	it('is false when the after doc is missing', () => {
		expect(pricesUpdated(fullWeek, undefined)).toBe(false);
	});

	it('is true when previousPattern differs', () => {
		expect(
			pricesUpdated(fullWeek, { ...fullWeek, previousPattern: 2 })
		).toBe(true);
	});

	it('is true when any price slot differs', () => {
		expect(pricesUpdated(fullWeek, { ...fullWeek, wedPM: 66 })).toBe(true);
	});

	it('is false when only a non-price field differs', () => {
		expect(
			pricesUpdated(fullWeek, { ...fullWeek, start: '2021-01-01' })
		).toBe(false);
	});
});

describe('getSaveablePrediction', () => {
	it('serializes the nested matches array to a JSON string and leaves other fields untouched', () => {
		const prediction = {
			patternIdx: 1,
			patternName: 'Big Spike (Pattern 1)',
			matches: [[[100, 100], [90, 140]]],
			probability: 55,
			probabilityPerMatch: 55,
		};
		const saveable = getSaveablePrediction(prediction);
		expect(saveable.matches).toBe(JSON.stringify(prediction.matches));
		expect(typeof saveable.matches).toBe('string');
		expect(saveable.patternIdx).toBe(1);
		expect(saveable.patternName).toBe('Big Spike (Pattern 1)');
		expect(saveable.probability).toBe(55);
		expect(saveable.probabilityPerMatch).toBe(55);
	});
});

describe('getLikeliestPattern', () => {
	const makePattern = (patternIdx: number, probability: number) => ({
		patternIdx,
		patternName: `pattern ${patternIdx}`,
		matches: [],
		probability,
		probabilityPerMatch: probability,
	});

	it('excludes the ALL pattern (patternIdx === -1) and returns the highest probability', () => {
		const predictions = [
			makePattern(-1, 100),
			makePattern(0, 20),
			makePattern(1, 55),
			makePattern(2, 10),
			makePattern(3, 15),
		] as StalkMarket.PriceAnalysis;
		expect(getLikeliestPattern(predictions).patternIdx).toBe(1);
	});

	it('quirk: on a tie, reduce keeps the LATER element (strict > comparison)', () => {
		// reduce uses `prev.probability > current.probability ? prev : current`,
		// so on an exact tie it takes `current` -> the last equal element wins.
		const predictions = [
			makePattern(-1, 100),
			makePattern(0, 40),
			makePattern(1, 40),
			makePattern(2, 20),
			makePattern(3, 0),
		] as StalkMarket.PriceAnalysis;
		expect(getLikeliestPattern(predictions).patternIdx).toBe(1);
	});
});

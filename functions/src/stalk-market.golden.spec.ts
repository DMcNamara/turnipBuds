import * as StalkMarket from './stalk-market';
import { getPredictionArray } from './predictions';

/**
 * Golden-master (characterization) test for the `stalk-market` package.
 *
 * This is the canary for the Node 10 -> 22 / dependency modernization: the
 * turnip-price predictions produced by `StalkMarket.analyzePrices` must be
 * byte-identical after the upgrade. The fixtures are fed through exactly the
 * same code path as the `setPredictions` Cloud Function trigger:
 *
 *   const array = getPredictionArray(week);
 *   StalkMarket.analyzePrices(
 *     array,
 *     week.previousPattern !== null && week.previousPattern >= 0
 *       ? week.previousPattern
 *       : undefined
 *   );
 *
 * The committed snapshots MUST NOT change after the upgrade. If they do, the
 * prediction algorithm has drifted.
 */

function analyzeWeek(week: any) {
	const array = getPredictionArray(week);
	return StalkMarket.analyzePrices(
		array,
		week.previousPattern !== null && week.previousPattern >= 0
			? week.previousPattern
			: undefined
	);
}

const completeWeek = {
	islandBuyPrice: 100,
	monAM: 90,
	monPM: 85,
	tueAM: 120,
	tuePM: 160,
	wedAM: 200,
	wedPM: 150,
	thuAM: 100,
	thuPM: 90,
	friAM: 85,
	friPM: 80,
	satAM: 75,
	satPM: 70,
	previousPattern: -1,
};

const partialWeek = {
	islandBuyPrice: 100,
	monAM: 95,
	monPM: 90,
	tueAM: 88,
	tuePM: 85,
	wedAM: null,
	wedPM: null,
	thuAM: null,
	thuPM: null,
	friAM: null,
	friPM: null,
	satAM: null,
	satPM: null,
	previousPattern: -1,
};

const weekWithPreviousPattern = {
	...completeWeek,
	// previousPattern 2 (Decreasing) actually gets passed through to analyzePrices
	previousPattern: 2,
};

const decreasingWeek = {
	islandBuyPrice: 100,
	monAM: 85,
	monPM: 80,
	tueAM: 76,
	tuePM: 72,
	wedAM: 68,
	wedPM: 64,
	thuAM: 60,
	thuPM: 56,
	friAM: 52,
	friPM: 48,
	satAM: 44,
	satPM: 40,
	previousPattern: -1,
};

describe('stalk-market golden master: analyzePrices', () => {
	it('(a) complete week', () => {
		expect(analyzeWeek(completeWeek)).toMatchSnapshot();
	});

	it('(b) partial week (only Mon-Tue filled, rest NaN)', () => {
		expect(analyzeWeek(partialWeek)).toMatchSnapshot();
	});

	it('(c) week with previousPattern passed', () => {
		expect(analyzeWeek(weekWithPreviousPattern)).toMatchSnapshot();
	});

	it('(d) decreasing-pattern week', () => {
		expect(analyzeWeek(decreasingWeek)).toMatchSnapshot();
	});
});

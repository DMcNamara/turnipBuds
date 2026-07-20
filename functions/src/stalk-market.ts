/**
 * Pure-TS port of `stalk-market@2.3.0` (PriceMatcher.cpp + src/js/index.js).
 *
 * The published package ships a native C++ addon that cannot build or load on
 * Node 14+, so the algorithm is vendored here. This port was validated
 * byte-identical to the native addon (Node 12) across the 4 golden fixtures and
 * 5000 fuzzed inputs in the #90 spike — see issue #95.
 *
 * Two load-bearing behaviors are preserved exactly:
 *  - The C++ uses 32-bit `float` for all rate math; we emulate that with
 *    `Math.fround` (`f`) at each float op. Dropping it drifts the `floor`/`ceil`
 *    range bounds.
 *  - The native addon coerces JS values to C++ `int`; unfilled days arrive as
 *    `NaN` (from `parseInt`) and become `0`. `findMatches` replicates this.
 */

export type PriceAnalysis = ({
	patternIdx: number;
	patternName: string;
	matches: number[][][];
	probability: number;
	probabilityPerMatch: number;
})[];

// C++ uses 32-bit float for all rate math; we emulate with Math.fround (f).
const f = Math.fround;

type MinMax = [number, number];

// maxAndMin: [min,max] ints. rangeA/rangeB: floats.
function rndFltMult(mm: MinMax, rangeA: number, rangeB: number): void {
	const minRange = Math.min(rangeA, rangeB);
	const maxRange = Math.max(rangeA, rangeB);
	mm[0] = Math.floor(f(minRange * mm[0]));
	mm[1] = Math.ceil(f(maxRange * mm[1]));
}

function isPriceOutOfRng(price: number, mm: MinMax): boolean {
	return price !== 0 && (price < mm[0] || mm[1] < price);
}

function rndFltMultAndCheckPrice(
	mm: MinMax,
	rangeA: number,
	rangeB: number,
	price: number
): boolean {
	rndFltMult(mm, rangeA, rangeB);
	const isOutOfRange = isPriceOutOfRng(price, mm);
	if (price !== 0) {
		mm[0] = price;
		mm[1] = price;
	}
	return isOutOfRange;
}

function newMaxAndMins(basePrice: number): MinMax[] {
	const arr: MinMax[] = new Array(14);
	for (let r = 0; r < 14; r++) arr[r] = [basePrice, basePrice];
	return arr;
}

// PATTERN 3: decreasing, spike, decreasing
function matchPattern3(p: number[], out: MinMax[][]): void {
	for (let peakStart = 2; peakStart <= 9; peakStart++) {
		let work = 2;
		const basePrice = p[0];
		let isInvalid = false;
		const mm = newMaxAndMins(basePrice);
		let rateMin1 = f(0.4);
		let rateMax1 = f(0.9);
		for (work = 2; work < peakStart; work++) {
			isInvalid =
				isInvalid ||
				rndFltMultAndCheckPrice(mm[work], rateMin1, rateMax1, p[work]);
			rateMin1 = f(rateMin1 - f(0.03));
			rateMax1 = f(rateMax1 - f(0.03));
			rateMin1 = f(rateMin1 - f(0.02));
		}
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
		work++;
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
		work++;
		let rateMin2 = f(1.4);
		let rateMax2 = f(2.0);
		isInvalid =
			isInvalid ||
			rndFltMultAndCheckPrice(mm[work], f(1.4), rateMax2, p[work]);
		if (p[work] !== 0) rateMin2 = f(p[work] / basePrice);
		work++;
		isInvalid =
			isInvalid ||
			rndFltMultAndCheckPrice(mm[work], rateMin2, rateMax2, p[work]);
		if (p[work] !== 0) {
			rateMin2 = f(p[work] / basePrice);
			rateMax2 = f(p[work] / basePrice);
		}
		work++;
		isInvalid =
			isInvalid ||
			rndFltMultAndCheckPrice(mm[work], f(1.4), rateMax2, p[work]);
		work++;
		if (work < 14) {
			let rateMin3 = f(0.4);
			let rateMax3 = f(0.9);
			for (; work < 14; work++) {
				isInvalid =
					isInvalid ||
					rndFltMultAndCheckPrice(mm[work], rateMin3, rateMax3, p[work]);
				if (p[work] !== 0) {
					rateMin3 = f(p[work] / basePrice);
					rateMax3 = f(p[work] / basePrice);
				}
				rateMin3 = f(rateMin3 - f(0.03));
				rateMax3 = f(rateMax3 - f(0.03));
				rateMin3 = f(rateMin3 - f(0.02));
			}
		}
		if (!isInvalid) out.push(mm);
	}
}

// PATTERN 2: consistently decreasing
function matchPattern2(p: number[], out: MinMax[][]): void {
	let work = 2;
	const basePrice = p[0];
	let isInvalid = false;
	const mm = newMaxAndMins(basePrice);
	let rateMin = f(0.85);
	let rateMax = f(0.9);
	for (; work < 14; work++) {
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], rateMin, rateMax, p[work]);
		if (p[work] !== 0) {
			rateMin = f(p[work] / basePrice);
			rateMax = f(p[work] / basePrice);
		}
		rateMin = f(rateMin - f(0.03));
		rateMax = f(rateMax - f(0.03));
		rateMin = f(rateMin - f(0.02));
	}
	if (!isInvalid) out.push(mm);
}

// PATTERN 1: decreasing middle, high spike, random low
function matchPattern1(p: number[], out: MinMax[][]): void {
	for (let peakStart = 3; peakStart <= 9; peakStart++) {
		let work = 2;
		const basePrice = p[0];
		let isInvalid = false;
		const mm = newMaxAndMins(basePrice);
		let rateMin = f(0.85);
		let rateMax = f(0.9);
		for (; work < peakStart; work++) {
			isInvalid =
				isInvalid ||
				rndFltMultAndCheckPrice(mm[work], rateMin, rateMax, p[work]);
			if (p[work] !== 0) {
				rateMin = f(p[work] / basePrice);
				rateMax = f(p[work] / basePrice);
			}
			rateMin = f(rateMin - f(0.03));
			rateMax = f(rateMax - f(0.03));
			rateMin = f(rateMin - f(0.02));
		}
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
		work++;
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(1.4), f(2.0), p[work]);
		work++;
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(2.0), f(6.0), p[work]);
		work++;
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(1.4), f(2.0), p[work]);
		work++;
		isInvalid =
			isInvalid || rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
		work++;
		for (; work < 14; work++) {
			isInvalid =
				isInvalid || rndFltMultAndCheckPrice(mm[work], f(0.4), f(0.9), p[work]);
		}
		if (!isInvalid) out.push(mm);
	}
}

// PATTERN 0: high, decreasing, high, decreasing, high
function matchPattern0(p: number[], out: MinMax[][]): void {
	for (let decPhaseLen1 = 2; decPhaseLen1 <= 3; decPhaseLen1++) {
		const decPhaseLen2 = 5 - decPhaseLen1;
		for (let hiPhaseLen1 = 0; hiPhaseLen1 <= 6; hiPhaseLen1++) {
			const hiPhaseLen2and3 = 7 - hiPhaseLen1;
			for (let hiPhaseLen3 = 0; hiPhaseLen3 <= hiPhaseLen2and3 - 1; hiPhaseLen3++) {
				const hiPhaseLen2 = hiPhaseLen2and3 - hiPhaseLen3;
				let work = 2;
				const basePrice = p[0];
				let isInvalid = false;
				const mm = newMaxAndMins(basePrice);
				for (let i = 0; i < hiPhaseLen1; i++) {
					isInvalid =
						isInvalid ||
						rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
					work++;
				}
				let rateMin1 = f(0.6);
				let rateMax1 = f(0.8);
				for (let i = 0; i < decPhaseLen1; i++) {
					isInvalid =
						isInvalid ||
						rndFltMultAndCheckPrice(mm[work], rateMin1, rateMax1, p[work]);
					if (p[work] !== 0) {
						rateMin1 = f(p[work] / basePrice);
						rateMax1 = f(p[work] / basePrice);
					}
					rateMin1 = f(rateMin1 - f(0.04));
					rateMax1 = f(rateMax1 - f(0.04));
					rateMin1 = f(rateMin1 - f(0.06));
					work++;
				}
				for (let i = 0; i < hiPhaseLen2; i++) {
					isInvalid =
						isInvalid ||
						rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
					work++;
				}
				let rateMin2 = f(0.6);
				let rateMax2 = f(0.8);
				for (let i = 0; i < decPhaseLen2; i++) {
					isInvalid =
						isInvalid ||
						rndFltMultAndCheckPrice(mm[work], rateMin2, rateMax2, p[work]);
					if (p[work] !== 0) {
						rateMin2 = f(p[work] / basePrice);
						rateMax2 = f(p[work] / basePrice);
					}
					rateMin2 = f(rateMin2 - f(0.04));
					rateMax2 = f(rateMax2 - f(0.04));
					rateMin2 = f(rateMin2 - f(0.06));
					work++;
				}
				for (let i = 0; i < hiPhaseLen3; i++) {
					isInvalid =
						isInvalid ||
						rndFltMultAndCheckPrice(mm[work], f(0.9), f(1.4), p[work]);
					work++;
				}
				if (!isInvalid) out.push(mm);
			}
		}
	}
}

function findMatches(knownPricesIn: number[]): MinMax[][][] {
	// Emulate C++ int coercion of JS values (NaN -> 0).
	const knownPrices = knownPricesIn.map((v) =>
		Number.isFinite(v) ? Math.trunc(v) : 0
	);
	const buyMin = knownPrices[0] !== 0 ? knownPrices[0] : 90;
	const buyMax = knownPrices[1] !== 0 ? knownPrices[1] : 110;
	const matches: MinMax[][][] = [[], [], [], []];
	for (let i = buyMin; i <= buyMax; i++) {
		knownPrices[0] = i;
		knownPrices[1] = i;
		matchPattern0(knownPrices, matches[0]);
		matchPattern1(knownPrices, matches[1]);
		matchPattern2(knownPrices, matches[2]);
		matchPattern3(knownPrices, matches[3]);
	}
	return matches;
}

// ---- JS wrapper (src/js/index.js) ----
const PatternNames = [
	'Fluctuating (Pattern 0)',
	'Big Spike (Pattern 1)',
	'Decreasing (Pattern 2)',
	'Spike (Pattern 3)',
];

const probabilityTable = [
	[20, 30, 15, 35],
	[50, 5, 20, 25],
	[25, 45, 5, 25],
	[45, 25, 15, 15],
	[35, 26, 14, 25],
];

export function getPatternProbabilities(
	previousPattern: number | undefined,
	impossiblePatterns: boolean[]
): number[] {
	if (impossiblePatterns.every((i) => i)) return Array(4).fill(0);
	let probabilities: number[];
	if (previousPattern !== undefined) {
		probabilities = probabilityTable[previousPattern].slice(0);
	} else {
		probabilities = probabilityTable[4].slice(0);
	}
	let total = 0;
	for (let i = 0; i < 4; i++) {
		if (impossiblePatterns[i]) probabilities[i] = 0;
		else total += probabilities[i];
	}
	for (let i = 0; i < 4; i++) probabilities[i] = (probabilities[i] / total) * 100;
	return probabilities;
}

export function analyzePrices(
	knownPrices: number[],
	previousPattern?: number
): PriceAnalysis {
	const matchesByPattern = findMatches(knownPrices);
	const patternProbabilities = getPatternProbabilities(previousPattern, [
		matchesByPattern[0].length === 0,
		matchesByPattern[1].length === 0,
		matchesByPattern[2].length === 0,
		matchesByPattern[3].length === 0,
	]);
	const retValue: PriceAnalysis = [];
	matchesByPattern.forEach((matches, patternIdx) => {
		retValue.push({
			patternIdx,
			patternName: PatternNames[patternIdx],
			matches,
			probability: patternProbabilities[patternIdx],
			probabilityPerMatch:
				matches.length > 0
					? patternProbabilities[patternIdx] / matches.length
					: 0,
		});
	});
	addPatternsAnalysis(retValue);
	return retValue;
}

function addPatternsAnalysis(analysis: PriceAnalysis): void {
	let analyzedMinsAndMaxes: number[][] = [];
	for (let i = 0; i < 14; i++) {
		analyzedMinsAndMaxes.push([Number.MAX_SAFE_INTEGER, 0]);
	}
	let atLeastOneMatch = false;
	analysis.forEach((obj) => {
		obj.matches.forEach((match) => {
			atLeastOneMatch = true;
			match.forEach((day, idx) => {
				analyzedMinsAndMaxes[idx][0] = Math.min(
					day[0],
					analyzedMinsAndMaxes[idx][0]
				);
				analyzedMinsAndMaxes[idx][1] = Math.max(
					day[1],
					analyzedMinsAndMaxes[idx][1]
				);
			});
		});
	});
	if (!atLeastOneMatch) analyzedMinsAndMaxes = [];
	analysis.unshift({
		patternIdx: -1,
		patternName: 'All Patterns',
		matches: analyzedMinsAndMaxes.length > 0 ? [analyzedMinsAndMaxes] : [],
		probability: 100,
		probabilityPerMatch: 100,
	});
}

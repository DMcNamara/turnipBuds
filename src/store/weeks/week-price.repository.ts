import { PriceAnalysis, WeekPrice } from '../collections';

export function getMinMax(prediction: PriceAnalysis[0]) {
	const matches = prediction.matches;
	if (!matches.length) {
		return { min: -1, max: -1 };
	}

	const prices = {
		min: 999,
		max: 0,
	};

	matches.forEach((possibility) => {
		const minMax = getPossibilityMinMax(possibility);
		if (minMax.min < prices.min) {
			prices.min = minMax.min;
		}

		if (minMax.max > prices.max) {
			prices.max = minMax.max;
		}
	});

	return prices;
}

function getPossibilityMinMax(possibility: number[][]) {
	const withoutBuyPrice = possibility.slice(2);
	if (!withoutBuyPrice.length) {
		return { min: -1, max: -1 };
	}
	const prices = {
		min: 999,
		max: 0,
	};

	withoutBuyPrice.forEach((sellPrice) => {
		const min = sellPrice[0];
		const max = sellPrice[1];

		if (min === max) {
			return;
		} else {
			if (min < prices.min) {
				prices.min = min;
			}

			if (max > prices.max) {
				prices.max = max;
			}
		}
	});

	return prices;
}

export function getPredictionArray(week: WeekPrice) {
	return [
		week.islandBuyPrice,
		week.islandBuyPrice,
		week.monAM,
		week.monPM,
		week.tueAM,
		week.tuePM,
		week.wedAM,
		week.wedPM,
		week.thuAM,
		week.thuPM,
		week.friAM,
		week.friPM,
		week.satAM,
		week.satPM,
	].map((val: any) => parseInt(val));
}

export function getProphetLink(week: WeekPrice) {
	const priceString = [
		week.monAM,
		week.monPM,
		week.tueAM,
		week.tuePM,
		week.wedAM,
		week.wedPM,
		week.thuAM,
		week.thuPM,
		week.friAM,
		week.friPM,
		week.satAM,
		week.satPM,
	].join('.');
	const previousPattern = week.previousPattern
		? `&pattern=${week.previousPattern}`
		: '';
	return `https://turnipprophet.io/?prices=${week.islandBuyPrice}.${priceString}${previousPattern}`;
}

import { WeekPrice } from '../collections';

export function getProphetLink(week: WeekPrice) {
	return `https://turnipprophet.io/?prices=${week.islandBuyPrice}.${week.monAM}`;

	// https://turnipprophet.io/?prices=100.88.84.81.77.74.70.65.61....&pattern=0
}

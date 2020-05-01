import { WeekPrice } from '../collections';

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
	return `https://turnipprophet.io/?prices=${week.islandBuyPrice}.${priceString}`;
}

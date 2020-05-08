import * as functions from 'firebase-functions';
import * as StalkMarket from 'stalk-market';

export const setPredictions = functions.firestore
	.document('users/{userId}/weeks/{weekId}')
	.onUpdate((change) => {
		const beforeWeek = change.before.data();
		const week = change.after.data();

		if (
			!change.after.isEqual(change.before) &&
			pricesUpdated(beforeWeek, week) &&
			week
		) {
			const array = getPredictionArray(week);
			const predictions = StalkMarket.analyzePrices(
				array,
				week.previousPattern
			);
			const saveablePredictions = predictions.map((p) => ({
				...p,
				matches: JSON.stringify(p.matches),
			}));

			/** The pattern with a probability of 100%, if there is one */
			const pattern = predictions.find(
				(p) => p.patternIdx !== -1 && p.probability === 100
			);

			return change.after.ref.update({
				predictions: saveablePredictions,
				pattern: pattern?.patternIdx || -1,
			});
		}
		return null;
	});

function getPredictionArray(week: any) {
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

function pricesUpdated<T>(beforeWeek: T, afterWeek: T) {
	if (!beforeWeek || !afterWeek) {
		return false;
	}
	const beforeArray = getPredictionArray(beforeWeek);
	const afterArray = getPredictionArray(afterWeek);
	return beforeArray.some((beforeVal, i) => afterArray[i] !== beforeVal);
}

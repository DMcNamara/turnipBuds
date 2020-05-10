import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import * as StalkMarket from 'stalk-market';

export const setPredictions = functions.firestore
	.document('users/{userId}/weeks/{weekId}')
	.onUpdate(async (change, context) => {
		const beforeWeek = change.before.data();
		const week = change.after.data();

		if (
			!change.after.isEqual(change.before) &&
			pricesUpdated(beforeWeek, week) &&
			week
		) {
			const array = getPredictionArray(week);
			if (array.length) {
				const predictions = StalkMarket.analyzePrices(
					array,
					week.previousPattern
				);
				const saveablePredictions = predictions.map(
					getSaveablePrediction
				);

				await updateUserWithLatestPriceInfo(
					predictions,
					week,
					context.params.weekId,
					context.params.userId
				);

				/** The pattern with a probability of 100%, if there is one */
				const pattern = predictions.find(
					(p) => p.patternIdx !== -1 && p.probability === 100
				);
				return change.after.ref.update({
					predictions: saveablePredictions,
					pattern: pattern?.patternIdx || -1,
				});
			}
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

function getMostRecentValue(week: any): number | null {
	return (
		week.satPM ||
		week.satAM ||
		week.friPM ||
		week.friAM ||
		week.thuPM ||
		week.thuAM ||
		week.wedPM ||
		week.wedAM ||
		week.tuePM ||
		week.tueAM ||
		week.monPM ||
		week.monAM
	);
}

function getSaveablePrediction(prediction: StalkMarket.PriceAnalysis[0]) {
	return {
		...prediction,
		matches: JSON.stringify(prediction.matches),
	};
}

function pricesUpdated<T extends FirebaseFirestore.DocumentData | undefined>(
	beforeWeek: T,
	afterWeek: T
) {
	if (!beforeWeek || !afterWeek) {
		return false;
	}
	const beforeArray = getPredictionArray(beforeWeek);
	const afterArray = getPredictionArray(afterWeek);
	return beforeArray.some((beforeVal, i) => afterArray[i] !== beforeVal);
}

async function updateUserWithLatestPriceInfo(
	predictions: StalkMarket.PriceAnalysis,
	week: any,
	weekId: string,
	userId: string
) {
	const firestore = admin.firestore();

	/** The pattern with the current highest likelihood */
	const likeliestPattern = getSaveablePrediction(
		predictions
			.filter((p) => p.patternIdx !== -1) // remove the ALL pattern
			.reduce((prev, current) =>
				prev.probability > current.probability ? prev : current
			)
	);

	const usersCollection = firestore.collection('users');
	await usersCollection.doc(userId).set(
		{
			price: {
				weekId: weekId,
				start: week.start,
				likeliestPattern,
				mostRecent: getMostRecentValue(week),
			},
		},
		{ merge: true }
	);
}

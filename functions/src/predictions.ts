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
					week.previousPattern !== null && week.previousPattern >= 0
						? week.previousPattern
						: undefined
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

function getMostRecentValue(week: any) {
	return (
		getRecentValueObj(week.satPM, 'satPM') ||
		getRecentValueObj(week.satAM, 'satAM') ||
		getRecentValueObj(week.friPM, 'friPM') ||
		getRecentValueObj(week.friAM, 'friAM') ||
		getRecentValueObj(week.thuPM, 'thuPM') ||
		getRecentValueObj(week.thuAM, 'thuAM') ||
		getRecentValueObj(week.wedPM, 'wedPM') ||
		getRecentValueObj(week.wedAM, 'wedAM') ||
		getRecentValueObj(week.tuePM, 'tuePM') ||
		getRecentValueObj(week.tueAM, 'tueAM') ||
		getRecentValueObj(week.monPM, 'monPM') ||
		getRecentValueObj(week.monAM, 'monAM') ||
		getRecentValueObj(week.islandBuyPrice, 'islandBuyPrice')
	);
}

function getRecentValueObj(value: number | null, time: string) {
	if (value) {
		return { value, time };
	} else {
		return null;
	}
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

	if (beforeWeek.previousPattern !== afterWeek.previousPattern) {
		return true;
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
	const recent = getMostRecentValue(week);
	await usersCollection.doc(userId).set(
		{
			price: {
				weekId: weekId,
				start: week.start,
				likeliestPattern,
				mostRecent: recent?.value,
				mostRecentTime: recent?.time,
			},
		},
		{ merge: true }
	);
}

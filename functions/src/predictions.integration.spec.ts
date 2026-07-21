import * as admin from 'firebase-admin';
import { PredictionFunctions } from './index';
import { assertEmulator, clearFirestore } from './emulator.integration';

/**
 * Integration test for the `setPredictions` Firestore trigger, exercised
 * end-to-end against the emulator: real week docs are written, the trigger is
 * invoked with a real onUpdate Change, and the resulting `predictions` /
 * `pattern` on the week doc and denormalized `price` on the parent user doc are
 * asserted.
 *
 * Run with the emulator:
 *   firebase emulators:exec --only firestore 'npm run test:integration'
 */

// firebase-functions-test is CommonJS and is invoked as a factory.
const functionsTest = require('firebase-functions-test')();

const setPredictions = functionsTest.wrap(PredictionFunctions.setPredictions);

const db = () => admin.firestore();

const USER_ID = 'stalker-uid';
const WEEK_ID = 'week-2020-04-05';
const WEEK_PATH = `users/${USER_ID}/weeks/${WEEK_ID}`;

// A fully-filled week (declining prices) with a known most-recent slot.
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

const emptyWeek = {
	islandBuyPrice: 100,
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
	previousPattern: -1,
	start: '2020-04-05',
};

jest.setTimeout(20000);

/**
 * Sets the week doc to `before`, snapshots it, sets it to `after`, snapshots
 * that, and returns a real onUpdate Change of the two snapshots. Both snapshots
 * carry real refs pointing at the emulator, so `change.after.ref.update(...)`
 * inside the trigger writes back to the same doc.
 */
async function makeUpdateChange(before: object, after: object) {
	const ref = db().doc(WEEK_PATH);
	await ref.set(before);
	const beforeSnap = await ref.get();
	await ref.set(after);
	const afterSnap = await ref.get();
	return functionsTest.makeChange(beforeSnap, afterSnap);
}

describe('setPredictions trigger (Firestore emulator)', () => {
	beforeAll(() => {
		assertEmulator();
	});

	beforeEach(async () => {
		await clearFirestore();
	});

	afterAll(() => {
		functionsTest.cleanup();
	});

	it('writes predictions + pattern on the week doc and denormalizes price onto the user doc', async () => {
		const change = await makeUpdateChange(emptyWeek, fullWeek);

		await setPredictions(change, {
			params: { userId: USER_ID, weekId: WEEK_ID },
		});

		const week = (await db().doc(WEEK_PATH).get()).data()!;
		expect(Array.isArray(week.predictions)).toBe(true);
		expect(week.predictions.length).toBeGreaterThan(0);
		expect(typeof week.pattern).toBe('number');

		// `matches` round-trips as a JSON string (Firestore can't nest arrays).
		for (const prediction of week.predictions) {
			expect(typeof prediction.matches).toBe('string');
			expect(() => JSON.parse(prediction.matches)).not.toThrow();
		}

		const user = (await db().doc(`users/${USER_ID}`).get()).data()!;
		expect(user.price).toMatchObject({
			weekId: WEEK_ID,
			start: '2020-04-05',
			mostRecent: 35,
			mostRecentTime: 'satPM',
		});
		expect(user.price.likeliestPattern).toBeDefined();
		expect(typeof user.price.likeliestPattern.patternIdx).toBe('number');
		// likeliestPattern is a saveable prediction -> matches is a JSON string.
		expect(typeof user.price.likeliestPattern.matches).toBe('string');
	});

	it('writes nothing when no price fields change (only an unrelated field differs)', async () => {
		const change = await makeUpdateChange(fullWeek, {
			...fullWeek,
			start: '2021-01-01',
		});

		const result = await setPredictions(change, {
			params: { userId: USER_ID, weekId: WEEK_ID },
		});

		expect(result).toBeNull();
		const week = (await db().doc(WEEK_PATH).get()).data()!;
		expect(week.predictions).toBeUndefined();
		expect(week.pattern).toBeUndefined();
		// no denormalized price written onto the user doc
		const userSnap = await db().doc(`users/${USER_ID}`).get();
		expect(userSnap.exists).toBe(false);
	});

	it('recomputes when only previousPattern changes', async () => {
		const change = await makeUpdateChange(fullWeek, {
			...fullWeek,
			previousPattern: 0,
		});

		await setPredictions(change, {
			params: { userId: USER_ID, weekId: WEEK_ID },
		});

		const week = (await db().doc(WEEK_PATH).get()).data()!;
		expect(Array.isArray(week.predictions)).toBe(true);
		expect(week.predictions.length).toBeGreaterThan(0);
		expect(typeof week.pattern).toBe('number');
	});
});

import * as admin from 'firebase-admin';

/**
 * Shared helpers for the Firestore-emulator integration tests
 * (`*.integration.spec.ts`). These run against a live Firestore emulator, so
 * they are kept out of the plain `npm test` unit run — see
 * `jest.integration.config.js` and the `test:integration` script.
 */

/** Throws a clear error if the tests are run without the emulator wired up. */
export function assertEmulator(): void {
	if (!process.env.FIRESTORE_EMULATOR_HOST) {
		throw new Error(
			'FIRESTORE_EMULATOR_HOST is not set. Run the integration tests via ' +
				"`firebase emulators:exec --only firestore 'npm run test:integration'`."
		);
	}
}

/** Recursively deletes every document (and subcollection) in a collection. */
async function deleteCollection(
	collection: FirebaseFirestore.CollectionReference
): Promise<void> {
	const snap = await collection.get();
	for (const doc of snap.docs) {
		const subcollections = await doc.ref.listCollections();
		for (const sub of subcollections) {
			await deleteCollection(sub);
		}
		await doc.ref.delete();
	}
}

/**
 * Wipes all documents from the running Firestore emulator so each test starts
 * from a clean slate. Deletes through the same `firebase-admin` app the
 * functions use, so it always targets the same project the data was written
 * under (importing `firebase-functions-test` rewrites `GCLOUD_PROJECT`, so we
 * deliberately do NOT rely on that env var to pick the project to clear).
 */
export async function clearFirestore(): Promise<void> {
	const db = admin.firestore();
	const collections = await db.listCollections();
	for (const collection of collections) {
		await deleteCollection(collection);
	}
}

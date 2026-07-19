import * as admin from 'firebase-admin';
import { addFriend, onUserAdded } from './index';
import { assertEmulator, clearFirestore } from './emulator.integration';

/**
 * Integration tests for the `addFriend` callable and the `onUserAdded`
 * Firestore trigger, exercised end-to-end against the Firestore emulator.
 *
 * These assert the CURRENT backend contract (including quirks) so they survive
 * the functions runtime upgrade. They must be run with the emulator wired up:
 *   firebase emulators:exec --only firestore 'npm run test:integration'
 *
 * `firebase-functions-test` is used only to `wrap` the handlers and synthesize
 * the event context; all reads/writes go to the real emulator via the same
 * `firebase-admin` app that `index.ts` initializes.
 */

// tslint:disable-next-line: no-var-requires
const functionsTest = require('firebase-functions-test')();

const db = () => admin.firestore();

// The emulator can be slow to spin up handlers on the first hit.
jest.setTimeout(20000);

describe('addFriend + onUserAdded (Firestore emulator)', () => {
	beforeAll(() => {
		assertEmulator();
	});

	beforeEach(async () => {
		await clearFirestore();
	});

	afterAll(() => {
		functionsTest.cleanup();
	});

	describe('addFriend callable', () => {
		const wrapped = functionsTest.wrap(addFriend);

		const meContext = {
			auth: { uid: 'me-uid', token: { email: 'me@example.com' } },
		};

		it('throws failed-precondition when unauthenticated', async () => {
			await expect(
				wrapped({ email: 'friend@example.com' }, {})
			).rejects.toMatchObject({ code: 'failed-precondition' });
		});

		it('throws invalid-argument when email is missing', async () => {
			await expect(wrapped({}, meContext)).rejects.toMatchObject({
				code: 'invalid-argument',
			});
		});

		it("throws invalid-argument when adding your own email", async () => {
			await expect(
				wrapped({ email: 'me@example.com' }, meContext)
			).rejects.toMatchObject({ code: 'invalid-argument' });
		});

		it('creates an accepted friend doc with the target uid when the user exists', async () => {
			await db()
				.collection('users')
				.doc('target-uid')
				.set({ email: 'friend@example.com' });

			await wrapped({ email: 'friend@example.com' }, meContext);

			const snap = await db()
				.collection('friends')
				.where('uid', '==', 'me-uid')
				.get();
			expect(snap.size).toBe(1);
			expect(snap.docs[0].data()).toMatchObject({
				accepted: true,
				email: 'friend@example.com',
				friend: 'target-uid',
				uid: 'me-uid',
			});
		});

		it('creates a pending friend doc (friend: "") when the target user does not exist', async () => {
			await wrapped({ email: 'ghost@example.com' }, meContext);

			const snap = await db()
				.collection('friends')
				.where('uid', '==', 'me-uid')
				.get();
			expect(snap.size).toBe(1);
			expect(snap.docs[0].data()).toMatchObject({
				accepted: true,
				email: 'ghost@example.com',
				friend: '',
				uid: 'me-uid',
			});
		});

		it('throws already-exists when the same friend is added twice', async () => {
			await wrapped({ email: 'friend@example.com' }, meContext);

			await expect(
				wrapped({ email: 'friend@example.com' }, meContext)
			).rejects.toMatchObject({ code: 'already-exists' });

			const snap = await db()
				.collection('friends')
				.where('uid', '==', 'me-uid')
				.get();
			expect(snap.size).toBe(1);
		});
	});

	describe('onUserAdded trigger', () => {
		const wrapped = functionsTest.wrap(onUserAdded);

		/** Build a real onCreate snapshot by writing + reading the user doc. */
		async function makeUserSnapshot(uid: string, email: string) {
			await db().collection('users').doc(uid).set({ email });
			return db().collection('users').doc(uid).get();
		}

		it('backfills the new uid onto every matching pending friend doc (batch)', async () => {
			const email = 'newbie@example.com';
			await db()
				.collection('friends')
				.doc('pending-a')
				.set({ accepted: true, email, friend: '', uid: 'friend-1' });
			await db()
				.collection('friends')
				.doc('pending-b')
				.set({ accepted: true, email, friend: '', uid: 'friend-2' });
			await db().collection('friends').doc('other').set({
				accepted: true,
				email: 'someone-else@example.com',
				friend: '',
				uid: 'friend-3',
			});

			const snap = await makeUserSnapshot('newbie-uid', email);
			await wrapped(snap, { params: { userId: 'newbie-uid' } });

			const a = await db().collection('friends').doc('pending-a').get();
			const b = await db().collection('friends').doc('pending-b').get();
			const other = await db().collection('friends').doc('other').get();

			expect(a.data()!.friend).toBe('newbie-uid');
			expect(b.data()!.friend).toBe('newbie-uid');
			// non-matching email is left untouched
			expect(other.data()!.friend).toBe('');
		});

		it('writes nothing when no pending friend docs match the email', async () => {
			await db().collection('friends').doc('other').set({
				accepted: true,
				email: 'someone-else@example.com',
				friend: '',
				uid: 'friend-3',
			});

			const snap = await makeUserSnapshot('loner-uid', 'loner@example.com');
			const result = await wrapped(snap, {
				params: { userId: 'loner-uid' },
			});

			expect(result).toBeNull();
			const other = await db().collection('friends').doc('other').get();
			expect(other.data()!.friend).toBe('');
		});
	});
});

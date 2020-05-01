import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
admin.initializeApp();

type AddFriendData = {
	email: string;
};
export const addFriend = functions.https.onCall(
	async (data: AddFriendData, context) => {
		if (!context.auth) {
			throw new functions.https.HttpsError(
				'failed-precondition',
				'The function must be called while authenticated.'
			);
		}

		if (!data.email) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				'Must provide email.'
			);
		}

		const email = data.email.trim();
		if (context.auth.token.email === email) {
			throw new functions.https.HttpsError(
				'invalid-argument',
				"You can't add yourself as a friend!"
			);
		}

		const friendRecord = {
			accepted: true,
			friend: '',
			uid: context.auth?.uid,
			email: email,
		};
		const firestore = admin.firestore();
		const usersCollection = firestore.collection('users');
		const userSnap = await usersCollection
			.where('email', '==', email)
			.get();
		if (!userSnap.empty) {
			const user = userSnap.docs[0];
			friendRecord.friend = user.id;
		}

		const friendsCollection = firestore.collection('friends');
		const friendSnap = await friendsCollection
			.where('email', '==', email)
			.where('uid', '==', context.auth?.uid)
			.get();
		if (friendSnap.empty) {
			return friendsCollection.add(friendRecord);
		} else {
			throw new functions.https.HttpsError(
				'already-exists',
				'Friend already added'
			);
		}
	}
);

export const onUserAdded = functions.firestore
	.document('users/{userId}')
	.onCreate(async (snap) => {
		const firestore = admin.firestore();

		const uid = snap.id;
		const data = snap.data();
		if (!data) {
			return Promise.reject('no data');
		}
		const email: string = data.email;

		const friendsCollection = firestore.collection('friends');
		const friendSnap = await friendsCollection
			.where('email', '==', email)
			.get();

		if (!friendSnap.empty) {
			console.log('updating');
			const batch = firestore.batch();
			friendSnap.forEach((doc) => {
				batch.update(doc.ref, { friend: uid });
			});
			return batch.commit();
		}

		return null;
	});

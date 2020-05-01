import { formatISO, startOfDay, startOfWeek } from 'date-fns';
import * as Crypto from 'expo-crypto';

/**
 * Firestore doesn't like monotonically increasing document IDs. So instead of using the date,
 * we hash the user id and date
 * @see https://firebase.google.com/docs/firestore/best-practices#document_ids
 */
export async function calculateWeekHash(sunday: Date, uid: string) {
	const date = formatISO(sunday, {
		format: 'basic',
		representation: 'date',
	});
	return Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		`${uid}.${date}`
	);
}

export function getSunday() {
	return startOfWeek(startOfDay(new Date()));
}

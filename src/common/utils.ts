import { format, formatISO, startOfDay, startOfWeek } from 'date-fns';
import * as Crypto from 'expo-crypto';

/**
 * Firestore doesn't like monotonically increasing document IDs. So instead of using the date,
 * we hash the user id and date
 * @see https://firebase.google.com/docs/firestore/best-practices#document_ids
 */
export async function calculateWeekHash(sunday: Date, uid: string) {
	const date = dateInISO(sunday);
	return Crypto.digestStringAsync(
		Crypto.CryptoDigestAlgorithm.SHA256,
		`${uid}.${date}`
	);
}

export function dateInISO(date: Date) {
	return formatISO(date, {
		format: 'basic',
		representation: 'date',
	});
}

export function dateInWords(date: Date) {
	return format(date, 'LLLL do yyyy');
}

export function getSunday() {
	return startOfWeek(startOfDay(new Date()));
}

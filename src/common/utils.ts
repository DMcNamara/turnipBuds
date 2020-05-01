import { formatISO, startOfDay, startOfWeek } from 'date-fns';
import * as Crypto from 'expo-crypto';

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

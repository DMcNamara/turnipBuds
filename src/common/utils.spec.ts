jest.mock('expo-crypto', () => ({
	CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
	digestStringAsync: jest.fn(),
}));

import * as Crypto from 'expo-crypto';
import {
	calculateWeekHash,
	dateInISO,
	dateInWords,
	getSunday,
} from './utils';

describe('utils', () => {
	describe('dateInISO', () => {
		it('should format a date as a basic ISO date string', () => {
			expect(dateInISO(new Date(2020, 3, 5))).toBe('20200405');
		});

		it('should zero-pad months and days', () => {
			expect(dateInISO(new Date(2020, 0, 1))).toBe('20200101');
		});

		it('should ignore the time portion', () => {
			expect(dateInISO(new Date(2020, 11, 31, 23, 59, 59))).toBe(
				'20201231'
			);
		});
	});

	describe('dateInWords', () => {
		it('should format a date as month, ordinal day, and year', () => {
			expect(dateInWords(new Date(2020, 3, 5))).toBe('April 5th 2020');
		});

		it('should use the correct ordinal suffix', () => {
			expect(dateInWords(new Date(2020, 0, 1))).toBe('January 1st 2020');
			expect(dateInWords(new Date(2020, 0, 2))).toBe('January 2nd 2020');
			expect(dateInWords(new Date(2020, 0, 3))).toBe('January 3rd 2020');
			expect(dateInWords(new Date(2020, 0, 11))).toBe(
				'January 11th 2020'
			);
		});
	});

	describe('getSunday', () => {
		it('should return the Sunday at the start of the current week', () => {
			const sunday = getSunday();
			expect(sunday.getDay()).toBe(0);
		});

		it('should be at the start of the day', () => {
			const sunday = getSunday();
			expect(sunday.getHours()).toBe(0);
			expect(sunday.getMinutes()).toBe(0);
			expect(sunday.getSeconds()).toBe(0);
			expect(sunday.getMilliseconds()).toBe(0);
		});

		it('should not be in the future', () => {
			expect(getSunday().getTime()).toBeLessThanOrEqual(Date.now());
		});
	});

	describe('calculateWeekHash', () => {
		beforeEach(() => {
			(Crypto.digestStringAsync as jest.Mock).mockReset();
		});

		it('should hash the uid and the ISO date joined by a dot', async () => {
			(Crypto.digestStringAsync as jest.Mock).mockResolvedValue(
				'deadbeef'
			);

			const result = await calculateWeekHash(
				new Date(2020, 3, 5),
				'uid-123'
			);

			expect(Crypto.digestStringAsync).toHaveBeenCalledWith(
				'SHA-256',
				'uid-123.20200405'
			);
			expect(result).toBe('deadbeef');
		});
	});
});

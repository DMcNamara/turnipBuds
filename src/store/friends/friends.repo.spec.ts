import { dateInISO, getSunday } from '../../common/utils';
import { Pattern } from '../../constants';
import { Friend, User } from '../collections';
import { friendSort, FriendSorts } from './friends.repo';

const defaultPrice = {
	weekId: '',
	start: '',
	likeliestPattern: {
		patternIdx: -1,
		patternName: '',
		matches: '',
		probability: 0,
		probabilityPerMatch: 0,
	},
	mostRecent: 0,
};
const defaultUser: User = {
	avatarUrl: '',
	displayName: '',
	email: '',
	id: '',
	price: defaultPrice,
};
describe('friendsRepo', () => {
	const a: Friend = {
		accepted: true,
		email: 'test@example.com',
		friend: { ...defaultUser, displayName: 'Bill Johnson' },
		uid: '',
	};
	const b: Friend = {
		accepted: true,
		email: 'test@example.com',
		friend: { ...defaultUser, displayName: 'Alan Johnson' },
		uid: '',
	};
	describe('sortByName', () => {
		it('should sort by display name', () => {
			const res = [a, b].sort(friendSort(FriendSorts.Name, 1));
			expect(res[0].friend.displayName).toBe(b.friend.displayName);
			expect(res[1].friend.displayName).toBe(a.friend.displayName);
		});
	});

	describe('sortByPattern', () => {
		const start = dateInISO(getSunday());

		it('should sort large spike, small, fluct, dec, unknown', () => {
			const friends = [
				makeFriendWithPattern(Pattern.Decreasing, start),
				makeFriendWithPattern(Pattern.Fluctuating, start),
				makeFriendWithPattern(Pattern.SmallSpike, start),
				makeFriendWithPattern(Pattern.Unknown, start),
				makeFriendWithPattern(Pattern.LargeSpike, start),
			];

			const sorted = friends.sort(friendSort(FriendSorts.Pattern, 1));
			expect(sorted[0].friend.price.likeliestPattern.patternIdx).toBe(
				Pattern.LargeSpike
			);
			expect(sorted[1].friend.price.likeliestPattern.patternIdx).toBe(
				Pattern.SmallSpike
			);
			expect(sorted[2].friend.price.likeliestPattern.patternIdx).toBe(
				Pattern.Fluctuating
			);
			expect(sorted[3].friend.price.likeliestPattern.patternIdx).toBe(
				Pattern.Decreasing
			);
			expect(sorted[4].friend.price.likeliestPattern.patternIdx).toBe(
				Pattern.Unknown
			);
		});

		it('should sort old weeks down', () => {
			const friends = [
				makeFriendWithPattern(Pattern.LargeSpike, '1900'),
				makeFriendWithPattern(Pattern.Decreasing, start),
			];

			const sorted = friends.sort(friendSort(FriendSorts.Pattern, 1));
			expect(sorted[0].friend.price.start).toBe(start);
		});

		it('should sort those without price down', () => {
			const friends = [
				makeFriendWithoutPrice(Pattern.Unknown, start),
				makeFriendWithPattern(Pattern.Unknown, start),
			];

			const sorted = friends.sort(friendSort(FriendSorts.Pattern, 1));
			expect(sorted[0].friend.price.start).toBe(start);
		});
	});
});

function makeFriendWithPattern(pattern: Pattern, start: string) {
	return {
		accepted: true,
		email: 'test@example.com',
		uid: '',
		friend: {
			...defaultUser,
			price: {
				...defaultPrice,
				start,
				likeliestPattern: {
					...defaultPrice.likeliestPattern,
					patternIdx: pattern,
				},
			},
		},
	} as Friend;
}

function makeFriendWithoutPrice(pattern: Pattern, start: string) {
	const friend = makeFriendWithPattern(pattern, start);
	return ({
		...friend,
		friend: { ...friend.friend, price: undefined },
	} as unknown) as Friend;
}

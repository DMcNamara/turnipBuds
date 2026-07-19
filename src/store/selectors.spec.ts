import { FriendsCollection, FriendsWeekCollection } from './collections';
import {
	getAllFriends,
	getAllFriendsEmails,
	getExistingFriends,
	getFriendIndexOrder,
	getFriendIndexSort,
	getFriendIndexState,
	getFriendRequestss,
	getFriendsWeekPrice,
} from './selectors';

// react-redux-firebase's `populate` replaces the `friend` string uid on each
// `friends` doc with the matching `users` doc; if the user doc is missing, the
// `friend` value is left as the raw uid string.
function buildFirestore(data: any) {
	return { data, ordered: {} };
}

const userA = {
	id: 'uA',
	displayName: 'Alan Johnson',
	email: 'alan@example.com',
	avatarUrl: '',
	pro: false,
};
const userB = {
	id: 'uB',
	displayName: 'Bill Johnson',
	email: 'bill@example.com',
	avatarUrl: '',
	pro: false,
};

function stateWithFriends(order: 1 | -1 = 1, sortBy = 'displayName') {
	return {
		friendIndex: { sortBy, order },
		firestore: buildFirestore({
			[FriendsCollection]: {
				f1: {
					accepted: true,
					email: 'bill@example.com',
					friend: 'uB',
					uid: 'me',
				},
				f2: {
					accepted: true,
					email: 'alan@example.com',
					friend: 'uA',
					uid: 'me',
				},
				// pending request: target user has no account yet, so `friend`
				// cannot be populated and stays a raw uid string.
				f3: {
					accepted: false,
					email: 'pending@example.com',
					friend: 'uMissing',
					uid: 'me',
				},
			},
			users: { uA: userA, uB: userB },
		}),
	} as any;
}

describe('selectors', () => {
	describe('getFriendIndexState', () => {
		it('should return the friendIndex slice', () => {
			const state = { friendIndex: { sortBy: 'pattern', order: -1 } };
			expect(getFriendIndexState(state as any)).toBe(state.friendIndex);
		});
	});

	describe('getFriendIndexSort', () => {
		it('should return the sortBy field', () => {
			const state = { friendIndex: { sortBy: 'pattern', order: -1 } };
			expect(getFriendIndexSort(state as any)).toBe('pattern');
		});
	});

	describe('getFriendIndexOrder', () => {
		it('should return the order field', () => {
			const state = { friendIndex: { sortBy: 'pattern', order: -1 } };
			expect(getFriendIndexOrder(state as any)).toBe(-1);
		});
	});

	describe('getFriendsWeekPrice', () => {
		it('should return undefined when the collection is missing', () => {
			const state = { firestore: buildFirestore({}) } as any;
			expect(getFriendsWeekPrice(state, 'wk1')).toBeUndefined();
		});

		it('should return undefined when the week hash is empty', () => {
			const state = {
				firestore: buildFirestore({
					[FriendsWeekCollection]: { wk1: { id: 'wk1' } },
				}),
			} as any;
			expect(getFriendsWeekPrice(state, '')).toBeUndefined();
		});

		it('should return a WeekPrice for the given week hash', () => {
			const state = {
				firestore: buildFirestore({
					[FriendsWeekCollection]: {
						wk1: { id: 'wk1', monAM: 100 },
					},
				}),
			} as any;
			const week = getFriendsWeekPrice(state, 'wk1');
			expect(week).toBeDefined();
			expect(week!.id).toBe('wk1');
			expect(week!.monAM).toBe(100);
		});

		it('should parse the stringified prediction matches', () => {
			const state = {
				firestore: buildFirestore({
					[FriendsWeekCollection]: {
						wk1: {
							id: 'wk1',
							predictions: [
								{
									patternIdx: 0,
									patternName: 'Fluctuating',
									matches: '[[[1,2]]]',
									probability: 1,
									probabilityPerMatch: 1,
								},
							],
						},
					},
				}),
			} as any;
			const week = getFriendsWeekPrice(state, 'wk1');
			expect(week!.predictions[0].matches).toEqual([[[1, 2]]]);
		});
	});

	describe('getAllFriends', () => {
		it('should return an empty array when there are no friends', () => {
			const state = {
				firestore: buildFirestore({ [FriendsCollection]: {} }),
			} as any;
			expect(getAllFriends(state)).toEqual([]);
		});

		it('should return all friend docs with populated friend users', () => {
			const friends = getAllFriends(stateWithFriends());
			expect(friends).toHaveLength(3);
			const emails = friends.map((f) => f.email);
			expect(emails).toEqual(
				expect.arrayContaining([
					'bill@example.com',
					'alan@example.com',
					'pending@example.com',
				])
			);
		});
	});

	describe('getAllFriendsEmails', () => {
		it('should map friends to their email addresses', () => {
			const emails = getAllFriendsEmails(stateWithFriends());
			expect(emails).toEqual(
				expect.arrayContaining([
					'bill@example.com',
					'alan@example.com',
					'pending@example.com',
				])
			);
			expect(emails).toHaveLength(3);
		});
	});

	describe('getExistingFriends', () => {
		it('should return only populated friends, sorted by name ascending', () => {
			const existing = getExistingFriends(stateWithFriends(1));
			expect(existing).toHaveLength(2);
			expect(existing[0].friend.displayName).toBe('Alan Johnson');
			expect(existing[1].friend.displayName).toBe('Bill Johnson');
		});

		it('should honor the descending sort order', () => {
			const existing = getExistingFriends(stateWithFriends(-1));
			expect(existing[0].friend.displayName).toBe('Bill Johnson');
			expect(existing[1].friend.displayName).toBe('Alan Johnson');
		});
	});

	describe('getFriendRequestss', () => {
		it('should return only friends whose friend uid is not populated', () => {
			const requests = getFriendRequestss(stateWithFriends());
			expect(requests).toHaveLength(1);
			expect(requests[0].email).toBe('pending@example.com');
		});
	});
});

import { sortFriendsAction, SORT } from './friend-index.actions';

describe('friend-index.actions', () => {
	describe('sortFriendsAction', () => {
		it('should create a sort action with an ascending order', () => {
			expect(sortFriendsAction('displayName', 1)).toEqual({
				type: SORT,
				sortBy: 'displayName',
				order: 1,
			});
		});

		it('should create a sort action with a descending order', () => {
			expect(sortFriendsAction('pattern', -1)).toEqual({
				type: SORT,
				sortBy: 'pattern',
				order: -1,
			});
		});
	});
});

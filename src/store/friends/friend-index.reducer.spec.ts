import { sortFriendsAction } from './friend-index.actions';
import { friendIndexReducer, initialState } from './friend-index.reducer';

describe('friendIndexReducer', () => {
	it('should return the initial state when passed undefined', () => {
		expect(
			friendIndexReducer(undefined, { type: '@@INIT' } as any)
		).toEqual({
			sortBy: 'displayName',
			order: 1,
		});
	});

	it('should replace the state on SORT', () => {
		const state = friendIndexReducer(
			initialState,
			sortFriendsAction('pattern', -1) as any
		);
		expect(state).toEqual({ sortBy: 'pattern', order: -1 });
	});

	it('should return the same state reference for an unknown action', () => {
		const state = { sortBy: 'pattern', order: 1 as const };
		expect(
			friendIndexReducer(state, { type: 'SOMETHING_ELSE' } as any)
		).toBe(state);
	});
});

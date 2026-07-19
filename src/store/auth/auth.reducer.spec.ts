import { setCurrentUserAction } from './auth.actions';
import { authReducer, initialState } from './auth.reducer';

describe('authReducer', () => {
	it('should return the initial state when passed undefined', () => {
		expect(authReducer(undefined, { type: '@@INIT' })).toEqual({
			currentUID: null,
		});
	});

	it('should set currentUID on CURRENT_USER_CHANGE', () => {
		const state = authReducer(initialState, setCurrentUserAction('uid-1'));
		expect(state).toEqual({ currentUID: 'uid-1' });
	});

	it('should allow clearing currentUID back to null', () => {
		const populated = { currentUID: 'uid-1' };
		const state = authReducer(populated, setCurrentUserAction(null));
		expect(state).toEqual({ currentUID: null });
	});

	it('should return the same state reference for an unknown action', () => {
		const state = { currentUID: 'uid-1' };
		expect(authReducer(state, { type: 'SOMETHING_ELSE' })).toBe(state);
	});
});

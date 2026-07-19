import { CURRENT_USER_CHANGE, setCurrentUserAction } from './auth.actions';

describe('auth.actions', () => {
	describe('setCurrentUserAction', () => {
		it('should create a current user change action with a uid', () => {
			expect(setCurrentUserAction('abc123')).toEqual({
				type: CURRENT_USER_CHANGE,
				uid: 'abc123',
			});
		});

		it('should create a current user change action with a null uid', () => {
			expect(setCurrentUserAction(null)).toEqual({
				type: CURRENT_USER_CHANGE,
				uid: null,
			});
		});
	});
});

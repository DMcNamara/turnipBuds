import {
	hideToastAction,
	HIDE_TOAST,
	toastAction,
	TOAST,
} from './toast.actions';

describe('toast.actions', () => {
	describe('toastAction', () => {
		it('should create a toast action with a message and no duration', () => {
			expect(toastAction('hello')).toEqual({
				type: TOAST,
				message: 'hello',
				duration: undefined,
			});
		});

		it('should create a toast action with a message and duration', () => {
			expect(toastAction('hello', 3000)).toEqual({
				type: TOAST,
				message: 'hello',
				duration: 3000,
			});
		});
	});

	describe('hideToastAction', () => {
		it('should create a hide toast action', () => {
			expect(hideToastAction()).toEqual({ type: HIDE_TOAST });
		});
	});
});

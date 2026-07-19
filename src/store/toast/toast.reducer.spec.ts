import { hideToastAction, toastAction } from './toast.actions';
import { initialState, toastReducer } from './toast.reducer';

describe('toastReducer', () => {
	it('should return the initial state when passed undefined', () => {
		expect(toastReducer(undefined, { type: '@@INIT' } as any)).toEqual({
			duration: 7000,
			message: '',
			visible: false,
		});
	});

	it('should show a toast with the given message and become visible', () => {
		const state = toastReducer(initialState, toastAction('Saved!'));
		expect(state).toEqual({
			duration: 7000,
			message: 'Saved!',
			visible: true,
		});
	});

	it('should use the provided duration when truthy', () => {
		const state = toastReducer(initialState, toastAction('Saved!', 2000));
		expect(state.duration).toBe(2000);
	});

	it('should fall back to the initial duration when duration is falsy', () => {
		const state = toastReducer(initialState, toastAction('Saved!', 0));
		expect(state.duration).toBe(7000);
	});

	it('should hide a visible toast but keep the message', () => {
		const visible = { duration: 2000, message: 'Saved!', visible: true };
		const state = toastReducer(visible, hideToastAction());
		expect(state).toEqual({
			duration: 2000,
			message: 'Saved!',
			visible: false,
		});
	});

	it('should return the same state reference for an unknown action', () => {
		const state = { duration: 7000, message: '', visible: false };
		expect(toastReducer(state, { type: 'SOMETHING_ELSE' } as any)).toBe(
			state
		);
	});
});

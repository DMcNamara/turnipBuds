import { HIDE_TOAST, TOAST, ToastActions } from './toast.actions';

export interface ToastState {
	duration: number;
	message: string;
	visible: boolean;
}

export const initialState: ToastState = {
	duration: 7000,
	message: '',
	visible: false,
};

export function toastReducer(
	state: ToastState = initialState,
	action: ToastActions
): ToastState {
	switch (action.type) {
		case TOAST: {
			return {
				...state,
				message: action.message,
				duration: action.duration
					? action.duration
					: initialState.duration,
				visible: true,
			};
		}
		case HIDE_TOAST: {
			return {
				...state,
				visible: false,
			};
		}
		default:
			return state;
	}
}

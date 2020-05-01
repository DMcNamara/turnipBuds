export const TOAST = '[Toast] toast';
export type TOAST = typeof TOAST;
export interface ToastAction {
	type: TOAST;
	message: string;
	duration?: number;
}

export const HIDE_TOAST = '[Toast] Hide';
export type HIDE_TOAST = typeof HIDE_TOAST;
export interface HideToastAction {
	type: HIDE_TOAST;
}

export function toastAction(message: string, duration?: number): ToastAction {
	return {
		type: TOAST,
		message,
		duration,
	};
}

export function hideToastAction(): HideToastAction {
	return {
		type: HIDE_TOAST,
	};
}

export type ToastActions = ToastAction | HideToastAction;

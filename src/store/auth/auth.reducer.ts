import { AnyAction } from 'redux';
import { AuthActions, CURRENT_USER_CHANGE } from './auth.actions';

export interface AuthState {
	currentUID: string | null;
}

export const initialState: AuthState = {
	currentUID: null,
};

export function authReducer(
	state: AuthState = initialState,
	action: AuthActions | AnyAction
): AuthState {
	switch (action.type) {
		case CURRENT_USER_CHANGE: {
			return {
				...state,
				currentUID: action.uid,
			};
		}
		default:
			return state;
	}
}

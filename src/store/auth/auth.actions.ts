export const CURRENT_USER_CHANGE = '[AUTH] Current User Change';
export type CURRENT_USER_CHANGE = typeof CURRENT_USER_CHANGE;
export interface CurrentUserChangeAction {
	type: CURRENT_USER_CHANGE;
	uid: string | null;
}

export function setCurrentUserAction(
	uid: string | null
): CurrentUserChangeAction {
	return {
		type: CURRENT_USER_CHANGE,
		uid,
	};
}

export type AuthActions = CurrentUserChangeAction;

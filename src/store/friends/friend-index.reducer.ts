import { FriendIndexActions, SORT } from './friend-index.actions';
import { FriendSorts } from './friends.repo';

export interface FriendIndexState {
	sortBy: string;
	order: 1 | -1;
}

export const initialState: FriendIndexState = {
	sortBy: FriendSorts.Name,
	order: 1,
};

export function friendIndexReducer(
	state: FriendIndexState = initialState,
	action: FriendIndexActions
): FriendIndexState {
	switch (action.type) {
		case SORT: {
			return {
				sortBy: action.sortBy,
				order: action.order,
			};
		}
		default:
			return state;
	}
}

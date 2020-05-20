export const SORT = '[Friend Index] sort';
export type SORT = typeof SORT;

export interface SortAction {
	type: SORT;
	sortBy: string;
	order: 1 | -1;
}

export function sortFriendsAction(sortBy: string, order: 1 | -1) {
	return {
		type: SORT,
		sortBy,
		order,
	};
}

export type FriendIndexActions = SortAction;

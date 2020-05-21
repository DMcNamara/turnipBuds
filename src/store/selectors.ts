import { Data, populate } from 'react-redux-firebase';
import { createSelector } from 'reselect';
import { RootState } from '.';
import {
	Friend,
	FriendsCollection,
	FriendsWeekCollection,
	UsersCollection,
	WeekPrice,
} from './collections';
import { friendSort } from './friends/friends.repo';

export const getFriendIndexState = (state: RootState) => state.friendIndex;
export const getFriendIndexSort = (state: RootState) =>
	state.friendIndex.sortBy;
export const getFriendIndexOrder = (state: RootState) =>
	state.friendIndex.order;

export const getFriendsWeekPrice = (
	{ firestore }: RootState,
	weekHash: string
) => {
	if (firestore.data[FriendsWeekCollection] && weekHash) {
		return new WeekPrice(firestore.data[FriendsWeekCollection][weekHash]);
	} else {
		return undefined;
	}
};

const friendsPopulates = [{ child: 'friend', root: UsersCollection }];
export const getPopulatedFriends = ({ firestore }: RootState) => {
	return populate(firestore, FriendsCollection, friendsPopulates) as Data<
		Friend
	>;
};

export const getAllFriends = createSelector(
	getPopulatedFriends,
	(friendsData) => Object.values(friendsData || {})
);

export const getAllFriendsEmails = createSelector(getAllFriends, (friends) =>
	friends.map((f) => f.email)
);

export const getExistingFriends = createSelector(
	getAllFriends,
	getFriendIndexSort,
	getFriendIndexOrder,
	(friends, sortBy, order) =>
		friends.filter((f) => f.friend.id).sort(friendSort(sortBy, order))
);

export const getFriendRequestss = createSelector(getAllFriends, (friends) =>
	friends.filter((f) => !f.friend.id)
);

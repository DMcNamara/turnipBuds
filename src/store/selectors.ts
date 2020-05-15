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

export const getExistingFriends = createSelector(getAllFriends, (friends) =>
	friends.filter((f) => f.friend.id)
);

export const getFriendRequestss = createSelector(getAllFriends, (friends) =>
	friends.filter((f) => !f.friend.id)
);

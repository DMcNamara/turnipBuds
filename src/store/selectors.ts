import { RootState } from '.';
import { FriendsWeekCollection, WeekPrice } from './collections';

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

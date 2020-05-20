import { SortOption } from '../../common/SortButton';
import { dateInISO, getSunday } from '../../common/utils';
import { Pattern } from '../../constants';
import { Friend } from '../collections';

export const FriendSorts = {
	Name: 'displayName',
	Pattern: 'pattern',
};

export const FriendSortOptions: SortOption[] = [
	{ title: 'Name', key: FriendSorts.Name },
	{ title: 'Pattern', key: FriendSorts.Pattern },
];

export function friendSort(key: string, order: 1 | -1) {
	return (a: Friend, b: Friend) => {
		if (key === FriendSorts.Pattern) {
			return sortByPattern(a, b, order);
		} else {
			return sortByName(a, b, order);
		}
	};
}

function sortByName(a: Friend, b: Friend, order: 1 | -1) {
	const aName = a.friend.displayName.toLowerCase();
	const bName = b.friend.displayName.toLowerCase();

	if (aName === bName) {
		return 0;
	} else {
		return (aName < bName ? -1 : 1) * order;
	}
}

const patternSortOrder = [
	Pattern.LargeSpike,
	Pattern.SmallSpike,
	Pattern.Fluctuating,
	Pattern.Decreasing,
	Pattern.Unknown,
];
function sortByPattern(a: Friend, b: Friend, order: 1 | -1) {
	const start = dateInISO(getSunday());
	const aPrice = a.friend.price;
	const bPrice = b.friend.price;

	const priceCheck = nullCheck(aPrice, bPrice);
	if (priceCheck === null) {
		// check that a and b are both starting at `start`
		if (aPrice.start === start) {
		}
		const patternCheck = nullCheck(
			aPrice.likeliestPattern,
			bPrice.likeliestPattern
		);
		if (patternCheck === null) {
			const aPat = patternSortOrder.indexOf(
				aPrice.likeliestPattern.patternIdx
			);
			const bPat = patternSortOrder.indexOf(
				bPrice.likeliestPattern.patternIdx
			);

			if (aPat === bPat) {
				return sortByName(a, b, 1);
			} else {
				return aPat < bPat ? -1 : 1;
			}
		} else {
			return patternCheck;
		}
	} else {
		return priceCheck;
	}
}

function nullCheck(aVal: any, bVal: any) {
	if (aVal && !bVal) {
		return -1;
	} else if (!aVal && bVal) {
		return 1;
	} else if (!aVal && !bVal) {
		return 0;
	}

	return null;
}

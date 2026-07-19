import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { dateInISO, getSunday } from '../common/utils';
import { User } from '../store/collections';
import { FriendCard } from './FriendCard';

const thisWeekStart = dateInISO(getSunday());

// One possibility: buy prices (ignored) + a sell slot of 150-200 => max 200.
const matches = JSON.stringify([
	[
		[90, 90],
		[90, 90],
		[150, 200],
	],
]);

function makeFriend(overrides: Partial<User> = {}): User {
	return {
		avatarUrl: 'https://example.com/avatar.png',
		displayName: 'Bill Johnson',
		email: 'bill@example.com',
		id: 'bill',
		// timezone omitted on purpose: CurrentPrice stays empty, keeping the
		// assertions independent of the current time.
		price: {
			weekId: 'w1',
			start: thisWeekStart,
			likeliestPattern: {
				patternIdx: 1, // Large Spike
				patternName: 'Large Spike',
				matches,
				probability: 55.5,
				probabilityPerMatch: 0,
			},
			mostRecent: 200,
			mostRecentTime: 'monAM',
		},
		...overrides,
	} as User;
}

function renderCard(props: { friend: User; onPress: (u: User) => void }) {
	return render(
		<PaperProvider>
			<FriendCard friend={props.friend} onPress={props.onPress} />
		</PaperProvider>
	);
}

describe('FriendCard', () => {
	it("renders the friend name, pattern, probability and potential max", () => {
		const friend = makeFriend();
		const utils = renderCard({ friend, onPress: jest.fn() });

		expect(utils.getByText('Bill Johnson')).toBeTruthy();
		expect(utils.getByText('Large Spike')).toBeTruthy();
		expect(utils.getByText('55.50%')).toBeTruthy();
		expect(utils.getByText('200')).toBeTruthy();
	});

	it('shows a placeholder when the price is not for the current week', () => {
		const friend = makeFriend({
			price: { ...makeFriend().price, start: '1900' },
		});
		const utils = renderCard({ friend, onPress: jest.fn() });

		expect(utils.getByText('No Data for this Week Yet')).toBeTruthy();
	});

	it('calls onPress with the friend when the card is pressed', () => {
		const onPress = jest.fn();
		const friend = makeFriend();
		const utils = renderCard({ friend, onPress });

		fireEvent.press(utils.getByText('Bill Johnson'));

		expect(onPress).toHaveBeenCalledTimes(1);
		expect(onPress).toHaveBeenCalledWith(friend);
	});
});

const mockAddFriend = jest.fn();

// Mock the store module so importing the service never initializes Firebase.
jest.mock('../../store', () => ({
	Functions: {
		addFriend: (...args: any[]) => mockAddFriend(...args),
	},
}));

import { toastAction } from '../../store/toast/toast.actions';
import { addFriend } from './AddFriends.service';

const flushPromises = () =>
	new Promise((resolve) => setImmediate(resolve));

describe('AddFriends.service', () => {
	let dispatch: jest.Mock;

	beforeEach(() => {
		dispatch = jest.fn();
		mockAddFriend.mockReset();
	});

	it('should toast and not call the function when already added', () => {
		addFriend('taken@example.com', ['taken@example.com'], dispatch);

		expect(mockAddFriend).not.toHaveBeenCalled();
		expect(dispatch).toHaveBeenCalledTimes(1);
		expect(dispatch).toHaveBeenCalledWith(
			toastAction("You've already added this friend")
		);
	});

	it('should call Functions.addFriend with the email payload', () => {
		mockAddFriend.mockResolvedValue(undefined);

		addFriend('new@example.com', ['other@example.com'], dispatch);

		expect(mockAddFriend).toHaveBeenCalledWith({
			email: 'new@example.com',
		});
	});

	it('should toast success when the function resolves', async () => {
		mockAddFriend.mockResolvedValue(undefined);

		addFriend('new@example.com', [], dispatch);
		await flushPromises();

		expect(dispatch).toHaveBeenCalledWith(toastAction('Friend Added'));
	});

	it('should toast the error message when the function rejects', async () => {
		mockAddFriend.mockRejectedValue(new Error('boom'));

		addFriend('new@example.com', [], dispatch);
		await flushPromises();

		expect(dispatch).toHaveBeenCalledWith(toastAction('boom'));
	});
});

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AddFriendModal } from './AddFriendModal';

/**
 * react-native-paper 3.x `Portal` does not render its children under
 * react-test-renderer (the PortalHost/manager never flushes), so anything
 * inside a `Portal` is unreachable. We replace the exported `Portal` with a
 * passthrough. `Provider` uses its own internal PortalHost, so it is
 * unaffected and still supplies the theme.
 */
jest.mock('react-native-paper', () => {
	const Real = jest.requireActual('react-native-paper');
	return { ...Real, Portal: ({ children }: { children: React.ReactNode }) => children };
});

function renderModal(props: {
	onSave: (email: string) => void;
	onHide: () => void;
}) {
	return render(
		<PaperProvider>
			<AddFriendModal visible onHide={props.onHide} onSave={props.onSave} />
		</PaperProvider>
	);
}

describe('AddFriendModal', () => {
	it('renders the title and prompt', () => {
		const utils = renderModal({ onSave: jest.fn(), onHide: jest.fn() });
		expect(utils.getByText('Add Friend')).toBeTruthy();
		expect(
			utils.getByText(/enter their email below and\s+press save/)
		).toBeTruthy();
	});

	it('calls onSave with the typed email when Save is pressed', () => {
		const onSave = jest.fn();
		const utils = renderModal({ onSave, onHide: jest.fn() });

		const input = utils.UNSAFE_getByType(RNTextInput);
		fireEvent.changeText(input, 'friend@example.com');
		fireEvent.press(utils.getByText('Save'));

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledWith('friend@example.com');
	});

	it('resets the email input to empty after Save', () => {
		const utils = renderModal({ onSave: jest.fn(), onHide: jest.fn() });

		const input = utils.UNSAFE_getByType(RNTextInput);
		fireEvent.changeText(input, 'friend@example.com');
		fireEvent.press(utils.getByText('Save'));

		expect(utils.UNSAFE_getByType(RNTextInput).props.value).toBe('');
	});

	it('calls onHide when Cancel is pressed and resets the input', () => {
		const onHide = jest.fn();
		const utils = renderModal({ onSave: jest.fn(), onHide });

		const input = utils.UNSAFE_getByType(RNTextInput);
		fireEvent.changeText(input, 'friend@example.com');
		fireEvent.press(utils.getByText('Cancel'));

		expect(onHide).toHaveBeenCalledTimes(1);
		expect(utils.UNSAFE_getByType(RNTextInput).props.value).toBe('');
	});
});

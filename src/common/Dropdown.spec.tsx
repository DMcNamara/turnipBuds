import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Dropdown } from './Dropdown';

/**
 * react-native-paper 5's `Portal` does not flush its children under
 * react-test-renderer, and the Menu's items render inside a `Portal`. Replace
 * `Portal` with a passthrough so the open menu's `Menu.Item`s are reachable.
 * `Provider` uses its own internal PortalHost and still supplies the theme.
 */
jest.mock('react-native-paper', () => {
	const Real = jest.requireActual('react-native-paper');
	return {
		...Real,
		Portal: ({ children }: { children: React.ReactNode }) => children,
	};
});

const data = [
	{ label: 'Red', value: 'r' },
	{ label: 'Green', value: 'g' },
	{ label: 'Blue', value: 'b' },
];

function renderDropdown(props: {
	value?: string;
	onChange: (value: string) => void;
}) {
	return render(
		<PaperProvider>
			<Dropdown
				testID="dropdown"
				label="Colour"
				data={data}
				value={props.value}
				onChange={props.onChange}
			/>
		</PaperProvider>
	);
}

describe('Dropdown', () => {
	it('shows the selected option label in the field', () => {
		const utils = renderDropdown({ value: 'g', onChange: jest.fn() });

		expect(utils.getByDisplayValue('Green')).toBeTruthy();
	});

	it('opens on press and lists every option', () => {
		const utils = renderDropdown({ value: 'g', onChange: jest.fn() });

		fireEvent.press(utils.getByTestId('dropdown'));

		// The field still shows the current value; the menu adds the options.
		expect(utils.getByText('Red')).toBeTruthy();
		expect(utils.getByText('Blue')).toBeTruthy();
	});

	it('calls onChange with the selected option value', () => {
		const onChange = jest.fn();
		const utils = renderDropdown({ value: 'g', onChange });

		fireEvent.press(utils.getByTestId('dropdown'));
		fireEvent.press(utils.getByText('Blue'));

		expect(onChange).toHaveBeenCalledTimes(1);
		expect(onChange).toHaveBeenCalledWith('b');
	});
});

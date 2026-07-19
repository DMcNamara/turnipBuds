import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { TextInput as RNTextInput } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { WeekPrice } from '../../store/collections';
import { WeekInput } from './WeekInput';

/**
 * `HalfDayInput` debounces its change callback by 1000ms via lodash. lodash's
 * debounce combined with Jest legacy fake timers is unreliable (it reads the
 * real clock), so we replace debounce with an identity passthrough and assert
 * the callback arguments directly.
 */
jest.mock('lodash', () => ({
	...(jest.requireActual('lodash') as Record<string, unknown>),
	debounce: (fn: (...args: unknown[]) => unknown) => fn,
}));

function renderWeekInput(onChange?: jest.Mock) {
	const weekPrices = new WeekPrice({ monAM: 90, monPM: 100 });
	return render(
		<PaperProvider>
			<WeekInput weekPrices={weekPrices} onChange={onChange} />
		</PaperProvider>
	);
}

describe('WeekInput', () => {
	it('renders the day and half-day column labels', () => {
		const utils = renderWeekInput();
		['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(
			(day) => expect(utils.getByText(day)).toBeTruthy()
		);
		expect(utils.getByText('AM')).toBeTruthy();
		expect(utils.getByText('PM')).toBeTruthy();
	});

	it('calls the change callback with the slot name and typed value', () => {
		const onChange = jest.fn();
		const utils = renderWeekInput(onChange);

		// The first TextInput is monAM (the buy-price is not part of WeekInput).
		const monAM = utils.UNSAFE_getAllByType(RNTextInput)[0];
		fireEvent.changeText(monAM, '120');

		expect(onChange).toHaveBeenCalledWith('monAM', '120');
	});
});

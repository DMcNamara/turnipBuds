import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { TimeZoneModal } from './TimezoneModal';

/**
 * `compact-timezone-list` ships as untransformed ESM and lives in node_modules
 * (excluded from Babel transforms), so we mock it. It supplies the two options
 * the dropdown renders: the current tz (`America/New_York`) and one other
 * (`UTC`) so a real selection can be driven.
 */
jest.mock('compact-timezone-list', () => ({
	__esModule: true,
	default: [
		{ label: 'GMT+00:00 UTC', tzCode: 'UTC' },
		{ label: 'GMT-05:00 New York', tzCode: 'America/New_York' },
	],
}));

/**
 * react-native-paper 5's `Portal` does not flush its children under
 * react-test-renderer (the PortalHost manager never mounts them synchronously),
 * so anything inside a `Portal` — the `Dialog` body and the open `Menu` — is
 * otherwise unreachable. We replace the exported `Portal` with a passthrough.
 * `Provider` uses its own internal PortalHost, so it is unaffected and still
 * supplies the theme.
 */
jest.mock('react-native-paper', () => {
	const Real = jest.requireActual('react-native-paper');
	return {
		...Real,
		Portal: ({ children }: { children: React.ReactNode }) => children,
	};
});

const currentTimeZone = 'America/New_York';

function renderModal(props: {
	onSave: (timeZone: string) => void;
	onHide: () => void;
}) {
	return render(
		<PaperProvider>
			<TimeZoneModal
				visible
				currentTimeZone={currentTimeZone}
				onHide={props.onHide}
				onSave={props.onSave}
			/>
		</PaperProvider>
	);
}

describe('TimeZoneModal', () => {
	it('renders the title text', () => {
		const utils = renderModal({ onSave: jest.fn(), onHide: jest.fn() });
		expect(utils.getByText('Set Island Timezone')).toBeTruthy();
	});

	it('calls onSave with the current timezone when Save is pressed without changing it', () => {
		const onSave = jest.fn();
		const utils = renderModal({ onSave, onHide: jest.fn() });

		fireEvent.press(utils.getByText('Save'));

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledWith(currentTimeZone);
	});

	it('opens the dropdown, selects a different timezone, and saves the new value', () => {
		const onSave = jest.fn();
		const utils = renderModal({ onSave, onHide: jest.fn() });

		// Open the Paper Menu by pressing the timezone field/anchor.
		fireEvent.press(utils.getByTestId('timezone-dropdown'));

		// Select the option that is NOT the current timezone (UTC).
		fireEvent.press(utils.getByText('GMT+00:00 UTC'));

		fireEvent.press(utils.getByText('Save'));

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledWith('UTC');
	});

	it('calls onHide when Cancel is pressed', () => {
		const onHide = jest.fn();
		const utils = renderModal({ onSave: jest.fn(), onHide });

		fireEvent.press(utils.getByText('Cancel'));

		expect(onHide).toHaveBeenCalledTimes(1);
	});
});

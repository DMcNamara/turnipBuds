import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { TimeZoneModal } from './TimezoneModal';

/**
 * `react-native-material-dropdown` is not reliably driveable in the JSDOM/test
 * renderer, so we stub it out and assert the modal's own behavior (title,
 * button callbacks, and the initial timezone value it reports on Save).
 */
jest.mock('react-native-material-dropdown', () => ({
	Dropdown: () => null,
}));

/**
 * `compact-timezone-list` ships as untransformed ESM and lives in node_modules
 * (excluded from Babel transforms), so we mock it. Its only use here is to build
 * the dropdown option list, which is not under test.
 */
jest.mock('compact-timezone-list', () => ({
	__esModule: true,
	default: [
		{ label: 'GMT+00:00 UTC', tzCode: 'UTC' },
		{ label: 'GMT-05:00 New York', tzCode: 'America/New_York' },
	],
}));

/**
 * react-native-paper 3.x `Portal` does not render its children under
 * react-test-renderer, so we replace the exported `Portal` with a passthrough.
 * `Provider` uses its own internal PortalHost and is unaffected.
 */
jest.mock('react-native-paper', () => {
	const Real = jest.requireActual('react-native-paper');
	return { ...Real, Portal: ({ children }: { children: React.ReactNode }) => children };
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

	it('calls onSave with the current timezone when Save is pressed', () => {
		const onSave = jest.fn();
		const utils = renderModal({ onSave, onHide: jest.fn() });

		fireEvent.press(utils.getByText('Save'));

		expect(onSave).toHaveBeenCalledTimes(1);
		expect(onSave).toHaveBeenCalledWith(currentTimeZone);
	});

	it('calls onHide when Cancel is pressed', () => {
		const onHide = jest.fn();
		const utils = renderModal({ onSave: jest.fn(), onHide });

		fireEvent.press(utils.getByText('Cancel'));

		expect(onHide).toHaveBeenCalledTimes(1);
	});
});

import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { toastAction } from '../store/toast/toast.actions';
import { toastReducer } from '../store/toast/toast.reducer';
import { Toast } from './Toast';

/**
 * Minimal real store built from the app's actual toast reducer (no mock-store lib).
 * `Toast` only reads/writes the `toast` slice via connect.
 */
function makeStore() {
	return createStore(combineReducers({ toast: toastReducer }));
}

function renderToast(store: ReturnType<typeof makeStore>) {
	return render(
		<ReduxProvider store={store}>
			<PaperProvider>
				<Toast />
			</PaperProvider>
		</ReduxProvider>
	);
}

describe('Toast', () => {
	it('renders the toast message when visible', () => {
		const store = makeStore();
		store.dispatch(toastAction('Something happened', 1234));

		const { getByText } = renderToast(store);

		expect(getByText('Something happened')).toBeTruthy();
	});

	it('dismisses via the OK action, dispatching hideToastAction', () => {
		const store = makeStore();
		store.dispatch(toastAction('Dismiss me', 1234));

		expect(store.getState().toast.visible).toBe(true);

		const { getByText } = renderToast(store);
		fireEvent.press(getByText(/ok/i));

		expect(store.getState().toast.visible).toBe(false);
	});
});

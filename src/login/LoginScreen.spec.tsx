import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { LoginScreen } from './LoginScreen';

/**
 * The Google OAuth round-trip can't run under jest, so the provider hook is
 * stubbed and driven directly. Everything the screen itself owns — the guard
 * that waits for the code/token exchange, the Firebase credential handoff and
 * the loading state — is exercised for real.
 */
const mockPromptAsync = jest.fn().mockResolvedValue({ type: 'dismiss' });
let mockResponse: any = null;

jest.mock('expo-auth-session/providers/google', () => ({
	useIdTokenAuthRequest: () => [
		{ url: 'https://accounts.google.com' },
		mockResponse,
		mockPromptAsync,
	],
}));

jest.mock('expo-web-browser', () => ({ maybeCompleteAuthSession: jest.fn() }));

jest.mock('expo-apple-authentication', () => ({
	isAvailableAsync: jest.fn().mockResolvedValue(false),
	AppleAuthenticationButton: () => null,
	AppleAuthenticationButtonType: { SIGN_IN: 0 },
	AppleAuthenticationButtonStyle: { BLACK: 0 },
	AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
	signInAsync: jest.fn(),
}));

const mockGoogleCredential = jest
	.fn()
	.mockReturnValue({ providerId: 'google.com' });
jest.mock('firebase/compat/app', () => ({
	__esModule: true,
	default: {
		auth: {
			GoogleAuthProvider: {
				credential: (...args: unknown[]) => mockGoogleCredential(...args),
			},
			OAuthProvider: class {},
		},
	},
}));
jest.mock('firebase/compat/auth', () => ({}));

const mockLogin = jest.fn().mockResolvedValue({ user: { uid: 'uid-1' } });
jest.mock('react-redux-firebase', () => ({
	useFirebase: () => ({ login: mockLogin }),
}));

jest.mock('react-redux', () => ({ useDispatch: () => jest.fn() }));

const mockHandlePostLogin = jest.fn().mockResolvedValue(undefined);
jest.mock('../store/auth/auth.service', () => ({
	handlePostLogin: (...args: unknown[]) => mockHandlePostLogin(...args),
}));

jest.mock('../common/Toast', () => ({ Toast: () => null }));

function renderLogin() {
	return render(
		<PaperProvider>
			<LoginScreen />
		</PaperProvider>
	);
}

describe('LoginScreen', () => {
	beforeEach(() => {
		mockResponse = null;
		jest.clearAllMocks();
		mockGoogleCredential.mockReturnValue({ providerId: 'google.com' });
		mockLogin.mockResolvedValue({ user: { uid: 'uid-1' } });
	});

	it('offers Google sign-in once the auth request has loaded', () => {
		const utils = renderLogin();

		expect(utils.getByText('Sign in with Google')).toBeTruthy();
	});

	it('starts the OAuth prompt when the Google button is pressed', async () => {
		const utils = renderLogin();

		fireEvent.press(utils.getByText('Sign in with Google'));

		await waitFor(() => expect(mockPromptAsync).toHaveBeenCalledTimes(1));
	});

	it('waits for the token exchange before touching Firebase', () => {
		// The first success pass carries only the authorization code; signing in
		// here would hand Firebase an empty credential.
		mockResponse = { type: 'success', params: { code: 'abc' } };

		renderLogin();

		expect(mockLogin).not.toHaveBeenCalled();
		expect(mockGoogleCredential).not.toHaveBeenCalled();
	});

	it('signs in to Firebase once the exchanged id_token arrives', async () => {
		mockResponse = {
			type: 'success',
			params: { id_token: 'id-tok', access_token: 'acc-tok' },
		};

		renderLogin();

		await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(1));

		expect(mockGoogleCredential).toHaveBeenCalledWith('id-tok', 'acc-tok');
		expect(mockLogin).toHaveBeenCalledWith({
			credential: { providerId: 'google.com' },
			provider: 'google',
		});
		await waitFor(() =>
			expect(mockHandlePostLogin).toHaveBeenCalledTimes(1)
		);
	});

	it('does not sign in when the user dismisses the prompt', () => {
		mockResponse = { type: 'dismiss' };

		renderLogin();

		expect(mockLogin).not.toHaveBeenCalled();
	});
});

import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import * as Sentry from '@sentry/react-native';
import { Toast } from '../common/Toast';
import { handlePostLogin } from '../store/auth/auth.service';
import { Theme } from '../theme';

// Lets the browser-based auth flow settle back into the app after redirect.
WebBrowser.maybeCompleteAuthSession();

const {
	GOOGLE_ANDROID_CLIENT_ID,
	GOOGLE_ANDROID_STANDALONE_CLIENT_ID,
	GOOGLE_IOS_CLIENT_ID,
	GOOGLE_IOS_STANDALONE_CLIENT_ID,
} = Constants.expoConfig?.extra ?? {};

// The old flow carried two client IDs per platform: one registered against Expo
// Go's bundle identifier and a "standalone" one against ours. This app depends
// on native modules, so it only ever runs as a dev/production build under
// com.dmcnamara.turnipbuds — the standalone IDs are the live ones. The Expo Go
// IDs stay as a fallback so an incompletely-filled app.config.ts still works.
const googleConfig = {
	iosClientId: GOOGLE_IOS_STANDALONE_CLIENT_ID || GOOGLE_IOS_CLIENT_ID,
	androidClientId:
		GOOGLE_ANDROID_STANDALONE_CLIENT_ID || GOOGLE_ANDROID_CLIENT_ID,
};

export function LoginScreen() {
	const dispatch = useDispatch();
	const fb = useFirebase();

	const [loading, setLoading] = useState(false);
	const [showAppleLogin, setShowAppleLogin] = useState(false);

	const [request, response, promptAsync] =
		Google.useIdTokenAuthRequest(googleConfig);

	useEffect(() => {
		(async () => {
			const available = await AppleAuthentication.isAvailableAsync();
			setShowAppleLogin(available);
		})();
	}, []);

	useEffect(() => {
		if (!response) {
			return;
		}

		if (response.type !== 'success') {
			// Dismissed, cancelled, or errored — drop back out of the spinner.
			setLoading(false);
			if (response.type === 'error' && response.error) {
				Sentry.captureException(response.error);
			}
			return;
		}

		// On native this fires twice: once with the raw authorization code, and
		// again once the hook has exchanged it. Only the second pass carries a
		// token we can hand to Firebase.
		const idToken = response.params?.id_token;
		if (!idToken) {
			return;
		}

		(async () => {
			try {
				const credential = firebase.auth.GoogleAuthProvider.credential(
					idToken,
					response.params?.access_token
				);

				const userData = await fb.login({
					credential,
					provider: 'google',
				});

				if (userData) {
					await handlePostLogin(dispatch, fb, userData);
				}
			} catch (e: any) {
				Sentry.captureException(e);
			} finally {
				setLoading(false);
			}
		})();
		// `fb` and `dispatch` are stable for the life of the screen.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [response]);

	async function login() {
		setLoading(true);
		await promptAsync();
	}

	async function appleLogin() {
		setLoading(true);
		try {
			const nonce = Math.random().toString(36).substring(2, 10);
			const hashedNonce = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				nonce
			);

			const credential = await AppleAuthentication.signInAsync({
				requestedScopes: [
					AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
					AppleAuthentication.AppleAuthenticationScope.EMAIL,
				],
				nonce: hashedNonce,
			});

			if (credential && credential.user && credential.identityToken) {
				const provider = new firebase.auth.OAuthProvider('apple.com');
				const fbCred = provider.credential({
					idToken: credential.identityToken,
					rawNonce: nonce,
				});

				const userData = await fb.login({ credential: fbCred });

				if (userData) {
					await handlePostLogin(dispatch, fb, userData, credential);
					setLoading(false);
				}
			}
		} catch (e: any) {
			setLoading(false);
			if (e.code !== 'ERR_CANCELED') {
				Sentry.captureException(e);
			}
		}
	}

	return (
		<View style={styles.container}>
			<Image
				source={require('../../assets/splash.png')}
				style={styles.image}
			/>
			<Button
				icon="google"
				mode="contained"
				buttonColor={Theme.colors.accent}
				onPress={login}
				loading={loading}
				disabled={!request || loading}
			>
				Sign in with Google
			</Button>
			{showAppleLogin && (
				<>
					<Text style={styles.orMargin}>OR</Text>
					<AppleAuthentication.AppleAuthenticationButton
						buttonType={
							AppleAuthentication.AppleAuthenticationButtonType
								.SIGN_IN
						}
						buttonStyle={
							AppleAuthentication.AppleAuthenticationButtonStyle
								.BLACK
						}
						cornerRadius={5}
						style={styles.appleButton}
						onPress={appleLogin}
					/>
				</>
			)}
			<Toast />
		</View>
	);
}

const styles = StyleSheet.create({
	appleButton: { height: 44, marginTop: 50, width: 200 },
	container: {
		alignItems: 'center',
		backgroundColor: Theme.colors.primary,
		flex: 1,
		justifyContent: 'center',
	},
	image: { height: 150, width: 150 },
	orMargin: { marginTop: 50 },
});

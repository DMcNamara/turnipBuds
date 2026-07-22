import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
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

export function LoginScreen() {
	const dispatch = useDispatch();
	const fb = useFirebase();

	const [loading, setLoading] = useState(false);
	const [showAppleLogin, setShowAppleLogin] = useState(false);

	useEffect(() => {
		(async () => {
			const available = await AppleAuthentication.isAvailableAsync();
			setShowAppleLogin(available);
		})();
	});

	// TODO(#108): wire Google sign-in via expo-auth-session.
	//
	// The old flow used `expo-google-app-auth`, which was removed from the Expo
	// SDK and blocks bundling, so it has been deleted here. This button is a
	// temporary disabled placeholder — the real Google sign-in migration to
	// `expo-auth-session` (and re-reading the Google client IDs from
	// `Constants.expoConfig?.extra`) is issue #108, not this navigation issue.
	function login() {
		// intentional no-op until #108
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
			{/* TODO(#108): re-enable once Google sign-in is on expo-auth-session */}
			<Button
				icon="google"
				mode="contained"
				buttonColor={Theme.colors.accent}
				onPress={login}
				loading={loading}
				disabled
			>
				Sign in with Google (coming soon)
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

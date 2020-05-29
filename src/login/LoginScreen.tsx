import * as AppleAuthentication from 'expo-apple-authentication';
import Constants from 'expo-constants';
import * as Crypto from 'expo-crypto';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import * as Sentry from 'sentry-expo';
import { Toast } from '../common/Toast';
import { handlePostLogin } from '../store/auth/auth.service';
import { Theme } from '../theme';

const {
	GOOGLE_ANDROID_CLIENT_ID,
	GOOGLE_ANDROID_STANDALONE_CLIENT_ID,
	GOOGLE_IOS_CLIENT_ID,
	GOOGLE_IOS_STANDALONE_CLIENT_ID,
} = Constants.manifest.extra;
const config: Google.GoogleLogInConfig = {
	iosClientId: GOOGLE_IOS_CLIENT_ID,
	iosStandaloneAppClientId: GOOGLE_IOS_STANDALONE_CLIENT_ID,
	androidClientId: GOOGLE_ANDROID_CLIENT_ID,
	androidStandaloneAppClientId: GOOGLE_ANDROID_STANDALONE_CLIENT_ID,
};

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

	async function login() {
		setLoading(true);
		const res = await Google.logInAsync(config);
		if (res.type === 'success') {
			const credential = firebase.auth.GoogleAuthProvider.credential(
				res.idToken,
				res.accessToken
			);

			const userData = await fb.login({ credential, provider: 'google' });

			if (userData) {
				await handlePostLogin(dispatch, fb, userData);
				setLoading(false);
			}
		}
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
		} catch (e) {
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
				color={Theme.colors.accent}
				onPress={() => login()}
				loading={loading}
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

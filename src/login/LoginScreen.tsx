import Constants from 'expo-constants';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import React from 'react';
import { Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import * as Sentry from 'sentry-expo';
import { setCurrentUserAction } from '../store/auth/auth.actions';

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

	async function login() {
		const res = await Google.logInAsync(config);
		if (res.type === 'success') {
			const credential = firebase.auth.GoogleAuthProvider.credential(
				res.idToken,
				res.accessToken
			);

			const userData = await fb.login({ credential, provider: 'google' });

			if (userData) {
				await fb
					.firestore()
					.collection('users')
					.doc(userData.user?.uid)
					.get()
					.then((profileSnap) => {
						if (!profileSnap.data() && userData.user) {
							return profileSnap.ref
								.set(userData?.user, { merge: true })
								.then(() => {
									return userData;
								});
						} else {
							return userData;
						}
					})
					.then((userData) => {
						dispatch(setCurrentUserAction(userData.user?.uid));
						Sentry.configureScope((scope) => {
							scope.setUser({
								email: userData.user?.email,
								id: userData.user?.uid,
							});
						});
					});

				await fb.reloadAuth(credential);
			}
		}
	}

	return (
		<View style={{ marginTop: 50 }}>
			<Text>Sign In With Google</Text>
			<Button onPress={() => login()}>Sign in with Google</Button>
		</View>
	);
}

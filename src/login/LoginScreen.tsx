import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import React, { useState } from 'react';
import { Button, Text, View } from 'react-native';
import {
	GOOGLE_ANDROID_CLIENT_ID,
	GOOGLE_IOS_CLIENT_ID,
} from 'react-native-dotenv';
import { useFirebase, useFirestoreConnect } from 'react-redux-firebase';

const config: Google.GoogleLogInConfig = {
	iosClientId: GOOGLE_IOS_CLIENT_ID,
	androidClientId: GOOGLE_ANDROID_CLIENT_ID,
};

export function LoginScreen() {
	const [ userId, setUserId ] = useState<string>('');

	useFirestoreConnect([
		{ collection: 'users', doc: userId, storeAs: 'currentUser' }
	  ])
	const fb = useFirebase();

	async function login() {
		const res = await Google.logInAsync(config);

		if (res.type === 'success') {
			const credential = firebase.auth.GoogleAuthProvider.credential(
				res.idToken,
				res.accessToken
			);

			const userData = await fb.auth().signInWithCredential(credential);

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
							if (userData.user) {
								setUserId(userData.user?.uid);
							}
						}
					});
			}
		}
	}

	return (
		<View style={{marginTop: 50}}>
			<Text>Sign In With Google</Text>
			<Button
				title="Sign in with Google"
				onPress={() => login()}
			/>
		</View>
	);
}

import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { actionTypes as fat } from 'redux-firestore';
import * as Sentry from 'sentry-expo';
import { setCurrentUserAction } from '../store/auth/auth.actions';

export function SettingsContainer() {
	const firebase = useFirebase();
	const dispatch = useDispatch();

	const onLogout = async () => {
		await firebase.logout().then(
			() => {
				console.log('logged out');
				dispatch({ type: fat.CLEAR_DATA, actionKey: 'data' });
				dispatch(setCurrentUserAction(null));
				Sentry.configureScope((scope) => {
					scope.setUser(null);
				});
			},
			(err) => console.log('error', err)
		);
	};

	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={{ marginTop: 50 }}
		>
			<View
				style={{
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Text>Settings Screen</Text>
				<Button onPress={onLogout}>Log Out</Button>
			</View>
		</ScrollView>
	);
}

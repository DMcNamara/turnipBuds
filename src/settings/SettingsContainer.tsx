import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Button, Paragraph } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { actionTypes as fat } from 'redux-firestore';
import { setCurrentUserAction } from '../store/auth/auth.actions';

export function SettingsContainer() {
	const firebase = useFirebase();
	const dispatch = useDispatch();
	const data = useSelector((state: any) => state.firestore);

	const onLogout = async () => {
		dispatch({ type: fat.CLEAR_DATA, actionKey: 'data' });
		dispatch(setCurrentUserAction(null));
		await firebase.logout().then(
			() => {
				console.log('logged out');
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
				<Paragraph>{JSON.stringify(data, null, 2)}</Paragraph>
			</View>
		</ScrollView>
	);
}

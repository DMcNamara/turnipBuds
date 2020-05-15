import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { actionTypes as fat } from 'redux-firestore';
import * as Sentry from 'sentry-expo';
import { BannerAd } from '../common/ads/BannerAd';
import { setCurrentUserAction } from '../store/auth/auth.actions';
import { HeaderTheme } from '../theme';

export type SettingsContainerScreenList = {
	Settings: { uid: string };
};
const Stack = createStackNavigator<SettingsContainerScreenList>();
export function SettingsContainer() {
	return (
		<Stack.Navigator
			screenOptions={{
				...HeaderTheme,
			}}
		>
			<Stack.Screen name="Settings" component={Settings} />
		</Stack.Navigator>
	);
}

function Settings() {
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
				<Button icon="logout" mode="contained" onPress={onLogout}>
					Log Out
				</Button>
				<BannerAd style={{ marginTop: 25 }} />
			</View>
		</ScrollView>
	);
}

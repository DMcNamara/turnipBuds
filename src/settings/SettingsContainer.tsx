import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Clipboard, StyleSheet, View } from 'react-native';
import { Button, Caption, Card, IconButton, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { actionTypes as fat } from 'redux-firestore';
import * as Sentry from 'sentry-expo';
import { BannerAd } from '../common/ads/BannerAd';
import { Toast } from '../common/Toast';
import { setCurrentUserAction } from '../store/auth/auth.actions';
import { toastAction } from '../store/toast/toast.actions';
import { HeaderTheme } from '../theme';

export type SettingsContainerScreenList = {
	Settings: { uid: string };
};
const Stack = createStackNavigator<SettingsContainerScreenList>();
export function SettingsContainer() {
	return (
		<>
			<Stack.Navigator
				screenOptions={{
					...HeaderTheme,
				}}
			>
				<Stack.Screen name="Settings" component={Settings} />
			</Stack.Navigator>
			<Toast />
		</>
	);
}

function Settings() {
	const firebase = useFirebase();
	const dispatch = useDispatch();
	const user = firebase.auth().currentUser;

	const copyEmail = () => {
		if (user?.email) {
			Clipboard.setString(user?.email || '');
			dispatch(toastAction('Email Copied!'));
		}
	};
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
		<View style={styles.container}>
			<Card style={styles.card}>
				<Card.Title title="User Info"></Card.Title>
				<Card.Content>
					<Text>Name:</Text>
					<Caption>{user?.displayName}</Caption>

					<Text>Email:</Text>
					<View style={styles.inline}>
						<Caption style={styles.email}>{user?.email}</Caption>
						<IconButton
							style={styles.icon}
							icon="content-copy"
							onPress={copyEmail}
							size={16}
						/>
					</View>
				</Card.Content>
			</Card>
			<Button icon="logout" mode="contained" onPress={onLogout}>
				Log Out
			</Button>

			<BannerAd style={styles.bannerMargin} />
		</View>
	);
}

const styles = StyleSheet.create({
	bannerMargin: { marginTop: 25 },
	card: { marginBottom: 12 },
	container: {
		margin: 12,
	},
	email: {
		width: '75%',
	},
	icon: { width: '24%' },
	inline: {
		alignItems: 'center',
		flexDirection: 'row',
	},
});

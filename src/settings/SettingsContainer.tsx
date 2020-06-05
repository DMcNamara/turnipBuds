import { createStackNavigator } from '@react-navigation/stack';
import timezones from 'compact-timezone-list';
import React, { useState } from 'react';
import { Clipboard, Linking, StyleSheet, View } from 'react-native';
import { Button, Caption, Card, IconButton, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useFirebase } from 'react-redux-firebase';
import { actionTypes as fat } from 'redux-firestore';
import * as Sentry from 'sentry-expo';
import { BannerAd } from '../common/ads/BannerAd';
import { Toast } from '../common/Toast';
import { useTypedSelector } from '../store';
import { setCurrentUserAction } from '../store/auth/auth.actions';
import { User } from '../store/collections';
import { toastAction } from '../store/toast/toast.actions';
import { HeaderTheme } from '../theme';
import { TimeZoneModal } from './TimezoneModal';

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
	const [tzModalVisible, setTzModalVisibile] = useState(false);
	const user = firebase.auth().currentUser;
	const userProfile = useTypedSelector<User | undefined>(
		(state) => state.firestore.data.profile
	);

	const copyEmail = () => {
		if (user?.email) {
			Clipboard.setString(user?.email || '');
			dispatch(toastAction('Email Copied!'));
		}
	};

	const onLogout = async () => {
		return firebase.logout().then(
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

	const timeZoneDisplay = (tzCode: string | undefined) => {
		if (tzCode) {
			const timeZone = timezones.find((tz: any) => tz.tzCode === tzCode);
			return timeZone.label || '-';
		} else {
			return '-';
		}
	};

	const updateUser = async (user: Partial<User>) => {
		setTzModalVisibile(false);
		return firebase.updateProfile(user, { merge: true });
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
						<Caption style={styles.inlineData}>
							{user?.email}
						</Caption>
						<IconButton
							style={styles.inlineIcon}
							icon="content-copy"
							onPress={copyEmail}
							size={16}
						/>
					</View>

					<Text>Island Time Zone:</Text>
					<View style={styles.inline}>
						<Caption style={styles.inlineData}>
							{timeZoneDisplay(userProfile?.timezone)}
						</Caption>
						<IconButton
							style={styles.inlineIcon}
							icon="pencil"
							onPress={() => setTzModalVisibile(true)}
							size={16}
						/>
					</View>
				</Card.Content>
			</Card>
			<Card style={styles.card}>
				<Card.Title title="Feedback, bugs or just want to connect?" />
				<Card.Content>
					<Button
						icon="discord"
						mode="outlined"
						onPress={() =>
							Linking.openURL('https://discord.gg/3WTnPhs')
						}
						style={styles.buttonMargin}
					>
						Join the Discord
					</Button>
					<Button
						icon="email"
						mode="outlined"
						onPress={() =>
							Linking.openURL('mailto:turnip.buds.app@gmail.com')
						}
						style={styles.buttonMargin}
					>
						Send an Email
					</Button>
				</Card.Content>
			</Card>
			<Button icon="logout" mode="contained" onPress={onLogout}>
				Log Out
			</Button>

			<BannerAd style={styles.bannerMargin} />
			<TimeZoneModal
				currentTimeZone={userProfile?.timezone}
				visible={tzModalVisible}
				onHide={() => setTzModalVisibile(false)}
				onSave={(tz) => updateUser({ timezone: tz })}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	bannerMargin: { marginTop: 20 },
	buttonMargin: { marginTop: 12 },
	card: { marginBottom: 12 },
	container: {
		margin: 12,
	},
	inline: {
		alignItems: 'center',
		flexDirection: 'row',
	},
	inlineData: {
		width: '75%',
	},
	inlineIcon: { width: '24%' },
});

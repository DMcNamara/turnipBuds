/* eslint-disable react/display-name */
import { MaterialIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Platform } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import {
	ReactReduxFirebaseProvider,
	useFirestoreConnect,
} from 'react-redux-firebase';
import { PersistGate } from 'redux-persist/integration/react';
import './src/common/sentry';
import { FriendsContainer } from './src/friends/FriendsContainer';
import { HomeContainer } from './src/home/HomeContainer';
import { LoginScreen } from './src/login/LoginScreen';
import { SettingsContainer } from './src/settings/SettingsContainer';
import { persistor, rrfProps, store, useTypedSelector } from './src/store';
import { Theme } from './src/theme';

export type TabsScreenList = {
	Me: { uid: string };
	Friends: { uid: string };
	Settings: {};
};
const Tab = createMaterialBottomTabNavigator<TabsScreenList>();
function Tabs(props: { uid: string }) {
	useFirestoreConnect([
		{ collection: 'users', doc: props.uid, storeAs: 'profile' },
	]);

	return (
		<NavigationContainer theme={Theme}>
			<Tab.Navigator
				shifting={true}
				keyboardHidesNavigationBar={Platform.OS === 'android'}
			>
				<Tab.Screen
					name="Me"
					component={HomeContainer}
					options={{
						tabBarLabel: 'My Week',
						tabBarIcon: () => (
							<MaterialIcons name="attach-money" size={26} />
						),
					}}
					initialParams={{ uid: props.uid }}
				/>
				<Tab.Screen
					name="Friends"
					component={FriendsContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name="people" size={26} />
						),
					}}
					initialParams={{ uid: props.uid }}
				/>
				<Tab.Screen
					name="Settings"
					component={SettingsContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name="settings" size={26} />
						),
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}

function Navigation() {
	const uid = useTypedSelector(({ auth }) => auth.currentUID);
	return !!uid ? <Tabs uid={uid} /> : <LoginScreen />;
}

export default function App() {
	return (
		<Provider store={store}>
			<ReactReduxFirebaseProvider {...rrfProps}>
				<PersistGate loading={null} persistor={persistor}>
					<PaperProvider theme={Theme}>
						<Navigation />
					</PaperProvider>
				</PersistGate>
			</ReactReduxFirebaseProvider>
		</Provider>
	);
}
